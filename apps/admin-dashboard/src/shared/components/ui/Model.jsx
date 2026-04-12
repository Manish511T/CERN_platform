import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center
                       justify-center p-4"
          >
            {/* Modal box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.95, y: 16  }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth}
                          max-h-[90vh] overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4
                              border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center
                             rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal