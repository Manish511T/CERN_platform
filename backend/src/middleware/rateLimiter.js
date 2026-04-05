import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient, isRedisReady } from '../config/redis.js'

const createLimiter = ({ windowMs, max, message, keyPrefix }) => {
  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: message, code: 'RATE_LIMITED' },

    // Use userId when authenticated, properly handled IPv6 IP as fallback
    keyGenerator: (req) => {
      const userId = req.user?._id?.toString()
      return userId ? `${keyPrefix}:${userId}` : ipKeyGenerator(req)
    },
  }

  if (isRedisReady()) {
    options.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(...args),
      prefix: `rl:${keyPrefix}:`,
    })
  }

  return rateLimit(options)
}

const rateLimiter = {
  sos: createLimiter({
    windowMs: 60_000,
    max: 3,
    message: 'Too many SOS requests. Please wait.',
    keyPrefix: 'sos',
  }),

  auth: createLimiter({
    windowMs: 15 * 60_000,
    max: 20,
    message: 'Too many attempts. Try again in 15 minutes.',
    keyPrefix: 'auth',
  }),

  api: createLimiter({
    windowMs: 60_000,
    max: 120,
    message: 'Too many requests.',
    keyPrefix: 'api',
  }),
}

export default rateLimiter