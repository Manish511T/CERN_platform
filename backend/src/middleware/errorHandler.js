import { env } from '../config/env.js'
import logger from '../config/logger.js'

const errorHandler = (err, req, res, next) => {
  // Known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    })
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ')
    return res.status(400).json({ success: false, error: message, code: 'VALIDATION_ERROR' })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      success: false,
      error: `${field} is already in use`,
      code: 'CONFLICT',
    })
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token', code: 'UNAUTHORIZED' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' })
  }

  // Unknown — log and hide details in production
  logger.error({ err, method: req.method, url: req.url })

  return res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  })
}

export default errorHandler