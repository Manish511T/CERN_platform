import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as sosService from './sos.service.js'
import * as notificationService from '../notification/notification.service.js'
import { getIO }      from '../../socket/index.js'
import { getSocketId } from '../../socket/socket.manager.js'
import { SOCKET_EVENTS } from '../../shared/constants.js'
import logger from '../../config/logger.js'

export const triggerSOS = asyncHandler(async (req, res) => {
  const { latitude, longitude, forSelf, emergencyType, address } = req.body
  const photoUrl     = req.files?.photo?.[0]?.path ?? null
  const voiceNoteUrl = req.files?.voice?.[0]?.path ?? null

  const { sos, volunteers, nearbyUsers, source } = await sosService.triggerSOS({
    userId: req.user._id,
    latitude, longitude, forSelf, emergencyType,
    address, photoUrl, voiceNoteUrl,
  })

  const io = getIO()

  // ── Volunteer payload ─────────────────────────────────────────────────────
  const volunteerPayload = {
    sosId:         sos._id,
    emergencyType: sos.emergencyType,
    location:      sos.location,
    photoUrl:      sos.photoUrl,
    triggeredBy:   { name: req.user.name },
    isVolunteer:   true,
    type:          'rescue',   // volunteer knows this is a rescue request
  }

  // ── Nearby user payload ───────────────────────────────────────────────────
  const userPayload = {
    sosId:         sos._id,
    emergencyType: sos.emergencyType,
    location:      sos.location,
    photoUrl:      sos.photoUrl,
    triggeredBy:   { name: req.user.name },
    isVolunteer:   false,
    type:          'firstaid',  // user knows this is a first aid request
    message:       'Someone nearby needs immediate first aid help!',
  }

  // ── Dispatch to volunteers ────────────────────────────────────────────────
  const offlineVolunteers = []
  let socketNotified = 0

  console.log('\n========== SOS DISPATCH ==========')
  console.log(`SOS: ${sos._id} | Type: ${emergencyType} | Source: ${source}`)
  console.log(`Volunteers: ${volunteers.length} | Nearby users: ${nearbyUsers.length}`)

  for (const vol of volunteers) {
    const socketId = await getSocketId(vol._id.toString())
    console.log(`  Vol ${vol.name} (${vol._id}) → socketId: ${socketId || 'OFFLINE'}`)

    if (socketId) {
      io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, volunteerPayload)
      socketNotified++
    } else {
      offlineVolunteers.push(vol)
    }
  }

  // ── Dispatch to nearby users (first aid) ──────────────────────────────────
  let nearbyNotified = 0
  for (const user of nearbyUsers) {
    const socketId = await getSocketId(user._id.toString())
    console.log(`  User ${user.name} (${user._id}) → socketId: ${socketId || 'OFFLINE'}`)

    if (socketId) {
      io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, userPayload)
      nearbyNotified++
    }
  }

  console.log(`Dispatched: ${socketNotified} vols (socket) + ${nearbyNotified} users (socket)`)
  console.log('===================================\n')

  // ── Push notifications for offline volunteers ─────────────────────────────
  if (offlineVolunteers.length) {
    notificationService.notifyVolunteers(offlineVolunteers, volunteerPayload)
      .catch(err => logger.error({ event: 'push_failed', err: err.message }))
  }

  sendCreated(res, {
    sosId:              sos._id,
    escalationSource:   source,
    notifiedVolunteers: volunteers.length,
    notifiedNearbyUsers: nearbyUsers.length,
    socketNotified,
    nearbyNotified,
  })
})

export const acceptSOS = asyncHandler(async (req, res) => {
  const { sos, victim } = await sosService.acceptSOS({
    sosId:       req.params.sosId,
    volunteerId: req.user._id,
  })

  const io = getIO()

  // ── Notify victim ─────────────────────────────────────────────────────────
  const victimSocketId = await getSocketId(victim.id.toString())
  if (victimSocketId) {
    io.to(victimSocketId).emit(SOCKET_EVENTS.SOS_ACCEPTED, {
      sosId:          sos._id,
      volunteerId:    req.user._id,
      volunteerName:  req.user.name,
      openMap:        true,
      victimLocation: victim.victimLocation,
    })
  }

  // ── Notify nearby users that help is coming (dismiss their alert) ─────────
  // Find all users who were notified and tell them volunteer accepted
  const { nearbyUsers } = await sosService.findDispatchTargets(
    sos.location.coordinates,
    victim.id
  )

  for (const user of nearbyUsers) {
    const socketId = await getSocketId(user._id.toString())
    if (socketId) {
      io.to(socketId).emit(SOCKET_EVENTS.SOS_VOLUNTEER_ASSIGNED, {
        sosId:         sos._id,
        volunteerName: req.user.name,
        message:       `A volunteer (${req.user.name}) has accepted this emergency.`,
      })
    }
  }

  if (!victimSocketId) {
    notificationService.notifyVictimAccepted(victim.id, req.user.name, sos._id)
      .catch(err => logger.error({ event: 'victim_push_failed', err: err.message }))
  }

  sendSuccess(res, {
    victimId:       victim.id,
    victimName:     victim.name,
    victimPhone:    victim.phone,
    victimLocation: victim.victimLocation,
  })
})

export const updateStatus = asyncHandler(async (req, res) => {
  const sos = await sosService.updateStatus({
    sosId:  req.params.sosId,
    userId: req.user._id,
    status: req.body.status,
  })
  sendSuccess(res, { sos })
})

export const getHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await sosService.getHistory({
    userId: req.user._id,
    role:   req.user.role,
    page:   Number(page)  || 1,
    limit:  Number(limit) || 20,
  })
  sendSuccess(res, result)
})

export const getActive = asyncHandler(async (req, res) => {
  const { role, branchId } = req.user
  const records = await sosService.getActiveSOSList(
    role === 'branch_admin' ? branchId : null
  )
  sendSuccess(res, { records })
})