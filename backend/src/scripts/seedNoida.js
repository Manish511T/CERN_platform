import mongoose from 'mongoose'
import dotenv   from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGO_URI)
console.log('MongoDB connected')

const { default: Branch } = await import('../modules/branch/branch.model.js')
const { default: User }   = await import('../modules/auth/auth.model.js')

// Noida zones — real geographic centroids
const noidaBranches = [
  {
    name:         'Noida Sector 1-20 Branch',
    code:         'NOI-A',
    coordinates:  [77.3910, 28.5700],   // [lng, lat]
    radiusMeters: 5000,
    address:      'Sector 15, Noida, UP',
    contactPhone: '9000000010',
  },
  {
    name:         'Noida Sector 21-50 Branch',
    code:         'NOI-B',
    coordinates:  [77.3760, 28.5500],
    radiusMeters: 5000,
    address:      'Sector 34, Noida, UP',
    contactPhone: '9000000011',
  },
  {
    name:         'Noida Sector 51-100 Branch',
    code:         'NOI-C',
    coordinates:  [77.3600, 28.5350],
    radiusMeters: 5000,
    address:      'Sector 62, Noida, UP',
    contactPhone: '9000000012',
  },
  {
    name:         'Greater Noida West Branch',
    code:         'GNO-W',
    coordinates:  [77.4200, 28.5950],
    radiusMeters: 6000,
    address:      'Greater Noida West, UP',
    contactPhone: '9000000013',
  },
  {
    name:         'Greater Noida East Branch',
    code:         'GNO-E',
    coordinates:  [77.5050, 28.4750],
    radiusMeters: 6000,
    address:      'Greater Noida, UP',
    contactPhone: '9000000014',
  },
]

try {
  let created = 0
  let skipped = 0

  for (const b of noidaBranches) {
    const existing = await Branch.findOne({ code: b.code })
    if (existing) {
      console.log(`⚠️  Skipped: ${b.name} (already exists)`)
      skipped++
      continue
    }

    await Branch.create({
      name:         b.name,
      code:         b.code,
      coverageArea: { type: 'Point', coordinates: b.coordinates },
      radiusMeters: b.radiusMeters,
      address:      b.address,
      contactPhone: b.contactPhone,
      isActive:     true,
    })

    console.log(`✅ Created: ${b.name} (${b.code})`)
    created++
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`)
  console.log('\nNoida Branch Coverage:')
  console.log('  NOI-A: Sectors 1-20  (5km radius)')
  console.log('  NOI-B: Sectors 21-50 (5km radius)')
  console.log('  NOI-C: Sectors 51-100(5km radius)')
  console.log('  GNO-W: Greater Noida West (6km radius)')
  console.log('  GNO-E: Greater Noida East (6km radius)')
} catch (err) {
  console.error('❌ Error:', err.message)
} finally {
  await mongoose.disconnect()
  process.exit(0)
}