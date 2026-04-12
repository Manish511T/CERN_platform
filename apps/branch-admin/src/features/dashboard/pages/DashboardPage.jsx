import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, AlertCircle, CheckCircle } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectUser }  from '../../../store/slices/authSlice'
import AdminLayout     from '../../../shared/components/layout/AdminLayout'
import { getBranchVolunteersApi } from '../../volunteers/services/volunteerApi'
import { getActiveSOSApi }        from '../../sos/services/sosApi'
import api from '../../../services/api'

const StatCard = ({ icon, label, value, color, loading }) => {
  const colors = {
    teal:   'bg-teal-50 text-teal-600',
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-5"
    >
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center
                       justify-center mb-4`}>
        {icon}
      </div>
      {loading
        ? <div className="h-8 w-16 bg-slate-100 rounded animate-pulse mb-1" />
        : <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      }
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </motion.div>
  )
}

const DashboardPage = () => {
  const user    = useSelector(selectUser)
  const [stats,     setStats]     = useState(null)
  const [activeSOS, setActiveSOS] = useState([])
  const [loading,   setLoading]   = useState(true)

  const branchId = user?.branchId

  const load = async () => {
    if (!branchId) return
    setLoading(true)
    try {
      const [volRes, sosRes] = await Promise.all([
        getBranchVolunteersApi(branchId),
        getActiveSOSApi(),
      ])

      const vols   = volRes.data.data.volunteers || []
      const active = sosRes.data.data.records || []

      setStats({
        total:      vols.length,
        verified:   vols.filter(v => v.branchVerified).length,
        onDuty:     vols.filter(v => v.isOnDuty).length,
        activeSOS:  active.length,
      })
      setActiveSOS(active)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [branchId])
  useEffect(() => {
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [branchId])

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Branch Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of your branch operations
        </p>
      </div>

      {!branchId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <p className="font-semibold text-yellow-800">⚠️ No Branch Assigned</p>
          <p className="text-yellow-700 text-sm mt-1">
            Contact Super Admin to assign you to a branch before you can manage volunteers.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users className="w-5 h-5" />}        label="Total Volunteers" value={stats?.total}    color="teal"   loading={loading} />
            <StatCard icon={<CheckCircle className="w-5 h-5" />}  label="Verified"         value={stats?.verified} color="green"  loading={loading} />
            <StatCard icon={<UserCheck className="w-5 h-5" />}    label="On Duty"          value={stats?.onDuty}   color="yellow" loading={loading} />
            <StatCard icon={<AlertCircle className="w-5 h-5" />}  label="Active SOS"       value={stats?.activeSOS} color="red"  loading={loading} />
          </div>

          {/* Active SOS */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Active SOS in Your Region
            </h2>
            {activeSOS.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-medium text-slate-600">No active emergencies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSOS.map(sos => (
                  <div key={sos._id}
                    className="bg-white rounded-2xl border border-red-100 p-4
                               flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-full bg-red-400"
                      />
                      <div className="relative w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {sos.emergencyType} — {sos.triggeredBy?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(sos.createdAt).toLocaleTimeString()} •{' '}
                        {sos.escalationLevel} level
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600
                                     font-semibold rounded-full">
                      {sos.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default DashboardPage