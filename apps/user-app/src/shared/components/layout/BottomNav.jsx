import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertCircle, User } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: Home,        label: 'Home'    },
  { to: '/sos',       icon: AlertCircle, label: 'SOS'     },
  { to: '/profile',   icon: User,        label: 'Profile' },
]

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    bg-white border-t border-slate-100 shadow-lg
                    pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                  transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"
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