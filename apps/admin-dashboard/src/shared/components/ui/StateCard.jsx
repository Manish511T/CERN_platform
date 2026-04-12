import { motion } from 'framer-motion'

const StatCard = ({ icon, label, value, sub, color = 'blue', loading = false }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100'   },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100'  },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100'    },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  }

  const c = colors[color] || colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${c.border} p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      )}

      <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  )
}

export default StatCard