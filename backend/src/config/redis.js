import { createClient } from 'redis'
import { env } from './env.js'
import logger from './logger.js'

const createRedisClient = (label) => {
  const client = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 20) {
          logger.error(`Redis [${label}]: too many retries, giving up`)
          return new Error('Redis retry limit exceeded')
        }
        const delay = Math.min(retries * 200, 30_000)
        logger.warn(`Redis [${label}]: reconnecting in ${delay}ms (attempt ${retries})`)
        return delay
      },
    },
  })

  client.on('connect', () => logger.info(`Redis [${label}]: connected`))
  client.on('ready',   () => logger.info(`Redis [${label}]: ready`))
  client.on('error',   (err) => logger.error(`Redis [${label}]: ${err.message}`))
  client.on('end',     () => logger.warn(`Redis [${label}]: connection closed`))

  return client
}

export const redisClient = createRedisClient('main')
export const pubClient   = createRedisClient('pub')
export const subClient   = createRedisClient('sub')

export const connectRedis = async () => {
  try {
    await Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect(),
    ])
    logger.info('Redis: all clients connected')
  } catch (err) {
    logger.error(`Redis: failed to connect — ${err.message}`)
    process.exit(1)
  }
}

export const isRedisReady = () => redisClient.isOpen