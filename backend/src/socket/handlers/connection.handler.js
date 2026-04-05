import { registerSocket, removeSocket } from '../socket.manager.js'
import { SOCKET_EVENTS, ROLES } from '../../shared/constants.js'
import logger from '../../config/logger.js'

export const registerConnectionHandler = (io, socket) => {
  const userId = socket.user._id.toString()

  registerSocket(userId, socket.id)
  logger.info({ event: 'socket_connected', userId, socketId: socket.id })

  socket.on('disconnect', async (reason) => {
    await removeSocket(userId)
    logger.info({ event: 'socket_disconnected', userId, reason })

    if (socket.user.role === ROLES.VOLUNTEER) {
      socket.broadcast.emit(SOCKET_EVENTS.VOLUNTEER_OFFLINE, { volunteerId: userId })
    }
  })
}