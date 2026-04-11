import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getHistoryApi } from '../../alerts/services/alertApi'
import PageWrapper from '../../../shared/components/layout/PageWrapper'
import { EMERGENCY_LABELS } from '../../../shared/constants'

const statusConfig = {
  active:    { color: 'text-blue-600',  bg: 'bg-blue-50',   icon: AlertCircle  },
  accepted:  { color: 'text-green-600', bg: 'bg-green-50',  icon: CheckCircle  },
  resolved:  { color: 'text-slate-600', bg: 'bg-slate-50',  icon: CheckCircle  },
  cancelled: { color: 'text-red-500',   bg: 'bg-red-50',    icon: XCircle      },
  escalated: { color: 'text-orange-500', bg: 'bg-orange-50', icon: AlertCircle },
}

const HistoryPage = () => {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await getHistoryApi(p)
      const { records: newRecords, pages } = data.data
      setRecords(prev => p === 1 ? newRecords : [...prev, ...newRecords])
      setHasMore(p < pages)
    } catch (err){
        console.error('Failed to load history:', err)
    }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [])

  if (loading && page === 1) {
    return (
      <PageWrapper title="History">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i}
              className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="History">
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center
                        min-h-[60vh] text-center">
          <Clock className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No rescues yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Your responded SOS alerts will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => {
            const config = statusConfig[record.status] || statusConfig.active
            const Icon   = config.icon
            const info   = EMERGENCY_LABELS[record.emergencyType] || EMERGENCY_LABELS.other

            return (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center
                                  justify-center shrink-0`}>
                    <span className="text-lg">{info.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 text-sm">
                        {info.label}
                      </p>
                      <span className={`
                        text-xs font-medium px-2 py-0.5 rounded-full
                        ${config.bg} ${config.color}
                      `}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {record.triggeredBy?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(record.createdAt).toLocaleDateString('en-IN', {
                        day:    'numeric',
                        month:  'short',
                        year:   'numeric',
                        hour:   '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {hasMore && (
            <button
              onClick={() => { setPage(p => p + 1); load(page + 1) }}
              disabled={loading}
              className="w-full py-3 text-sm text-slate-500 hover:text-slate-700
                         font-medium"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </PageWrapper>
  )
}

export default HistoryPage