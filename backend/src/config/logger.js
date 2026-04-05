import winston from 'winston'
import { env } from './env.js'

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            const metaStr = Object.keys(meta).length
              ? '\n' + JSON.stringify(meta, null, 2)
              : ''
            const stackStr = stack ? '\n' + stack : ''
            return `${timestamp} [${level}]: ${message || JSON.stringify(meta)}${metaStr}${stackStr}`
          })
        )
  ),
  transports: [new winston.transports.Console()],
})

export default logger