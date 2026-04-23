import { registerSocket, removeSocket, listOnlineSockets } from '../socket.manager.js'
import { SOCKET_EVENTS, ROLES } from '../../shared/constants.js'
import logger from '../../config/logger.js'

export const registerConnectionHandler = (io, socket) => {
  // socket.user is set by socket.middleware.js (JWT verified)
  const userId = socket.user._id.toString()
  const role   = socket.user.role
  const name   = socket.user.name

  // Register immediately — no separate 'register' event needed
  registerSocket(userId, socket.id).then(async () => {
    const online = await listOnlineSockets()
    logger.info({
      event:    'socket_connected',
      userId,
      name,
      role,
      socketId: socket.id,
      totalOnline: Object.keys(online).length,
      onlineUsers: online,
    })
  })

  socket.on('disconnect', async (reason) => {
    await removeSocket(userId)

    logger.info({
      event:    'socket_disconnected',
      userId,
      name,
      role,
      reason,
    })

    if (role === ROLES.VOLUNTEER) {
      socket.broadcast.emit(SOCKET_EVENTS.VOLUNTEER_OFFLINE, {
        volunteerId: userId,
      })
    }
  })

  // Ping-pong to keep connection alive
  socket.on('ping', () => {
    socket.emit('pong', { userId, timestamp: Date.now() })
  })
}