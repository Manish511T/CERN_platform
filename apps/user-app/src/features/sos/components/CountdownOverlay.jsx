import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const CountdownOverlay = ({ countdown, onCancel }) => {
  return (
    <AnimatePresence>
      {countdown !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-red-600 flex flex-col
                     items-center justify-center"
        >
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute w-64 h-64 rounded-full bg-red-500 opacity-30"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.1 }}
            className="absolute w-48 h-48 rounded-full bg-red-500 opacity-40"
          />

          {/* Countdown number */}
          <AnimatePresence mode="wait">
            <motion.span
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 1.5,  opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative text-white font-bold"
              style={{ fontSize: '120px', lineHeight: 1 }}
            >
              {countdown}
            </motion.span>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-red-100 text-lg mt-4 font-medium"
          >
            Sending SOS alert...
          </motion.p>

          {/* Cancel button */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onCancel}
            className="relative mt-12 flex items-center gap-2 bg-white/20
                       hover:bg-white/30 active:bg-white/40
                       text-white font-semibold px-8 py-3 rounded-2xl
                       transition-colors"
          >
            <X className="w-5 h-5" />
            Cancel
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CountdownOverlay