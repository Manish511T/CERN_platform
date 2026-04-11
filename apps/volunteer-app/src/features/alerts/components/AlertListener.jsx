import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import socket from '../../../socket/socket'
import { SOCKET_EVENTS, EMERGENCY_LABELS } from '../../../shared/constants'
import { setIncomingAlert } from '../../../store/slices/alertSlice'
import { selectIsAuth }     from '../../../store/slices/authSlice'
import { selectIsOnDuty }   from '../../../store/slices/dutySlice'

const AlertListener = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const isAuth    = useSelector(selectIsAuth)
  const isOnDuty  = useSelector(selectIsOnDuty)

  useEffect(() => {
    if (!isAuth) return

    const handleSOSAlert = (data) => {
      // Only process if it is a volunteer alert
      if (!data.isVolunteer) return

      dispatch(setIncomingAlert(data))

      const info = EMERGENCY_LABELS[data.emergencyType] || EMERGENCY_LABELS.other

      // Toast with action button
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{info.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{info.label} Emergency!</p>
              <p className="text-xs text-slate-400">Tap to respond</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/alert')
              }}
              className="px-3 py-1.5 bg-red-500 text-white text-xs
                         font-semibold rounded-lg"
            >
              View
            </button>
          </div>
        ),
        {
          duration: 15000,
          style: { background: '#1e293b', color: '#f8fafc', maxWidth: '360px' },
        }
      )
    }

    socket.on(SOCKET_EVENTS.SOS_ALERT, handleSOSAlert)

    return () => {
      socket.off(SOCKET_EVENTS.SOS_ALERT, handleSOSAlert)
    }
  }, [isAuth, isOnDuty, dispatch, navigate])

  return null  // no UI — listener only
}

export default AlertListener