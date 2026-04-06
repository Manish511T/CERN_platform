import Notification from './notification.model.js'
import User from '../auth/auth.model.js'
import { sendPushNotification } from './providers/fcm.provider.js'
import logger from '../../config/logger.js'

// ─── SEND TO ONE USER ────────────────────────────────────────────────────────

export const sendToUser = async ({
  userId,
  title,
  body,
  type = 'general',
  data = {},
  channel = 'both',
}) => {
  // Create notification log entry
  const notification = await Notification.create({
    userId,
    title,
    body,
    type,
    data,
    channel,
    status: 'pending',
  })

  try {
    if (channel === 'push' || channel === 'both') {
      const user = await User.findById(userId).select('fcmTokens')

      if (user?.fcmTokens?.length) {
        const { successCount, invalidTokens } = await sendPushNotification({
          tokens: user.fcmTokens,
          title,
          body,
          data,
        })

        // Clean up invalid tokens from user document
        if (invalidTokens.length) {
          await User.findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { $in: invalidTokens } },
          })
        }

        await notification.updateOne({
          status: successCount > 0 ? 'sent' : 'failed',
        })
      } else {
        // No FCM tokens — user hasn't registered a device
        await notification.updateOne({ status: 'failed', failureReason: 'no_fcm_tokens' })
      }
    } else {
      // Socket-only channel — mark sent (socket delivery handled by caller)
      await notification.updateOne({ status: 'sent' })
    }
  } catch (err) {
    await notification.updateOne({ status: 'failed', failureReason: err.message })
    logger.error({ event: 'notification_failed', userId, err: err.message })
  }

  return notification
}

// ─── SEND TO MULTIPLE USERS ──────────────────────────────────────────────────

export const sendToMany = async ({ userIds, title, body, type, data, channel }) => {
  // Fire all notifications concurrently — don't await each one sequentially
  const results = await Promise.allSettled(
    userIds.map((userId) =>
      sendToUser({ userId, title, body, type, data, channel })
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed    = results.filter(r => r.status === 'rejected').length

  logger.info({ event: 'bulk_notification', total: userIds.length, succeeded, failed })

  return { succeeded, failed }
}

// ─── NOTIFY VOLUNTEERS (SOS dispatch) ───────────────────────────────────────
// Called from sos.controller for offline volunteers

export const notifyVolunteers = async (volunteers, sosPayload) => {
  if (!volunteers?.length) return

  const userIds = volunteers.map(v => v._id)

  return sendToMany({
    userIds,
    title:   '🚨 Emergency SOS Alert',
    body:    `${sosPayload.emergencyType} emergency nearby. Tap to respond.`,
    type:    'sos_alert',
    data:    {
      sosId:         sosPayload.sosId?.toString(),
      emergencyType: sosPayload.emergencyType,
      latitude:      sosPayload.location?.coordinates?.[1]?.toString(),
      longitude:     sosPayload.location?.coordinates?.[0]?.toString(),
    },
    channel: 'push',   // push only — socket already handled online users
  })
}

// ─── NOTIFY VICTIM (SOS accepted) ───────────────────────────────────────────

export const notifyVictimAccepted = async (victimId, volunteerName, sosId) => {
  return sendToUser({
    userId:  victimId,
    title:   '✅ Help is on the way',
    body:    `${volunteerName} has accepted your SOS and is heading to you.`,
    type:    'sos_accepted',
    data:    { sosId: sosId?.toString() },
    channel: 'push',
  })
}

// ─── GET USER NOTIFICATIONS ──────────────────────────────────────────────────

export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
  ])

  return {
    notifications,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

// ─── GET NOTIFICATION STATS (Admin) ─────────────────────────────────────────

export const getNotificationStats = async () => {
  const [total, sent, failed] = await Promise.all([
    Notification.countDocuments(),
    Notification.countDocuments({ status: 'sent' }),
    Notification.countDocuments({ status: 'failed' }),
  ])

  return {
    total,
    sent,
    failed,
    successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
  }
}