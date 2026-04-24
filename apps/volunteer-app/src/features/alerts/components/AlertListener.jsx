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
      console.log('=== VOLUNTEER SOS ALERT ===', data)

      // Only process rescue alerts for volunteers
      // (type: 'rescue' or isVolunteer: true)
      if (!data.isVolunteer && data.type !== 'rescue') return

      dispatch(setIncomingAlert(data))

      const info = EMERGENCY_LABELS[data.emergencyType] || EMERGENCY_LABELS.other

      toast(
        (t) => (
          <div
            onClick={() => { toast.dismiss(t.id); navigate('/alert') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 32 }}>{info.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                🚨 {info.label} Emergency!
              </p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Tap to respond
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toast.dismiss(t.id)
                navigate('/alert')
              }}
              style={{
                padding: '6px 14px',
                background: '#dc2626', color: 'white',
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Respond
            </button>
          </div>
        ),
        {
          duration:   20000,
          style: {
            background:   '#fff',
            border:       '2px solid #fca5a5',
            borderRadius: '16px',
            padding:      '12px 16px',
            maxWidth:     '380px',
          },
        }
      )
    }

    socket.on(SOCKET_EVENTS.SOS_ALERT, handleSOSAlert)
    return () => socket.off(SOCKET_EVENTS.SOS_ALERT, handleSOSAlert)
  }, [isAuth, isOnDuty, dispatch, navigate])

  return null
}

export default AlertListener