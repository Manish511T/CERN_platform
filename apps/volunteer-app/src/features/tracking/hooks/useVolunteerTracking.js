import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectActiveRescue } from '../../../store/slices/alertSlice'
import socket from '../../../socket/socket'
import { SOCKET_EVENTS } from '../../../shared/constants'
import { getDistanceMeters, getETAMinutes } from '../utils/geo'

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout:            15000,
  maximumAge:         0,
}

const EMIT_INTERVAL_MS = 3000

const useVolunteerTracking = () => {
  const activeRescue = useSelector(selectActiveRescue)

  const [myPosition, setMyPosition] = useState(null)
  const [distance,   setDistance]   = useState(null)
  const [eta,        setEta]        = useState(null)
  const [gpsStatus,  setGpsStatus]  = useState('idle')

  const lastEmitRef = useRef(0)
  const watchIdRef  = useRef(null)

  // Victim position comes directly from Redux (already lat/lng numbers)
  const victimPosition = useMemo(() => {
    if (activeRescue?.victimLat == null || activeRescue?.victimLng == null) {
      return null
    }
    return {
      latitude:  activeRescue.victimLat,
      longitude: activeRescue.victimLng,
    }
  }, [activeRescue])

  const broadcastLocation = useCallback((latitude, longitude) => {
    if (!activeRescue?.sosId || !activeRescue?.victimId) return

    const now = Date.now()
    if (now - lastEmitRef.current < EMIT_INTERVAL_MS) return
    lastEmitRef.current = now

    socket.emit(SOCKET_EVENTS.VOLUNTEER_LOCATION, {
      sosId:    activeRescue.sosId,
      latitude,
      longitude,
      toUserId: activeRescue.victimId,
    })

    console.log('📍 Broadcasting location to victim:', activeRescue.victimId, { latitude, longitude })
  }, [activeRescue])

  useEffect(() => {
    if (!activeRescue) return

    console.log('=== TRACKING STARTED ===')
    console.log('activeRescue:', activeRescue)
    console.log('victimPosition:', victimPosition)

    if (!navigator.geolocation) {
      setGpsStatus('error')
      return
    }

    setGpsStatus('acquiring')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords

        setMyPosition({ latitude, longitude })
        setGpsStatus(accuracy <= 50 ? 'active' : 'low_accuracy')
        broadcastLocation(latitude, longitude)

        if (victimPosition) {
          const dist = getDistanceMeters(
            latitude, longitude,
            victimPosition.latitude, victimPosition.longitude
          )
          setDistance(Math.round(dist))
          setEta(getETAMinutes(dist))
        }
      },
      (err) => {
        console.error('GPS error:', err)
        setGpsStatus('error')
      },
      GPS_OPTIONS
    )

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [activeRescue, broadcastLocation, victimPosition])

  return {
    myPosition,
    victimPosition,
    distance,
    eta,
    gpsStatus,
    activeRescue,
  }
}

export default useVolunteerTracking