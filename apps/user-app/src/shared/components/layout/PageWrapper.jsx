import { motion } from 'framer-motion'
import BottomNav from './BottomNav'

const PageWrapper = ({ children, title, showNav = true, className = '' }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      {title && (
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          </div>
        </header>
      )}

      {/* Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`
          max-w-md mx-auto px-4 py-6
          ${showNav ? 'pb-24' : ''}
          ${className}
        `}
      >
        {children}
      </motion.main>

      {showNav && <BottomNav />}
    </div>
  )
}

export default PageWrapper