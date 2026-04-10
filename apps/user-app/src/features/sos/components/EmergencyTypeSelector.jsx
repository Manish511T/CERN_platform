import { motion } from 'framer-motion'

const TYPES = [
  { value: 'accident',   label: 'Accident',   emoji: '🚗' },
  { value: 'cardiac',    label: 'Cardiac',    emoji: '❤️' },
  { value: 'snake_bite', label: 'Snake Bite', emoji: '🐍' },
  { value: 'rabies',     label: 'Rabies',     emoji: '🐕' },
  { value: 'other',      label: 'Other',      emoji: '🆘' },
]

const EmergencyTypeSelector = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Emergency Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((type) => (
          <motion.button
            key={type.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(type.value)}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl border-2
              transition-all duration-200
              ${value === type.value
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
          >
            <span className="text-2xl">{type.emoji}</span>
            <span className={`text-xs font-medium ${
              value === type.value ? 'text-red-600' : 'text-slate-600'
            }`}>
              {type.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default EmergencyTypeSelector