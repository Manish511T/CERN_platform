import { getSocketId } from '../socket.manager.js'
import { SOCKET_EVENTS } from '../../shared/constants.js'
import logger from '../../config/logger.js'

export const registerTrackingHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.VOLUNTEER_LOCATION, async ({ sosId, latitude, longitude, toUserId }) => {
    if (!sosId || latitude == null || longitude == null || !toUserId) return

    const targetSocketId = await getSocketId(toUserId.toString())

    if (targetSocketId) {
      io.to(targetSocketId).emit(SOCKET_EVENTS.LOCATION_UPDATE, {
        sosId,
        latitude,
        longitude,
        volunteerId: socket.user._id,
        timestamp:   Date.now(),
      })
    } else {
      logger.debug({ event: 'tracking_target_offline', toUserId, sosId })
    }
  })
}