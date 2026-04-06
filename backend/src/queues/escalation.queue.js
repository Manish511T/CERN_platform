import { Queue, Worker, QueueEvents } from 'bullmq'
import { isRedisReady } from '../config/redis.js'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

let queue  = null
let worker = null

const QUEUE_NAME = 'sos-escalation'

const getConnection = () => {
  const url = new URL(env.REDIS_URL)
  return {
    host:     url.hostname,
    port:     Number(url.port) || 6379,
    password: url.password || undefined,
    tls:      env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
  }
}

export const initEscalationQueue = () => {
  if (!isRedisReady()) {
    logger.warn('Escalation queue: Redis not available — disabled')
    return
  }

  const connection = getConnection()

  queue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail:     500,
      attempts:         2,
      backoff: { type: 'fixed', delay: 5000 },
    },
  })

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { sosId } = job.data
      logger.info({ event: 'escalation_job_start', sosId, jobId: job.id })

      const { escalateSOS }  = await import('../modules/sos/sos.service.js')
      const { getIO }        = await import('../socket/index.js')
      const { getSocketId }  = await import('../socket/socket.manager.js')
      const { SOCKET_EVENTS } = await import('../shared/constants.js')

      const result = await escalateSOS(sosId)
      if (!result) return

      if (result.volunteers?.length) {
        const io = getIO()
        for (const vol of result.volunteers) {
          const socketId = await getSocketId(vol._id.toString())
          if (socketId) {
            io.to(socketId).emit(SOCKET_EVENTS.SOS_ALERT, {
              sosId,
              escalationLevel: result.nextLevel,
              isVolunteer:     true,
            })
          }
        }
      }
    },
    { connection, concurrency: 10 }
  )

  worker.on('failed', (job, err) => {
    logger.error({ event: 'escalation_job_failed', jobId: job?.id, err: err.message })
  })

  const queueEvents = new QueueEvents(QUEUE_NAME, { connection })
  queueEvents.on('completed', ({ jobId }) => {
    logger.info({ event: 'escalation_job_completed', jobId })
  })

  logger.info('Escalation queue: initialized')
}

export const scheduleEscalation = async (sosId, delaySeconds) => {
  if (!queue) return
  await queue.add(
    'escalate',
    { sosId },
    {
      delay:  delaySeconds * 1000,
      jobId:  `escalation-${sosId}`,
    }
  )
  logger.info({ event: 'escalation_scheduled', sosId, delaySeconds })
}

export const cancelEscalation = async (sosId) => {
  if (!queue) return
  const job = await queue.getJob(`escalation-${sosId}`)
  if (job) {
    await job.remove()
    logger.info({ event: 'escalation_cancelled', sosId })
  }
}