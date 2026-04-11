import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Bell, MapPin, Clock, User } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectIncomingAlert } from '../../../store/slices/alertSlice'

const navItems = [
  { to: '/dashboard', icon: Home,   label: 'Home'    },
  { to: '/alert',     icon: Bell,   label: 'Alerts'  },
  { to: '/tracking',  icon: MapPin, label: 'Track'   },
  { to: '/history',   icon: Clock,  label: 'History' },
  { to: '/profile',   icon: User,   label: 'Profile' },
]

const BottomNav = () => {
  const incomingAlert = useSelector(selectIncomingAlert)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    bg-white border-t border-slate-100 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-colors duration-200
                  ${isActive ? 'text-green-600' : 'text-slate-400'}
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>

                {/* Alert badge on bell icon */}
                {to === '/alert' && incomingAlert && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500
                               rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </motion.span>
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