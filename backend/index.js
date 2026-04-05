import http from 'http'
import app from './app.js'
import { connectDB } from './src/config/db.js'
import { connectRedis } from './src/config/redis.js'
import { initSocket } from './src/socket/index.js'
import { initEscalationQueue } from './src/queues/escalation.queue.js'
import { env } from './src/config/env.js'
import logger from './src/config/logger.js'

const bootstrap = async () => {
  await connectDB()
  await connectRedis()

  const server = http.createServer(app)

  await initSocket(server)
  initEscalationQueue()

  server.listen(env.PORT, () => {
    logger.info(`🚀 CERN backend running on port ${env.PORT} [${env.NODE_ENV}]`)
  })

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`)
    server.close(() => process.exit(0))
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

bootstrap().catch(err => {
  console.error('Failed to start:', err)
  process.exit(1)
})