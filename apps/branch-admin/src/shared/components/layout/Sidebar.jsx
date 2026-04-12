import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, UserCheck, AlertCircle,
  LogOut, GitBranch, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../store/slices/authSlice'
import useAuth from '../../hooks/useAuth'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/volunteers', icon: UserCheck,        label: 'Volunteers'  },
  { to: '/sos',        icon: AlertCircle,      label: 'SOS Monitor' },
]

export const DesktopSidebar = () => {
  const user       = useSelector(selectUser)
  const { logout } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white
                      border-r border-slate-100 fixed left-0 top-0 z-40">
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center
                          justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Branch Admin</p>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">
              {user?.name}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}>
                <Icon className="w-5 h-5 flex-shrink-0"
                      strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-slate-400">Branch</p>
          <p className="text-sm font-medium text-slate-700 truncate">
            {user?.branchId ? 'Assigned' : 'No branch assigned'}
          </p>
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

export const MobileNav = () => {
  const [open, setOpen] = useState(false)
  const { logout }      = useAuth()
  const user            = useSelector(selectUser)

  return (
    <>
      <header className="lg:hidden bg-white border-b border-slate-100
                         px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Branch Admin</span>
        </div>
        <button onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl
                         flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-5
                              border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-900">Branch Admin</span>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setOpen(false)}>
                    {({ isActive }) => (
                      <div className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                        ${isActive ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}
                      `}>
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="font-medium">{label}</span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="px-3 py-4 border-t border-slate-100">
                <button onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl
                             text-slate-500 hover:bg-red-50 hover:text-red-600
                             transition-colors font-medium">
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