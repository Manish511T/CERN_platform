import { redisClient, isRedisReady } from '../config/redis.js'
import logger from '../config/logger.js'

const SOCKET_PREFIX = 'socket:'
const SOCKET_TTL = 3600

const localMap = new Map()

export const registerSocket = async (userId, socketId) => {
  if (isRedisReady()) {
    await redisClient.setEx(`${SOCKET_PREFIX}${userId}`, SOCKET_TTL, socketId)
  } else {
    localMap.set(String(userId), socketId)
  }
  logger.debug({ event: 'socket_registered', userId, socketId })
}

export const getSocketId = async (userId) => {
  if (isRedisReady()) {
    return redisClient.get(`${SOCKET_PREFIX}${userId}`)
  }
  return localMap.get(String(userId)) ?? null
}

export const removeSocket = async (userId) => {
  if (isRedisReady()) {
    await redisClient.del(`${SOCKET_PREFIX}${userId}`)
  } else {
    localMap.delete(String(userId))
  }
  logger.debug({ event: 'socket_removed', userId })
}

export const countOnlineSockets = async () => {
  if (isRedisReady()) {
    const keys = await redisClient.keys(`${SOCKET_PREFIX}*`)
    return keys.length
  }
  return localMap.size
}