import { Server }            from 'socket.io'
import { createAdapter }     from '@socket.io/redis-adapter'
import { pubClient, subClient, isRedisReady } from '../config/redis.js'
import socketMiddleware      from './socket.middleware.js'
import { registerConnectionHandler } from './handlers/connection.handler.js'
import { registerTrackingHandler }   from './handlers/tracking.handler.js'
import { allowedOrigins }    from '../config/env.js'
import { registerSocket }    from './socket.manager.js'
import logger from '../config/logger.js'

let io = null

export const initSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      allowedOrigins,
      credentials: true,
    },
    transports:            ['websocket', 'polling'],
    pingTimeout:           60_000,   // 60s before declaring dead
    pingInterval:          25_000,   // ping every 25s
    upgradeTimeout:        30_000,
    allowUpgrades:         true,
    connectTimeout:        45_000,
  })

  if (isRedisReady()) {
    io.adapter(createAdapter(pubClient, subClient))
    logger.info('Socket.io: Redis adapter attached')
  } else {
    logger.warn('Socket.io: running without Redis adapter')
  }

  io.use(socketMiddleware)

  io.on('connection', (socket) => {
    registerConnectionHandler(io, socket)
    registerTrackingHandler(io, socket)

    // Refresh socket registration every 30 minutes
    // Prevents TTL expiry for long-lived connections
    const refreshInterval = setInterval(async () => {
      if (socket.connected && socket.user?._id) {
        await registerSocket(socket.user._id.toString(), socket.id)
      }
    }, 30 * 60 * 1000)

    socket.on('disconnect', () => {
      clearInterval(refreshInterval)
    })
  })

  logger.info('Socket.io: initialized')
  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}