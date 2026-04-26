import { motion } from 'framer-motion'
import {
  Skeleton,
  SkeletonCircle,
  SkeletonCard,
  SkeletonText,
  SkeletonBadge,
  SkeletonButton,
} from '../../../shared/components/ui/Skeleton'

// ── Stagger animation for list items ──────────────────────────────────────────
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1,  y: 0,  transition: { duration: 0.3 } },
}

const DashboardSkeleton = () => {
  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      style={{ padding: '24px 16px', maxWidth: 448, margin: '0 auto' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width={80}  height={12} />
          <Skeleton width={140} height={22} />
        </div>
        <SkeletonBadge width={72} />
      </motion.div>

      {/* ── SOS Card ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <SkeletonCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Skeleton width={44} height={44} radius={12} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} />
            </div>
          </div>
          <Skeleton width="100%" height={48} radius={12} />
        </SkeletonCard>
      </motion.div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}
      >
        {[0, 1].map(i => (
          <SkeletonCard key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <Skeleton width={44} height={44} radius={12} />
              <Skeleton width={48} height={24} />
              <Skeleton width={80} height={12} />
            </div>
          </SkeletonCard>
        ))}
      </motion.div>

      {/* ── Section Title ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 12 }}>
        <Skeleton width={160} height={14} />
      </motion.div>

      {/* ── Emergency Contacts List ────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <SkeletonCard style={{ padding: 0 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                padding:       '16px 20px',
                borderBottom:   i < 2 ? '1px solid #f8fafc' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton width={36} height={36} radius={12} />
                <Skeleton width={120} height={14} />
              </div>
              <Skeleton width={36} height={20} />
            </div>
          ))}
        </SkeletonCard>
      </motion.div>

      {/* ── Logout button ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} style={{ marginTop: 20 }}>
        <SkeletonButton fullWidth />
      </motion.div>
    </motion.div>
  )
}

export default DashboardSkeleton