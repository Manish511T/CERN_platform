import mongoose from 'mongoose'

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [100, 'Branch name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Branch code cannot exceed 10 characters'],
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    coverageArea: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    radiusMeters: {
      type: Number,
      required: [true, 'Coverage radius is required'],
      min: [1000, 'Radius must be at least 1km'],
      max: [100000, 'Radius cannot exceed 100km'],
      default: 15000, // 15km default
    },
    contactPhone: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Geospatial index — required for $near queries to find owning branch
branchSchema.index({ coverageArea: '2dsphere' })

// Index for active branch lookups
branchSchema.index({ isActive: 1 })

export default mongoose.model('Branch', branchSchema)