import { motion } from 'framer-motion'
import { MapPin, Loader } from 'lucide-react'

const GPSIndicator = ({ gpsStatus, accuracyLabel, accuracyColor }) => {
  const statusConfig = {
    idle: {
      bg:   'bg-slate-50',
      icon: <MapPin className="w-4 h-4 text-slate-400" />,
    },
    acquiring: {
      bg:   'bg-blue-50',
      icon: (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader className="w-4 h-4 text-blue-500" />
        </motion.div>
      ),
    },
    ready: {
      bg:   'bg-green-50',
      icon: <MapPin className="w-4 h-4 text-green-500" />,
    },
    low_accuracy: {
      bg:   'bg-yellow-50',
      icon: <MapPin className="w-4 h-4 text-yellow-500" />,
    },
    error: {
      bg:   'bg-red-50',
      icon: <MapPin className="w-4 h-4 text-red-500" />,
    },
  }

  const config = statusConfig[gpsStatus] || statusConfig.idle

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-xl ${config.bg}
    `}>
      {config.icon}
      <span className={`text-sm font-medium ${accuracyColor()}`}>
        {accuracyLabel()}
      </span>
      {gpsStatus === 'ready' && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="ml-auto w-2 h-2 rounded-full bg-green-500"
        />
      )}
    </div>
  )
}

export default GPSIndicator