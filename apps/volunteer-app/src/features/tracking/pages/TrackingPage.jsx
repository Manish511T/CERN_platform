import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Navigation, Phone } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import useVolunteerTracking from '../hooks/useVolunteerTracking'
import PageWrapper from '../../../shared/components/layout/PageWrapper'
import { formatDistance } from '../utils/geo'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Volunteer marker
const volunteerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32">
      <circle cx="16" cy="16" r="12" fill="#16a34a" stroke="white" stroke-width="3"/>
      <text x="16" y="21" text-anchor="middle" fill="white" font-size="14">🏃</text>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Victim marker
const victimIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32">
      <circle cx="16" cy="16" r="12" fill="#dc2626" stroke="white" stroke-width="3"/>
      <text x="16" y="21" text-anchor="middle" fill="white" font-size="14">🆘</text>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Auto center map
const MapAutoCenter = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], map.getZoom())
    }
  }, [position, map])
  return null
}

const TrackingPage = () => {
  const navigate = useNavigate()

  const {
    myPosition,
    victimPosition,
    distance,
    eta,
    gpsStatus,
    activeRescue,
  } = useVolunteerTracking()

  if (!activeRescue) {
    return (
      <PageWrapper title="Live Tracking">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Navigation className="w-10 h-10 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">No Active Rescue</h2>
          <p className="text-sm text-slate-400 mt-2">
            Accept an SOS alert to start tracking
          </p>
          <button
            onClick={() => navigate('/alert')}
            className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl"
          >
            View Alerts
          </button>
        </div>
      </PageWrapper>
    )
  }

  const defaultCenter = victimPosition
    ? [victimPosition.latitude, victimPosition.longitude]
    : [28.6139, 77.2090]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Live Tracking</h1>
            <p className="text-xs">
              GPS {gpsStatus === 'acquiring' ? 'acquiring...' : gpsStatus}
            </p>
          </div>

          {/* ✅ FIXED */}
          {activeRescue?.victimPhone && (
            <a
              href={`tel:${activeRescue.victimPhone}`}
              className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"
            >
              <Phone className="w-5 h-5 text-green-600" />
            </a>
          )}
        </div>
      </header>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {myPosition && (
            <>
              <MapAutoCenter position={myPosition} />
              <Marker position={[myPosition.latitude, myPosition.longitude]} icon={volunteerIcon}>
                <Popup>You</Popup>
              </Marker>
            </>
          )}

          {victimPosition && (
            <Marker position={[victimPosition.latitude, victimPosition.longitude]} icon={victimIcon}>
              <Popup>{activeRescue.victimName}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bottom */}
      <div className="bg-white p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            Distance: {formatDistance(distance)}
          </div>
          <div>
            ETA: {eta ? `${eta} min` : '--'}
          </div>
        </div>

        {/* ✅ FIXED */}
        {victimPosition && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${victimPosition.latitude},${victimPosition.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center bg-blue-600 text-white py-3 rounded-xl"
          >
            Open in Google Maps
          </a>
        )}
      </div>
    </div>
  )
}

export default TrackingPage