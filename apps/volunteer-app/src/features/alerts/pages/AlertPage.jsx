import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Clock, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  selectIncomingAlert,
  selectActiveRescue,
  setActiveRescue,
  clearIncomingAlert,
} from '../../../store/slices/alertSlice'

import { acceptSOSApi } from '../services/alertApi'
import PageWrapper from '../../../shared/components/layout/PageWrapper'
import { EMERGENCY_LABELS } from '../../../shared/constants'

const AlertPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const incomingAlert = useSelector(selectIncomingAlert)
  const activeRescue = useSelector(selectActiveRescue)

  const [accepting, setAccepting] = useState(false)

  // ✅ Safe info fallback
  const info = incomingAlert
    ? EMERGENCY_LABELS[incomingAlert.emergencyType] || EMERGENCY_LABELS.other
    : EMERGENCY_LABELS.other

  // =========================
  // HANDLE ACCEPT
  // =========================
  const handleAccept = async () => {
    if (!incomingAlert?.sosId) return

    setAccepting(true)

    try {
      const { data } = await acceptSOSApi(incomingAlert.sosId)

      const {
        victimId,
        victimName,
        victimPhone,
        victimLocation,
      } = data.data

      dispatch(
        setActiveRescue({
          sosId: incomingAlert.sosId,
          victimId,
          victimName,
          victimPhone,
          victimLocation,
        })
      )

      toast.success('SOS accepted! Navigate to victim.', { icon: '🚑' })
      navigate('/tracking')
    } catch (err) {
      toast.error(
        err?.response?.data?.error || 'Failed to accept SOS.'
      )
      setAccepting(false)
    }
  }

  // =========================
  // HANDLE DECLINE
  // =========================
  const handleDecline = () => {
    dispatch(clearIncomingAlert())
    toast('Alert dismissed.', { icon: '↩️' })
    navigate('/dashboard')
  }

  // =========================
  // NO ALERT STATE
  // =========================
  if (!incomingAlert && !activeRescue) {
    return (
      <PageWrapper title="Alerts">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-slate-300" />
          </div>

          <h2 className="text-lg font-semibold text-slate-700">
            No Active Alerts
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Stay on duty to receive SOS alerts
          </p>
        </div>
      </PageWrapper>
    )
  }

  // =========================
  // ACTIVE RESCUE STATE
  // =========================
  if (activeRescue) {
    return (
      <PageWrapper title="Active Rescue">
        <div className="space-y-4">

          <div className="bg-green-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-bold text-lg">Rescue in Progress</h2>
                <p className="text-green-100 text-sm">Navigate to victim</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-600">
                {activeRescue?.victimName?.[0]}
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {activeRescue?.victimName}
                </p>
                <p className="text-sm text-slate-500">Victim</p>
              </div>
            </div>

            {/* ✅ FIXED anchor tag */}
            {activeRescue?.victimPhone && (
              <a
                href={`tel:${activeRescue.victimPhone}`}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {activeRescue.victimPhone}
                </span>
              </a>
            )}
          </div>

          <button
            onClick={() => navigate('/tracking')}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Open Live Map →
          </button>
        </div>
      </PageWrapper>
    )
  }

  // =========================
  // INCOMING ALERT STATE
  // =========================
  return (
    <PageWrapper title="Incoming SOS" showNav={false}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5"
        >

          {/* ALERT CARD */}
          <div className="bg-red-500 rounded-2xl p-6 text-center text-white">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-3"
            >
              {info?.emoji}
            </motion.div>

            <h2 className="text-2xl font-bold mb-1">
              {info?.label}
            </h2>

            <p className="text-red-100">Emergency Alert</p>
          </div>

          {/* DETAILS */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Location
                </p>
                <p className="text-sm text-slate-500">
                  {incomingAlert?.location?.address || 'GPS coordinates received'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Triggered by
                </p>
                <p className="text-sm text-slate-500">
                  {incomingAlert?.triggeredBy?.name || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>

          {/* PHOTO */}
          {incomingAlert?.photoUrl && (
            <img
              src={incomingAlert.photoUrl}
              alt="Emergency scene"
              className="w-full h-48 object-cover rounded-2xl"
            />
          )}

          {/* ACTIONS */}
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              {accepting && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              ✅ Accept & Respond
            </motion.button>

            <button
              onClick={handleDecline}
              disabled={accepting}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>

        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  )
}

export default AlertPage