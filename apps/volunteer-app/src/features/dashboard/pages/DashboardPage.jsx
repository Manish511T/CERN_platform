import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, MapPin, AlertCircle, Clock } from 'lucide-react'
import { selectUser }        from '../../../store/slices/authSlice'
import { selectIsOnDuty }    from '../../../store/slices/dutySlice'
import { selectIncomingAlert } from '../../../store/slices/alertSlice'
import PageWrapper           from '../../../shared/components/layout/PageWrapper'
import useDuty               from '../../duty/hooks/useDuty'
import { useNavigate }       from 'react-router-dom'

const DashboardPage = () => {
  const user          = useSelector(selectUser)
  const incomingAlert = useSelector(selectIncomingAlert)
  const navigate      = useNavigate()
  const { isOnDuty, isToggling, toggleDuty } = useDuty()

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">Volunteer Portal</p>
          <h1 className="text-xl font-bold text-slate-900">
            {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <div className={`
          px-3 py-1.5 rounded-full text-xs font-semibold
          ${isOnDuty
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-500'
          }
        `}>
          {isOnDuty ? '● On Duty' : '○ Off Duty'}
        </div>
      </div>

      {/* Incoming Alert Banner */}
      <AnimatePresence>
        {incomingAlert && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onClick={() => navigate('/alert')}
            className="mb-5 bg-red-500 rounded-2xl p-4 cursor-pointer
                       flex items-center gap-3 shadow-lg shadow-red-100"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center
                         justify-center shrink-0"
            >
              <AlertCircle className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">🚨 SOS Alert!</p>
              <p className="text-red-100 text-sm truncate">
                {incomingAlert.emergencyType} emergency nearby
              </p>
            </div>
            <span className="text-white text-sm font-medium">View →</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duty Toggle Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-5"
      >
        <div className={`
          rounded-2xl p-6 transition-all duration-500
          ${isOnDuty
            ? 'bg-linear-to-br from-green-500 to-green-600'
            : 'bg-linear-to-br from-slate-600 to-slate-700'
          }
        `}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-lg">
                {isOnDuty ? 'You\'re Active' : 'Go On Duty'}
              </h2>
              <p className="text-white/70 text-sm mt-0.5">
                {isOnDuty
                  ? 'Receiving SOS alerts'
                  : 'Toggle to start receiving alerts'
                }
              </p>
            </div>
            <Shield className="w-10 h-10 text-white/30" />
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">
              {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
            </span>
            <button
              onClick={toggleDuty}
              disabled={isToggling}
              className={`
                relative w-14 h-7 rounded-full transition-all duration-300
                focus:outline-none disabled:opacity-70
                ${isOnDuty ? 'bg-white/30' : 'bg-white/20'}
              `}
            >
              <motion.span
                animate={{ x: isOnDuty ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full
                           shadow-md flex items-center justify-center"
              >
                {isToggling && (
                  <span className="w-3 h-3 border-2 border-slate-400
                                   border-t-transparent rounded-full animate-spin" />
                )}
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          {
            icon:  MapPin,
            color: 'text-blue-500',
            bg:    'bg-blue-50',
            label: 'Branch',
            value: user?.branchVerified ? 'Verified' : 'Unverified',
          },
          {
            icon:  Clock,
            color: 'text-purple-500',
            bg:    'bg-purple-50',
            label: 'Response',
            value: '24/7',
          },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label}
            className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center
                            justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Branch info */}
      {!user?.branchVerified && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Branch not verified
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Contact your branch admin to get verified and receive branch-priority alerts.
          </p>
        </div>
      )}
    </PageWrapper>
  )
}

export default DashboardPage