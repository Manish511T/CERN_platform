import { motion } from 'framer-motion'
import {
  Skeleton,
  SkeletonCircle,
  SkeletonCard,
  SkeletonBadge,
  SkeletonButton,
} from '../../../shared/components/ui/Skeleton'

const stagger = { animate: { transition: { staggerChildren: 0.09 } } }
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

const ProfileSkeleton = () => (
  <motion.div
    variants={stagger}
    initial="initial"
    animate="animate"
    style={{ padding: '24px 16px', maxWidth: 448, margin: '0 auto', paddingBottom: 96 }}
  >
    {/* Avatar card */}
    <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
      <SkeletonCard>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <SkeletonCircle size={80} />
          <Skeleton width={160} height={20} />
          <SkeletonBadge width={100} />
        </div>
      </SkeletonCard>
    </motion.div>

    {/* Detail rows */}
    <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
      <SkeletonCard style={{ padding: 0 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          16,
              padding:      '16px 20px',
              borderBottom: i < 2 ? '1px solid #f8fafc' : 'none',
            }}
          >
            <Skeleton width={36} height={36} radius={12} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width={60}  height={12} />
              <Skeleton width={140} height={16} />
            </div>
          </div>
        ))}
      </SkeletonCard>
    </motion.div>

    {/* Sign out button */}
    <motion.div variants={fadeUp}>
      <SkeletonButton fullWidth />
    </motion.div>
  </motion.div>
)

export default ProfileSkeleton