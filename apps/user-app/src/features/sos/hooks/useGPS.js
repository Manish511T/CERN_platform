import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}

const useGPS = () => {
  // ✅ Initialize properly (no setState in effect)
  const [gpsStatus, setGpsStatus] = useState(() => {
    if (!navigator.geolocation) return 'error'
    return 'acquiring'
  })

  const [location, setLocation] = useState(null)
  const [accuracy, setAccuracy] = useState(null)

  const watchIdRef = useRef(null)

  // ✅ Success callback (async update → correct)
  const onSuccess = useCallback((pos) => {
    const { latitude, longitude, accuracy: acc } = pos.coords

    setLocation({ latitude, longitude })
    setAccuracy(Math.round(acc))

    setGpsStatus(acc <= 50 ? 'ready' : 'low_accuracy')
  }, [])

  // ✅ Error callback
  const onError = useCallback((err) => {
    setGpsStatus('error')

    const messages = {
      1: 'Location access denied. Please enable GPS.',
      2: 'Location unavailable. Check your GPS signal.',
      3: 'Location request timed out. Try again.',
    }

    toast.error(messages[err.code] || 'GPS error occurred.')
  }, [])

  // ✅ Effect ONLY for subscription (correct pattern)
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device.')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      GPS_OPTIONS
    )

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [onSuccess, onError])

  // ✅ Fresh location fetch (for SOS)
  const getFreshLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy: acc } = pos.coords

          setLocation({ latitude, longitude })
          setAccuracy(Math.round(acc))

          resolve({ latitude, longitude, accuracy: acc })
        },
        (err) => {
          onError(err)
          reject(err)
        },
        GPS_OPTIONS
      )
    })
  }, [onError])

  // ✅ UI helpers
  const accuracyColor = () => {
    if (!accuracy) return 'text-slate-400'
    if (accuracy <= 20) return 'text-green-600'
    if (accuracy <= 50) return 'text-yellow-600'
    return 'text-red-500'
  }

  const accuracyLabel = () => {
    if (gpsStatus === 'acquiring') return 'Acquiring GPS...'
    if (gpsStatus === 'error') return 'GPS unavailable'
    if (!accuracy) return 'Locating...'
    return `±${accuracy}m accuracy`
  }

  return {
    location,
    accuracy,
    gpsStatus,
    getFreshLocation,
    accuracyColor,
    accuracyLabel,
  }
}

export default useGPS