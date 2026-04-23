import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate }  from 'react-router-dom'
import { motion }       from 'framer-motion'
import { MapPin, Clock, Navigation, CheckCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { selectActiveTracking, stopTracking } from '../../../store/slices/trackingSlice'
import { clearSOS } from '../../../store/slices/sosSlice'
import { updateSOSStatusApi } from '../../sos/services/sosApi'
import { getDistanceMeters, getETAMinutes, formatDistance } from '../utils/geo'
import toast from 'react-hot-toast'

// ── Fix Leaflet default marker icon ────────────────────────────────────────────
// Vite mangles the default icon URLs — must override manually
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Custom marker icons ────────────────────────────────────────────────────────
const makeIcon = (emoji, color) => new L.DivIcon({
  html: `
    <div style="
      width: 40px; height: 40px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${emoji}</div>
  `,
  className:   '',
  iconSize:    [40, 40],
  iconAnchor:  [20, 20],
  popupAnchor: [0, -20],
})

const volunteerIcon = makeIcon('🏃', '#16a34a')
const victimIcon    = makeIcon('📍', '#2563eb')

// ── Auto-fit map to show both markers ─────────────────────────────────────────
const FitBounds = ({ volunteerPos, victimPos }) => {
  const map = useMap()

  useEffect(() => {
    const points = []
    if (volunteerPos) points.push(volunteerPos)
    if (victimPos)    points.push(victimPos)

    if (points.length === 2) {
      map.fitBounds(points, { padding: [60, 60] })
    } else if (points.length === 1) {
      map.setView(points[0], 15)
    }
  }, [
    volunteerPos?.[0], volunteerPos?.[1],
    victimPos?.[0],    victimPos?.[1],
  ])

  return null
}

// ── Main component ─────────────────────────────────────────────────────────────
const TrackingPage = () => {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const activeTracking = useSelector(selectActiveTracking)

  // No active tracking
  if (!activeTracking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center
                      justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center
                        justify-center mb-4">
          <Navigation className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-slate-700">No Active Tracking</h2>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          Trigger an SOS to start tracking your volunteer
        </p>
        <button
          onClick={() => navigate('/sos')}
          className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl text-sm"
        >
          Go to SOS
        </button>
      </div>
    )
  }

  const volunteerPos = (activeTracking.volunteerLat != null && activeTracking.volunteerLng != null)
    ? [activeTracking.volunteerLat, activeTracking.volunteerLng]
    : null

  const victimPos = (activeTracking.victimLat != null && activeTracking.victimLng != null)
    ? [activeTracking.victimLat, activeTracking.victimLng]
    : null

  // Default center — prefer victim position (we know it on load)
  const mapCenter = victimPos || volunteerPos || [28.6139, 77.2090]

  const distance = (volunteerPos && victimPos)
    ? Math.round(getDistanceMeters(
        activeTracking.volunteerLat, activeTracking.volunteerLng,
        activeTracking.victimLat,    activeTracking.victimLng
      ))
    : null

  const eta = distance ? getETAMinutes(distance) : null

  const handleResolved = async () => {
    if (!confirm('Mark emergency as resolved?')) return
    try {
      await updateSOSStatusApi(activeTracking.sosId, 'resolved')
      dispatch(stopTracking())
      dispatch(clearSOS())
      toast.success('Emergency resolved. Stay safe! ✅')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to mark as resolved.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 40,
      }}>
        <div>
          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>
            Help is Coming
          </p>
          <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, marginTop: 2 }}>
            ● {activeTracking.volunteerName} is on the way
          </p>
        </div>

        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f0fdf4', borderRadius: 20,
            padding: '4px 10px',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#16a34a', display: 'inline-block',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
            LIVE
          </span>
        </motion.div>
      </div>

      {/* MAP — fixed pixel height, this is critical */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds volunteerPos={volunteerPos} victimPos={victimPos} />

          {/* Volunteer position */}
          {volunteerPos && (
            <Marker position={volunteerPos} icon={volunteerIcon}>
              <Popup>
                <b>{activeTracking.volunteerName}</b><br />
                Volunteer — heading to you
              </Popup>
            </Marker>
          )}

          {/* Victim (your) position */}
          {victimPos && (
            <Marker position={victimPos} icon={victimIcon}>
              <Popup><b>Your Location</b></Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Waiting overlay — shown until volunteer starts broadcasting */}
        {!volunteerPos && (
          <div style={{
            position: 'absolute', top: 12, left: '50%',
            transform: 'translateX(-50%)',
            background: 'white', borderRadius: 12,
            padding: '8px 16px', zIndex: 1000,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 14, height: 14,
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 12, color: '#475569' }}>
              Waiting for volunteer location...
            </span>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        padding: '16px',
        flexShrink: 0,
      }}>
        {/* Volunteer card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44,
            background: '#dcfce7', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#16a34a',
            flexShrink: 0,
          }}>
            {activeTracking.volunteerName?.[0]}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>
              {activeTracking.volunteerName}
            </p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Volunteer • En route to you
            </p>
          </div>
        </div>

        {/* Distance + ETA */}
        {volunteerPos && distance != null && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 12,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <MapPin size={18} color="#3b82f6" />
              <div>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Distance</p>
                <p style={{ fontWeight: 700, color: '#0f172a' }}>
                  {formatDistance(distance)}
                </p>
              </div>
            </div>
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 12,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Clock size={18} color="#f97316" />
              <div>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>ETA</p>
                <p style={{ fontWeight: 700, color: '#0f172a' }}>
                  {eta != null ? `~${eta} min` : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resolve button */}
        <button
          onClick={handleResolved}
          style={{
            width: '100%', padding: '12px',
            background: '#16a34a', color: 'white',
            border: 'none', borderRadius: 12,
            fontWeight: 600, fontSize: 15,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <CheckCircle size={18} />
          Mark as Resolved
        </button>
      </div>

      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default TrackingPage