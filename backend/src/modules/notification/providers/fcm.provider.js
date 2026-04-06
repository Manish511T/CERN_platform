import { env } from '../../../config/env.js'
import logger from '../../../config/logger.js'

// Lazy initialize Firebase Admin — only when FCM credentials exist
// This prevents crashes in development when FCM is not configured

let adminInstance = null

const getFirebaseAdmin = async () => {
  if (adminInstance) return adminInstance

  if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
    return null   // FCM not configured — skip silently
  }

  try {
    const admin = await import('firebase-admin')

    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId:   env.FCM_PROJECT_ID,
          clientEmail: env.FCM_CLIENT_EMAIL,
          // .env stores \n as literal string — convert back to newline
          privateKey:  env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
    }

    adminInstance = admin.default
    logger.info('FCM: Firebase Admin initialized')
    return adminInstance
  } catch (err) {
    logger.error(`FCM: Failed to initialize — ${err.message}`)
    return null
  }
}

// Send push notification to multiple FCM tokens
// Returns { successCount, failureCount, invalidTokens }
export const sendPushNotification = async ({ tokens, title, body, data = {} }) => {
  if (!tokens?.length) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] }
  }

  const admin = await getFirebaseAdmin()

  if (!admin) {
    logger.warn('FCM: skipping push — Firebase not configured')
    return { successCount: 0, failureCount: 0, invalidTokens: [] }
  }

  try {
    const message = {
      notification: { title, body },

      // data must be all strings for FCM
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),

      tokens,

      android: {
        priority: 'high',
        notification: {
          sound:     'emergency_alert',
          channelId: 'sos_alerts',
        },
      },

      apns: {
        payload: {
          aps: {
            sound: 'emergency_alert.wav',
            badge: 1,
          },
        },
      },
    }

    const response = await admin.messaging().sendEachForMulticast(message)

    // Collect invalid tokens for cleanup
    const invalidTokens = []
    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const code = res.error?.code
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx])
        }
        logger.warn(`FCM: token failed — ${code}`)
      }
    })

    logger.info({
      event:        'fcm_sent',
      successCount: response.successCount,
      failureCount: response.failureCount,
    })

    return {
      successCount:  response.successCount,
      failureCount:  response.failureCount,
      invalidTokens,
    }
  } catch (err) {
    logger.error(`FCM: send failed — ${err.message}`)
    return { successCount: 0, failureCount: tokens.length, invalidTokens: [] }
  }
}