import { motion } from 'framer-motion'
import { Skeleton, SkeletonCircle, SkeletonCard } from '../../../shared/components/ui/Skeleton'

const TrackingSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

    {/* Header skeleton */}
    <div style={{
      background:   '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding:      '12px 16px',
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      flexShrink:   0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width={120} height={16} />
        <Skeleton width={160} height={12} />
      </div>
      <Skeleton width={60} height={28} radius={20} />
    </div>

    {/* Map skeleton */}
    <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        style={{
          width:      '100%',
          height:     '100%',
          background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e8f0 25%, #c8dff0 50%, #d4e8f0 75%, #e8f4f8 100%)',
          backgroundSize: '400% 400%',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Fake map grid lines */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              position:   'absolute',
              left:       0,
              right:      0,
              top:        `${(i + 1) * 16}%`,
              height:     1,
              background: '#93c5fd',
            }} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              position:   'absolute',
              top:        0,
              bottom:     0,
              left:       `${(i + 1) * 25}%`,
              width:      1,
              background: '#93c5fd',
            }} />
          ))}
        </div>

        {/* Pulsing location pin */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width:      48,
            height:     48,
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.3)',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            width:        24,
            height:       24,
            borderRadius: '50%',
            background:   '#2563eb',
          }} />
        </motion.div>

        <Skeleton width={180} height={14} />
      </motion.div>
    </div>

    {/* Bottom panel skeleton */}
    <div style={{
      background:   '#fff',
      borderTop:    '1px solid #e2e8f0',
      padding:      '16px',
      flexShrink:   0,
    }}>
      {/* Volunteer row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <SkeletonCircle size={44} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width={140} height={16} />
          <Skeleton width={100} height={12} />
        </div>
      </div>

      {/* Distance + ETA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            background:   '#f8fafc',
            borderRadius: 12,
            padding:      12,
            display:      'flex',
            alignItems:   'center',
            gap:          10,
          }}>
            <Skeleton width={20} height={20} radius={6} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Skeleton width={50}  height={11} />
              <Skeleton width={70}  height={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <Skeleton width="100%" height={48} radius={12} />
    </div>
  </div>
)

export default TrackingSkeleton