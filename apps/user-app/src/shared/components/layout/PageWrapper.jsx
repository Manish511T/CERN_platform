import { motion } from 'framer-motion'
import BottomNav from './BottomNav'

const PageWrapper = ({
  children,
  title,
  showNav  = true,
  loading  = false,
  skeleton = null,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      {title && (
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-md mx-auto px-4 py-4">
            {loading ? (
              // Header skeleton
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{
                  width: 100, height: 14,
                  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: 6,
                  animation: 'shimmer 1.5s infinite linear',
                }} />
              </div>
            ) : (
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            )}
          </div>
        </header>
      )}

      {/* Content */}
      {loading && skeleton ? (
        // Show skeleton while loading
        skeleton
      ) : (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={`
            max-w-md mx-auto px-4 py-6
            ${showNav ? 'pb-24' : ''}
            ${className}
          `}
        >
          {children}
        </motion.main>
      )}

      {showNav && <BottomNav />}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  )
}

export default PageWrapper