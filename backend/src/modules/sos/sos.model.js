import mongoose from 'mongoose'
import { SOS_STATUS, EMERGENCY_TYPE, ESCALATION_LEVEL } from '../../shared/constants.js'

const escalationEventSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: Object.values(ESCALATION_LEVEL),
      required: true,
    },
    volunteersNotified: { type: Number, default: 0 },
    reason: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
)

const sosSchema = new mongoose.Schema(
  {
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    forSelf: {
      type: Boolean,
      default: true,
    },
    emergencyType: {
      type: String,
      enum: Object.values(EMERGENCY_TYPE),
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        default: '',
      },
    },
    photoUrl: { type: String, default: null },
    voiceNoteUrl: { type: String, default: null },

    status: {
      type: String,
      enum: Object.values(SOS_STATUS),
      default: SOS_STATUS.ACTIVE,
      index: true,
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },

    // Branch routing
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },

    // Escalation
    escalationLevel: {
      type: String,
      enum: Object.values(ESCALATION_LEVEL),
      default: ESCALATION_LEVEL.BRANCH,
    },
    escalationHistory: {
      type: [escalationEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Geospatial index — required for $near queries
sosSchema.index({ location: '2dsphere' })

// Compound index — finding active SOS by user (used in auto-cancel)
sosSchema.index({ triggeredBy: 1, status: 1 })

export default mongoose.model('SOS', sosSchema)