import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { MapPin, Clock, Navigation, Phone, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import useVolunteerTracking from "../hooks/useVolunteerTracking";
import { clearActiveRescue } from "../../../store/slices/alertSlice";
import { formatDistance } from "../utils/geo";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (emoji, color) =>
  new L.DivIcon({
    html: `
    <div style="
      width:40px;height:40px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${emoji}</div>
  `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

const volunteerIcon = makeIcon("🏃", "#16a34a");
const victimIcon = makeIcon("🆘", "#dc2626");

const FitBounds = ({ volunteerPos, victimPos }) => {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (volunteerPos) points.push(volunteerPos);
    if (victimPos) points.push(victimPos);

    if (points.length === 2) {
      map.fitBounds(points, { padding: [60, 60] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [volunteerPos?.[0], volunteerPos?.[1], victimPos?.[0], victimPos?.[1]]);
  return null;
};

const TrackingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myPosition, victimPosition, distance, eta, gpsStatus, activeRescue } =
    useVolunteerTracking();

  const handleEndSession = () => {
    if (!confirm("End this rescue session?")) return;
    dispatch(clearActiveRescue());
    navigate("/dashboard");
  };

  if (!activeRescue) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <Navigation size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#334155" }}>
          No Active Rescue
        </h2>
        <p style={{ color: "#94a3b8", marginTop: 8, marginBottom: 24 }}>
          Accept an SOS alert to start tracking
        </p>
        <button
          onClick={() => navigate("/alert")}
          style={{
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View Alerts
        </button>
      </div>
    );
  }

  const volunteerPos = myPosition
    ? [myPosition.latitude, myPosition.longitude]
    : null;

  const victimPos = victimPosition
    ? [victimPosition.latitude, victimPosition.longitude]
    : null;

  const mapCenter = victimPos || volunteerPos || [28.6139, 77.209];

  const gpsColor =
    gpsStatus === "active"
      ? "#16a34a"
      : gpsStatus === "low_accuracy"
        ? "#d97706"
        : gpsStatus === "acquiring"
          ? "#3b82f6"
          : "#ef4444";

  const gpsLabel =
    gpsStatus === "active"
      ? "● GPS Active"
      : gpsStatus === "low_accuracy"
        ? "◐ Low Accuracy"
        : gpsStatus === "acquiring"
          ? "○ Acquiring GPS..."
          : "✕ GPS Error";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 16px",
          flexShrink: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>
            Live Tracking
          </p>
          <p
            style={{
              fontSize: 11,
              color: gpsColor,
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            {gpsLabel}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {activeRescue.victimPhone && (
            <a
              href={`tel:${activeRescue.victimPhone}`}
              style={{
                width: 36,
                height: 36,
                background: "#f0fdf4",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <Phone size={16} color="#16a34a" />
            </a>
          )}
          <button
            onClick={handleEndSession}
            style={{
              padding: "6px 12px",
              background: "#fef2f2",
              color: "#dc2626",
              border: "none",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            End
          </button>
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds volunteerPos={volunteerPos} victimPos={victimPos} />

          {/* Your position (volunteer) */}
          {volunteerPos && (
            <Marker position={volunteerPos} icon={volunteerIcon}>
              <Popup>
                <b>You (Volunteer)</b>
              </Popup>
            </Marker>
          )}

          {/* Victim position */}
          {victimPos && (
            <Marker position={victimPos} icon={victimIcon}>
              <Popup>
                <b>{activeRescue.victimName}</b>
                <br />
                Victim
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* GPS acquiring overlay */}
        {gpsStatus === "acquiring" && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "white",
              borderRadius: 12,
              padding: "8px 16px",
              zIndex: 1000,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid #3b82f6",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 12, color: "#475569" }}>
              Acquiring your GPS...
            </span>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid #e2e8f0",
          padding: 16,
          flexShrink: 0,
        }}
      >
        {/* Victim info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#fee2e2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "#dc2626",
              flexShrink: 0,
            }}
          >
            {activeRescue.victimName?.[0]}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "#0f172a" }}>
              {activeRescue.victimName}
            </p>
            <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>
              Needs immediate help
            </p>
          </div>
        </div>

        {/* Distance + ETA */}
        {distance != null && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MapPin size={18} color="#3b82f6" />
              <div>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Distance</p>
                <p style={{ fontWeight: 700, color: "#0f172a" }}>
                  {formatDistance(distance)}
                </p>
              </div>
            </div>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Clock size={18} color="#f97316" />
              <div>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>ETA</p>
                <p style={{ fontWeight: 700, color: "#0f172a" }}>
                  {eta ? `~${eta} min` : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Google Maps */}
        {victimPos && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${victimPos[0]},${victimPos[1]}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: 12,
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <Navigation size={16} />
            Navigate with Google Maps
          </a>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TrackingPage;
