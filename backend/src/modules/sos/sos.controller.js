import asyncHandler from '../../utils/asyncHandler.js'
import { sendSuccess, sendCreated } from '../../utils/response.utils.js'
import * as sosService from './sos.service.js'
import { getIO } from '../../socket/index.js'
import { getSocketId } from '../../socket/socket.manager.js'
import { SOCKET_EVENTS, ROLES } from '../../shared/constants.js'
import logger from '../../config/logger.js'

export const triggerSOS = asyncHandler(async (req, res) => {
  const { latitude, longitude, forSelf, emergencyType, address } = req.body

  // Files uploaded via Cloudinary middleware
  const photoUrl    = req.files?.photo?.[0]?.path ?? null
  const voiceNoteUrl = req.files?.voice?.[0]?.path ?? null

  const { sos, volunteers, nearbyUsers, source } = await sosService.triggerSOS({
    userId: req.user._id,
    latitude,
    longitude,
    forSelf,
    emergencyType,
    address,
    photoUrl,
    voiceNoteUrl,
  })

  // ── Socket dispatch ───────────────────────────────────────────────────────
  const io = getIO()
  const payload = {
    sosId:        sos._id,
    emergencyType: sos.emergencyType,
    location:     sos.location,
    photoUrl:     sos.photoUrl,
    triggeredBy:  { name: req.user.name },
  }

  let socketNotified = 0

  for (const vol of volunteers) {
    const socketId = await getSocketId(vol._id.toString())
    if (socketId) {
      io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, {
        ...payload,
        isVolunteer: true,
      })
      socketNotified++
    }
  }

  for (const user of nearbyUsers) {
    const socketId = await getSocketId(user._id.toString())
    if (socketId) {
      io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, {
        ...payload,
        isVolunteer: false,
      })
    }
  }

  logger.info({
    event: 'sos_dispatched',
    sosId: sos._id,
    socketNotified,
    source,
  })

  sendCreated(res, {
    sosId:              sos._id,
    escalationSource:   source,
    notifiedVolunteers: volunteers.length,
    socketNotified,
  })
})

export const acceptSOS = asyncHandler(async (req, res) => {
  const { sos, victim } = await sosService.acceptSOS({
    sosId:       req.params.sosId,
    volunteerId: req.user._id,
  })

  // Notify victim via socket that help is coming
  const victimSocketId = await getSocketId(victim.id.toString())

  if (victimSocketId) {
    getIO().to(victimSocketId).emit(SOCKET_EVENTS.SOS_ACCEPTED, {
      sosId:         sos._id,
      volunteerId:   req.user._id,
      volunteerName: req.user.name,
      openMap:       true,
      victimLocation: victim.location,
    })
  }

  sendSuccess(res, {
    victimId:       victim.id,
    victimName:     victim.name,
    victimPhone:    victim.phone,
    victimLocation: victim.location,
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
  const records = await sosService.getActiveSOSList()
  sendSuccess(res, { records })
})