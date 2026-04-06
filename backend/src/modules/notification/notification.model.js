import mongoose from 'mongoose'

// Stores a log of every notification sent
// Useful for admin dashboard, debugging, and delivery tracking

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'sos_alert',        // volunteer receives SOS
        'sos_accepted',     // victim told help is coming
        'sos_escalated',    // SOS moved to next level
        'sos_resolved',     // SOS marked resolved
        'branch_assigned',  // volunteer assigned to branch
        'general',
      ],
      default: 'general',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,  // extra payload (sosId, branchId etc.)
      default: {},
    },
    channel: {
      type: String,
      enum: ['push', 'socket', 'both'],
      default: 'both',
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index — get all notifications for a user sorted by date
notificationSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)