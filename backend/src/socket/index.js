import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { pubClient, subClient, isRedisReady } from '../config/redis.js'
import socketMiddleware from './socket.middleware.js'
import { registerConnectionHandler } from './handlers/connection.handler.js'
import { registerTrackingHandler } from './handlers/tracking.handler.js'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

let io = null

export const initSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      env.CLIENT_URL,
      credentials: true,
    },
    transports:    ['websocket', 'polling'],
    pingTimeout:   20_000,
    pingInterval:  10_000,
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
  })

  logger.info('Socket.io: initialized')
  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}