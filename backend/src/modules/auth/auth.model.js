import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { ROLES } from '../../shared/constants.js'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries unless explicitly asked
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // Volunteer specific
    isOnDuty: {
      type: Boolean,
      default: false,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    branchVerified: {
      type: Boolean,
      default: false,
    },

    // FCM push notification token (array = multiple devices)
    fcmTokens: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Refresh token stored for rotation + invalidation
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

// 2dsphere index enables MongoDB geospatial queries ($near, $geoWithin)
userSchema.index({ location: '2dsphere' })

// Compound index: finding on-duty volunteers by branch quickly
userSchema.index({ role: 1, isOnDuty: 1, branchId: 1 })

// Hash password before saving — only runs if password field was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Instance method: compare plain password against stored hash
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password)
}

// Instance method: return safe user object (no sensitive fields)
userSchema.methods.toSafeObject = function () {
  return {
    id:              this._id,
    name:            this.name,
    email:           this.email,
    role:            this.role,
    phone:           this.phone,
    isOnDuty:        this.isOnDuty,
    branchId:        this.branchId,
    branchVerified:  this.branchVerified,
    location:        this.location,
    isActive:        this.isActive,
    createdAt:       this.createdAt,
  }
}

export default mongoose.model('User', userSchema)