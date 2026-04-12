import { useEffect, useState } from 'react'
import { RefreshCw, MapPin, Clock, User } from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../shared/components/layout/AdminLayout'
import Badge       from '../../../shared/components/ui/Badge'
import { getActiveSOSApi } from '../services/sosApi'
import { EMERGENCY_LABELS } from '../../../shared/constants'

const escalationColors = {
  branch:      'teal',
  nearby:      'yellow',
  global:      'blue',
  authorities: 'red',
}

const SOSMonitorPage = () => {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getActiveSOSApi()
      setRecords(data.data.records || [])
      setLastRefresh(new Date())
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15_000)
    return () => clearInterval(t)
  }, [])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SOS Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">
            Updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border
                     border-slate-200 rounded-xl text-sm text-slate-600
                     hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Live counter */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6
                      flex items-center gap-4">
        {records.length > 0 && (
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-red-400"
            />
            <div className="relative w-4 h-4 rounded-full bg-red-500" />
          </div>
        )}
        <div>
          <p className="text-2xl font-bold text-slate-900">{records.length}</p>
          <p className="text-sm text-slate-500">Active emergencies</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-semibold text-slate-700">All Clear</h2>
          <p className="text-slate-400 mt-2">No active SOS alerts right now</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((sos, i) => {
            const info = EMERGENCY_LABELS[sos.emergencyType] || EMERGENCY_LABELS.other
            return (
              <motion.div
                key={sos._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-red-100 p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{info.emoji}</span>
                    <div>
                      <h3 className="font-bold text-slate-900">{info.label}</h3>
                      <p className="text-xs text-slate-400">ID: {sos._id.slice(-8)}</p>
                    </div>
                  </div>
                  <Badge variant={escalationColors[sos.escalationLevel] || 'teal'} dot>
                    {sos.escalationLevel}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    {sos.triggeredBy?.name || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(sos.createdAt).toLocaleTimeString()}
                  </div>
                  {sos.location?.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-600 col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{sos.location.address}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

export default SOSMonitorPage