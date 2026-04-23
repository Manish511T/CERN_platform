import { redisClient, isRedisReady } from '../config/redis.js'
import logger from '../config/logger.js'

const SOCKET_PREFIX  = 'socket:'
const SOCKET_TTL     = 7200  // 2 hours

// In-memory fallback
const localMap = new Map()

// Always convert to string — handles ObjectId, string, or number
const normalizeId = (userId) => {
  if (!userId) throw new Error('userId is required for socket registration')
  return userId.toString().trim()
}

export const registerSocket = async (userId, socketId) => {
  const key = normalizeId(userId)

  if (isRedisReady()) {
    await redisClient.setEx(`${SOCKET_PREFIX}${key}`, SOCKET_TTL, socketId)
    logger.debug({ event: 'socket_registered_redis', userId: key, socketId })
  } else {
    localMap.set(key, socketId)
    logger.debug({ event: 'socket_registered_local', userId: key, socketId })
  }
}

export const getSocketId = async (userId) => {
  const key = normalizeId(userId)

  if (isRedisReady()) {
    const result = await redisClient.get(`${SOCKET_PREFIX}${key}`)
    logger.debug({ event: 'socket_lookup', userId: key, found: !!result, socketId: result })
    return result
  }

  const result = localMap.get(key) ?? null
  logger.debug({ event: 'socket_lookup_local', userId: key, found: !!result })
  return result
}

export const removeSocket = async (userId) => {
  const key = normalizeId(userId)

  if (isRedisReady()) {
    await redisClient.del(`${SOCKET_PREFIX}${key}`)
  } else {
    localMap.delete(key)
  }

  logger.debug({ event: 'socket_removed', userId: key })
}

export const countOnlineSockets = async () => {
  if (isRedisReady()) {
    const keys = await redisClient.keys(`${SOCKET_PREFIX}*`)
    return keys.length
  }
  return localMap.size
}

// Debug: list all online users
export const listOnlineSockets = async () => {
  if (isRedisReady()) {
    const keys = await redisClient.keys(`${SOCKET_PREFIX}*`)
    const pairs = {}
    for (const key of keys) {
      const val = await redisClient.get(key)
      pairs[key.replace(SOCKET_PREFIX, '')] = val
    }
    return pairs
  }
  return Object.fromEntries(localMap)
}