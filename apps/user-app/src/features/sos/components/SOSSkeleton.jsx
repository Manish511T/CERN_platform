import { motion } from 'framer-motion'
import {
  Skeleton,
  SkeletonCard,
  SkeletonBadge,
} from '../../../shared/components/ui/Skeleton'

const stagger = { animate: { transition: { staggerChildren: 0.1 } } }
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

const SOSSkeleton = () => (
  <motion.div
    variants={stagger}
    initial="initial"
    animate="animate"
    style={{ padding: '24px 16px', maxWidth: 448, margin: '0 auto', paddingBottom: 96 }}
  >
    {/* GPS Indicator */}
    <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        padding:      '10px 14px',
        background:   '#f8fafc',
        borderRadius: 12,
      }}>
        <Skeleton width={16} height={16} radius={8} />
        <Skeleton width={180} height={14} />
        <div style={{ marginLeft: 'auto' }}>
          <Skeleton width={10} height={10} radius={5} />
        </div>
      </div>
    </motion.div>

    {/* For self / someone else toggle */}
    <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
      <SkeletonCard>
        <Skeleton width={140} height={14} style={{ marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Skeleton height={44} radius={12} />
          <Skeleton height={44} radius={12} />
        </div>
      </SkeletonCard>
    </motion.div>

    {/* Emergency type selector */}
    <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
      <SkeletonCard>
        <Skeleton width={160} height={14} style={{ marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            8,
              padding:        12,
              borderRadius:   12,
              border:         '2px solid #e2e8f0',
            }}>
              <Skeleton width={36} height={36} radius={8} />
              <Skeleton width={56} height={12} />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </motion.div>

    {/* Media attachments */}
    <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
      <SkeletonCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={60}  height={12} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Skeleton height={96} radius={12} />
          <Skeleton height={96} radius={12} />
        </div>
      </SkeletonCard>
    </motion.div>

    {/* SOS Button */}
    <motion.div variants={fadeUp}>
      <Skeleton width="100%" height={68} radius={16} />
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
        <Skeleton width={260} height={12} />
      </div>
    </motion.div>
  </motion.div>
)

export default SOSSkeleton