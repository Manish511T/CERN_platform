import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertCircle, Navigation, User } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectActiveTracking } from '../../../store/slices/trackingSlice'

const navItems = [
  { to: '/dashboard', icon: Home,          label: 'Home'    },
  { to: '/sos',       icon: AlertCircle,   label: 'SOS'     },
  { to: '/tracking',  icon: Navigation,    label: 'Track'   },
  { to: '/profile',   icon: User,          label: 'Profile' },
]

const BottomNav = () => {
  const activeTracking = useSelector(selectActiveTracking)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    bg-white border-t border-slate-100 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-slate-400'}
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>

                {/* Live indicator on tracking tab */}
                {to === '/tracking' && activeTracking && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500
                               rounded-full border-2 border-white"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav