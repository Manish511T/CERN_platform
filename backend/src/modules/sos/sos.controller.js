import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as sosService from './sos.service.js'
import * as notificationService from '../notification/notification.service.js'
import { getIO } from '../../socket/index.js'
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

  // ── DEBUG: Print exactly what we found ─────────────────────────────────────
  console.log('\n========== SOS DISPATCH DEBUG ==========')
  console.log('SOS ID:', sos._id.toString())
  console.log('Source:', source)
  console.log('Volunteers found:', volunteers.length)
  volunteers.forEach((v, i) => {
    console.log(`  Volunteer[${i}]: id=${v._id} name=${v.name} isOnDuty=${v.isOnDuty}`)
  })

  const io = getIO()
  const offlineVolunteers = []
  let socketNotified = 0

  for (const vol of volunteers) {
    const volId    = vol._id.toString()
    const socketId = await getSocketId(volId)

    console.log(`  Socket lookup: userId=${volId} → socketId=${socketId}`)

    if (socketId) {
      const payload = {
        sosId:         sos._id,
        emergencyType: sos.emergencyType,
        location:      sos.location,
        photoUrl:      sos.photoUrl,
        triggeredBy:   { name: req.user.name },
        isVolunteer:   true,
      }
      io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, payload)
      socketNotified++
      console.log(`  ✅ Socket emitted to ${vol.name} (${socketId})`)
    } else {
      offlineVolunteers.push(vol)
      console.log(`  ❌ No socket for ${vol.name} — will try push`)
    }
  }

  console.log(`Total: ${socketNotified} via socket, ${offlineVolunteers.length} offline`)
  console.log('=========================================\n')

  // nearby users
  for (const user of nearbyUsers) {
    const socketId = await getSocketId(user._id.toString())
    if (socketId) {
      io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, {
        sosId:         sos._id,
        emergencyType: sos.emergencyType,
        location:      sos.location,
        photoUrl:      sos.photoUrl,
        triggeredBy:   { name: req.user.name },
        isVolunteer:   false,
      })
    }
  }

  if (offlineVolunteers.length) {
    notificationService.notifyVolunteers(offlineVolunteers, {
      sosId:         sos._id,
      emergencyType: sos.emergencyType,
      location:      sos.location,
    }).catch(err => logger.error({ event: 'push_notify_failed', err: err.message }))
  }

  sendCreated(res, {
    sosId:              sos._id,
    escalationSource:   source,
    notifiedVolunteers: volunteers.length,
    socketNotified,
    pushNotified:       offlineVolunteers.length,
  })
})

export const acceptSOS = asyncHandler(async (req, res) => {
  const { sos, victim } = await sosService.acceptSOS({
    sosId:       req.params.sosId,
    volunteerId: req.user._id,
  })

  const victimSocketId = await getSocketId(victim.id.toString())

  console.log('=== ACCEPT SOS DEBUG ===')
  console.log('victim.victimLocation:', JSON.stringify(victim.victimLocation))
  console.log('victimSocketId:', victimSocketId)

  if (victimSocketId) {
    getIO().to(victimSocketId).emit(SOCKET_EVENTS.SOS_ACCEPTED, {
      sosId:          sos._id,
      volunteerId:    req.user._id,
      volunteerName:  req.user.name,
      openMap:        true,
      victimLocation: victim.victimLocation,  // ← send the full object
    })
  }

  if (!victimSocketId) {
    notificationService.notifyVictimAccepted(victim.id, req.user.name, sos._id)
      .catch(err => logger.error({ event: 'victim_push_failed', err: err.message }))
  }

  sendSuccess(res, {
    victimId:       victim.id,
    victimName:     victim.name,
    victimPhone:    victim.phone,
    victimLocation: victim.victimLocation,   // ← consistent with socket
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