import mongoose from 'mongoose'
import { env } from './env.js'
import logger from './logger.js'

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI)
    logger.info('MongoDB: connected')
  } catch (err) {
    logger.error(`MongoDB: connection failed — ${err.message}`)
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB: disconnected')
  })

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB: reconnected')
  })
}