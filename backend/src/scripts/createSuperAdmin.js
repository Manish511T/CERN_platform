import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { createRequire } from 'module'

dotenv.config()

// Connect directly without going through the full app bootstrap
await mongoose.connect(process.env.MONGO_URI)
console.log('MongoDB connected')

// Dynamically import after connection
const { default: User } = await import('../modules/auth/auth.model.js')
const { ROLES } = await import('../shared/constants.js')

const SUPER_ADMIN = {
  name:     'Super Admin',
  email:    'admin@cern.com',
  password: 'Admin@123',
  role:     ROLES.SUPER_ADMIN,
  phone:    '9000000000',
}

try {
  const existing = await User.findOne({ email: SUPER_ADMIN.email })

  if (existing) {
    console.log('⚠️  Super admin already exists:')
    console.log(`   Email: ${existing.email}`)
    console.log(`   Role:  ${existing.role}`)
  } else {
    const user = await User.create(SUPER_ADMIN)
    console.log('✅ Super admin created successfully:')
    console.log(`   Name:  ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role:  ${user.role}`)
    console.log(`   ID:    ${user._id}`)
  }
} catch (err) {
  console.error('❌ Failed to create super admin:', err.message)
} finally {
  await mongoose.disconnect()
  console.log('MongoDB disconnected')
  process.exit(0)
}