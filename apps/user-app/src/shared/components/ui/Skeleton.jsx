import { motion } from 'framer-motion'

// ── Shimmer animation ──────────────────────────────────────────────────────────
const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { backgroundPosition: '200% 0' },
  transition: { repeat: Infinity, duration: 1.5, ease: 'linear' },
}

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  borderRadius: 8,
}

// ── Core Skeleton block ────────────────────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 16, radius = 8, className = '' }) => (
  <motion.div
    {...shimmer}
    style={{
      ...shimmerStyle,
      width,
      height,
      borderRadius: radius,
      flexShrink: 0,
    }}
    className={className}
  />
)

// ── Skeleton circle (avatar) ───────────────────────────────────────────────────
export const SkeletonCircle = ({ size = 48 }) => (
  <motion.div
    {...shimmer}
    style={{
      ...shimmerStyle,
      width:        size,
      height:       size,
      borderRadius: '50%',
      flexShrink:   0,
    }}
  />
)

// ── Skeleton text line ─────────────────────────────────────────────────────────
export const SkeletonText = ({ lines = 1, lastLineWidth = '60%', gap = 8 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={14}
        width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
      />
    ))}
  </div>
)

// ── Skeleton card wrapper ──────────────────────────────────────────────────────
export const SkeletonCard = ({ children, className = '' }) => (
  <div
    className={className}
    style={{
      background:   '#ffffff',
      borderRadius: 16,
      border:       '1px solid #f1f5f9',
      padding:      20,
      boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
    }}
  >
    {children}
  </div>
)

// ── Skeleton badge ─────────────────────────────────────────────────────────────
export const SkeletonBadge = ({ width = 80 }) => (
  <Skeleton width={width} height={22} radius={20} />
)

// ── Skeleton button ────────────────────────────────────────────────────────────
export const SkeletonButton = ({ fullWidth = false }) => (
  <Skeleton
    width={fullWidth ? '100%' : 120}
    height={44}
    radius={12}
  />
)

export default Skeleton