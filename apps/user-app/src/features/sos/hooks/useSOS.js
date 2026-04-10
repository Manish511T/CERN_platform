import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  sosTriggered,
  sosLoading,
  sosError,
  sosCancelled,
  sosResolved,
  sosAccepted,
  selectActiveSOS,
} from '../../../store/slices/sosSlice'
import { triggerSOSApi, updateSOSStatusApi } from '../services/sosApi'
import socket from '../../../socket/socket'
import { SOCKET_EVENTS } from '../../../shared/constants'

const useSOS = () => {
  const dispatch   = useDispatch()
  const activeSOS  = useSelector(selectActiveSOS)

  const [countdown, setCountdown] = useState(null)
  // null = not counting, 3/2/1 = counting, 0 = fire

  // ── Socket listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleAccepted = (data) => {
      dispatch(sosAccepted(data))
      toast.success(
        `${data.volunteerName} is on the way!`,
        { duration: 6000, icon: '🚑' }
      )
    }

    socket.on(SOCKET_EVENTS.SOS_ACCEPTED, handleAccepted)

    return () => {
      socket.off(SOCKET_EVENTS.SOS_ACCEPTED, handleAccepted)
    }
  }, [dispatch])

  // ── Countdown logic ─────────────────────────────────────────────────────────
  const startCountdown = useCallback((onFire) => {
    setCountdown(3)

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setCountdown(null)
          onFire()
          return null
        }
        return prev - 1
      })
    }, 1000)

    // Return cancel fn
    return () => {
      clearInterval(interval)
      setCountdown(null)
    }
  }, [])

  // ── Trigger SOS ─────────────────────────────────────────────────────────────
  const triggerSOS = useCallback(async ({
    latitude,
    longitude,
    emergencyType,
    forSelf,
    address,
    photo,
    voice,
  }) => {
    dispatch(sosLoading())

    try {
      // Build FormData — backend expects multipart/form-data
      const formData = new FormData()
      formData.append('latitude',      latitude)
      formData.append('longitude',     longitude)
      formData.append('emergencyType', emergencyType)
      formData.append('forSelf',       forSelf)
      if (address) formData.append('address', address)
      if (photo)   formData.append('photo',   photo)
      if (voice)   formData.append('voice',   voice)

      const { data } = await triggerSOSApi(formData)

      dispatch(sosTriggered({
        sosId:              data.data.sosId,
        emergencyType,
        notifiedVolunteers: data.data.notifiedVolunteers,
        socketNotified:     data.data.socketNotified,
        escalationSource:   data.data.escalationSource,
      }))

      const count = data.data.notifiedVolunteers
      toast.success(
        count > 0
          ? `SOS sent! ${count} volunteer${count > 1 ? 's' : ''} notified.`
          : 'SOS sent! Finding volunteers...',
        { duration: 5000 }
      )
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to send SOS.'
      dispatch(sosError(message))
      toast.error(message)
    }
  }, [dispatch])

  // ── Cancel SOS ──────────────────────────────────────────────────────────────
  const cancelSOS = useCallback(async () => {
    if (!activeSOS?.sosId) {
      dispatch(sosCancelled())
      return
    }

    try {
      await updateSOSStatusApi(activeSOS.sosId, 'cancelled')
      dispatch(sosCancelled())
      toast.success('SOS cancelled.')
    } catch {
      // Cancel locally even if API fails
      dispatch(sosCancelled())
    }
  }, [activeSOS, dispatch])

  // ── Resolve SOS ─────────────────────────────────────────────────────────────
  const resolveSOS = useCallback(async () => {
    if (!activeSOS?.sosId) return

    try {
      await updateSOSStatusApi(activeSOS.sosId, 'resolved')
      dispatch(sosResolved())
      toast.success('Emergency resolved. Stay safe!', { icon: '✅' })
    } catch (err) {
      toast.error('Failed to mark as resolved.')
    }
  }, [activeSOS, dispatch])

  return {
    activeSOS,
    countdown,
    startCountdown,
    triggerSOS,
    cancelSOS,
    resolveSOS,
  }
}

export default useSOS