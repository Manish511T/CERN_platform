import mongoose from 'mongoose'
import dotenv   from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGO_URI)
console.log('MongoDB connected')

const { default: User }   = await import('../modules/auth/auth.model.js')
const { ROLES }           = await import('../shared/constants.js')

const BRANCH_ADMIN = {
  name:     'Priya Singh',
  email:    'priya@example.com',
  password: 'Admin@123',
  role:     ROLES.BRANCH_ADMIN,
  phone:    '9988776655',
}

try {
  const existing = await User.findOne({ email: BRANCH_ADMIN.email })
  if (existing) {
    console.log('⚠️  Branch admin already exists:', existing.email)
  } else {
    const user = await User.create(BRANCH_ADMIN)
    console.log('✅ Branch admin created:')
    console.log(`   Email: ${user.email}`)
    console.log(`   ID:    ${user._id}`)
    console.log('   Note: Assign to a branch via Super Admin dashboard')
  }
} catch (err) {
  console.error('❌ Failed:', err.message)
} finally {
  await mongoose.disconnect()
  process.exit(0)
}