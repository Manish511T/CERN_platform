import { getSocketId } from '../socket.manager.js'
import { SOCKET_EVENTS } from '../../shared/constants.js'
import logger from '../../config/logger.js'

export const registerTrackingHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.VOLUNTEER_LOCATION, async (data) => {
    const { sosId, latitude, longitude, toUserId } = data || {}

    // Validate all required fields
    if (!sosId || latitude == null || longitude == null || !toUserId) {
      logger.debug({ event: 'tracking_invalid_payload', data })
      return
    }

    try {
      const targetSocketId = await getSocketId(toUserId.toString())

      if (targetSocketId) {
        // Relay location to victim
        io.to(targetSocketId).emit(SOCKET_EVENTS.LOCATION_UPDATE, {
          sosId,
          latitude,
          longitude,
          volunteerId: socket.user._id.toString(),
          volunteerName: socket.user.name,
          timestamp: Date.now(),
        })
        logger.debug({
          event: 'location_relayed',
          from: socket.user._id,
          to: toUserId,
          sosId,
        })
      } else {
        logger.debug({
          event: 'location_relay_target_offline',
          toUserId,
          sosId,
        })
      }
    } catch (err) {
      logger.error({ event: 'tracking_relay_error', err: err.message })
    }
  })
}