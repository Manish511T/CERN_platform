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
  const activeRescue  = useSelector(selectActiveRescue)

  const [myPosition, setMyPosition] = useState(null)
  const [distance,   setDistance]   = useState(null)
  const [eta,        setEta]        = useState(null)
  const [gpsStatus,  setGpsStatus]  = useState('idle')

  const lastEmitRef = useRef(0)
  const watchIdRef  = useRef(null)

  // Derive victimPosition directly from activeRescue — no state needed
  const victimPosition = useMemo(() => {
    if (!activeRescue?.victimLocation?.coordinates) return null
    const [lng, lat] = activeRescue.victimLocation.coordinates
    return { latitude: lat, longitude: lng }
  }, [activeRescue])

  // Broadcast volunteer GPS to victim via socket
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
  }, [activeRescue])

  // Watch GPS and broadcast
  useEffect(() => {
    if (!activeRescue) return

    setGpsStatus('acquiring')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords

        setMyPosition({ latitude, longitude })
        setGpsStatus(accuracy <= 50 ? 'active' : 'low_accuracy')
        broadcastLocation(latitude, longitude)

        // Calculate distance + ETA using victimPosition from memo
        if (victimPosition) {
          const dist = getDistanceMeters(
            latitude,               longitude,
            victimPosition.latitude, victimPosition.longitude
          )
          setDistance(Math.round(dist))
          setEta(getETAMinutes(dist))
        }
      },
      () => setGpsStatus('error'),
      GPS_OPTIONS
    )

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
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