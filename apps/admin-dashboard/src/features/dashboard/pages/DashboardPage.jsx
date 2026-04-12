import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, GitBranch,
  AlertCircle, Activity, Bell,
} from 'lucide-react'
import AdminLayout from '../../../shared/components/layout/AdminLayout'
import StatCard    from '../../../shared/components/ui/StateCard'
import {
  getActiveSOSApi,
  getAllBranchesApi,
  getOnlineVolunteersApi,
  getNotificationStatsApi,
} from '../services/dashboardApi'
import api from '../../../services/api'
import { EMERGENCY_LABELS, SOS_STATUS } from '../../../shared/constants'

const DashboardPage = () => {
  const [stats,     setStats]     = useState(null)
  const [activeSOS, setActiveSOS] = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    try {
      const [sosRes, branchRes, volRes, notifRes, userRes] = await Promise.all([
        getActiveSOSApi(),
        getAllBranchesApi(),
        getOnlineVolunteersApi(),
        getNotificationStatsApi(),
        api.get('/user?limit=1'),
      ])

      setActiveSOS(sosRes.data.data.records || [])
      setStats({
        activeSOS:         sosRes.data.data.records?.length || 0,
        totalBranches:     branchRes.data.data.branches?.length || 0,
        onlineVolunteers:  volRes.data.data.volunteers?.length || 0,
        totalUsers:        userRes.data.data.total || 0,
        notifSent:         notifRes.data.data.stats?.sent || 0,
        notifRate:         notifRes.data.data.stats?.successRate || 0,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Refresh every 30 seconds
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time overview of CERN network
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Active SOS"
          value={stats?.activeSOS}
          color="red"
          loading={loading}
          sub="Right now"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5" />}
          label="Online Volunteers"
          value={stats?.onlineVolunteers}
          color="green"
          loading={loading}
          sub="On duty"
        />
        <StatCard
          icon={<GitBranch className="w-5 h-5" />}
          label="Branches"
          value={stats?.totalBranches}
          color="blue"
          loading={loading}
          sub="Active regions"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats?.totalUsers}
          color="purple"
          loading={loading}
        />
        <StatCard
          icon={<Bell className="w-5 h-5" />}
          label="Notifications Sent"
          value={stats?.notifSent}
          color="yellow"
          loading={loading}
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Success Rate"
          value={stats ? `${stats.notifRate}%` : null}
          color="green"
          loading={loading}
          sub="Notification delivery"
        />
      </div>

      {/* Active SOS feed */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Active SOS Alerts
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeSOS.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8
                          text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-medium text-slate-600">No active emergencies</p>
            <p className="text-sm text-slate-400 mt-1">
              The network is currently clear
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSOS.map((sos, i) => {
              const info = EMERGENCY_LABELS[sos.emergencyType] || EMERGENCY_LABELS.other
              return (
                <motion.div
                  key={sos._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-red-100 p-4
                             flex items-center gap-4"
                >
                  {/* Pulse dot */}
                  <div className="relative shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full bg-red-400"
                    />
                    <div className="relative w-3 h-3 rounded-full bg-red-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.emoji}</span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {info.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {sos.escalationLevel} level
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      By: {sos.triggeredBy?.name} •{' '}
                      {new Date(sos.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1
                                   bg-red-50 text-red-600 rounded-full">
                    {sos.status}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default DashboardPage