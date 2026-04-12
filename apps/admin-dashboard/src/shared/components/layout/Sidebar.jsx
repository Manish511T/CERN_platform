import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, GitBranch, Users,
  UserCheck, AlertCircle, LogOut,
  Shield, ChevronRight, X, Menu,
} from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../store/slices/authSlice'
import useAuth from '../../hooks/useAuth'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/branches',   icon: GitBranch,       label: 'Branches'   },
  { to: '/volunteers', icon: UserCheck,       label: 'Volunteers' },
  { to: '/users',      icon: Users,           label: 'Users'      },
  { to: '/sos',        icon: AlertCircle,     label: 'SOS Monitor'},
]

// Desktop sidebar
export const DesktopSidebar = () => {
  const user       = useSelector(selectUser)
  const { logout } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white
                      border-r border-slate-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center
                          justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">CERN Admin</p>
            <p className="text-xs text-slate-400">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}>
                <Icon className="w-5 h-5 shrink-0"
                      strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-medium">{label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center
                          justify-center text-sm font-bold text-blue-600
                          shrink-0">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                     text-slate-500 hover:bg-red-50 hover:text-red-600
                     transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

// Mobile top bar + drawer
export const MobileNav = () => {
  const [open,     setOpen]  = useState(false)
  const user                 = useSelector(selectUser)
  const { logout }           = useAuth()

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden bg-white border-b border-slate-100
                         px-4 py-3 flex items-center justify-between
                         sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center
                          justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">CERN Admin</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     hover:bg-slate-100"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50
                         shadow-xl lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5
                              border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                                  justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-900">CERN Admin</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center
                             rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                  >
                    {({ isActive }) => (
                      <div className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl
                        transition-all
                        ${isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-500 hover:bg-slate-50'
                        }
                      `}>
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="font-medium">{label}</span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* User */}
              <div className="px-3 py-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center
                                  justify-center font-bold text-blue-600">
                    {user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-3
                             rounded-xl text-slate-500 hover:bg-red-50
                             hover:text-red-600 transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}