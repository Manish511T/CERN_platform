import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  setDutyStatus, setToggling,
  selectIsOnDuty, selectIsToggling,
} from '../../../store/slices/dutySlice'
import { setUser, selectUser, selectAccessToken } from '../../../store/slices/authSlice'
import { toggleDutyApi, updateLocationApi } from '../../auth/services/authApi'
import socket from '../../../socket/socket'

const useDuty = () => {
  const dispatch      = useDispatch()
  const isOnDuty      = useSelector(selectIsOnDuty)
  const isToggling    = useSelector(selectIsToggling)
  const user          = useSelector(selectUser)
  const accessToken   = useSelector(selectAccessToken)

  // Keep socket alive — reconnect if it drops
  useEffect(() => {
    if (!accessToken) return

    const ensureConnected = () => {
      if (!socket.connected) {
        console.log('Socket dropped — reconnecting...')
        socket.auth = { token: accessToken }
        socket.connect()
      }
    }

    // Check every 10 seconds
    const interval = setInterval(ensureConnected, 10_000)
    return () => clearInterval(interval)
  }, [accessToken])

  const toggleDuty = async () => {
    dispatch(setToggling(true))

    try {
      // Ensure socket is connected before going on duty
      if (!socket.connected) {
        socket.auth = { token: accessToken }
        socket.connect()
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      console.log('Socket status before duty toggle:', {
        connected: socket.connected,
        id: socket.id,
      })

      const { data } = await toggleDutyApi()
      const newStatus = data.data.isOnDuty

      dispatch(setDutyStatus(newStatus))
      dispatch(setUser({ ...user, isOnDuty: newStatus }))

      if (newStatus) {
        // Get fresh GPS location
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords
            console.log('GPS acquired:', { latitude, longitude })
            await updateLocationApi(latitude, longitude)
            console.log('✅ Location updated')
          },
          (err) => console.warn('GPS failed:', err.message),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )

        toast.success('You are ON duty. Receiving SOS alerts.', { icon: '🟢' })
      } else {
        toast.success('You are OFF duty.', { icon: '🔴' })
      }
    } catch (err) {
      console.error('Duty toggle error:', err)
      toast.error('Failed to toggle duty.')
      dispatch(setToggling(false))
    }
  }

  return { isOnDuty, isToggling, toggleDuty }
}

export default useDuty