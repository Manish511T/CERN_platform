import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading } from "./store/slices/authSlice";
import {
  startTracking,
  updateVolunteerPosition,
} from "./store/slices/trackingSlice";
import { sosAccepted } from "./store/slices/sosSlice";
import api from "./services/api";
import socket from "./socket/socket";
import { SOCKET_EVENTS } from "./shared/constants";
import ProtectedRoute from "./router/ProtectedRoute";
import PublicRoute from "./router/PublicRoute";
import toast from "react-hot-toast";
import AuthPageSkeleton from "./features/auth/components/AuthPageSkeleton";

const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const Dashboard = lazy(
  () => import("./features/dashboard/pages/DashboardPage"),
);
const SOSPage = lazy(() => import("./features/sos/pages/SOSPage"));
const TrackingPage = lazy(
  () => import("./features/tracking/pages/TrackingPage"),
);
const ProfilePage = lazy(() => import("./features/profile/pages/ProfilePage"));

const PageLoader = () => <AuthPageSkeleton />;

// Extract lat/lng from GeoJSON or flat format
const extractCoords = (location) => {
  if (!location) return { lat: null, lng: null };
  if (location.coordinates?.length === 2) {
    return { lat: location.coordinates[1], lng: location.coordinates[0] };
  }
  if (location.latitude != null) {
    return { lat: location.latitude, lng: location.longitude };
  }
  return { lat: null, lng: null };
};

const App = () => {
  const dispatch = useDispatch();

  // Session restore on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        const token = data.data.accessToken;

        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = meRes.data.data.user;

        // Ensure this app only restores USER sessions
        if (user.role !== "user") {
          console.log("Non-user session found in user app — ignoring");
          dispatch(setLoading(false));
          return;
        }

        dispatch(setCredentials({ user, accessToken: token }));
        socket.auth = { token };
        socket.connect();
      } catch {
        dispatch(setLoading(false));
      }
    };
    restoreSession();
  }, [dispatch]);

  // Global socket listeners — must be at App level to survive navigation
useEffect(() => {
  // sos:accepted — volunteer accepted our SOS
  const handleSOSAccepted = (data) => {
    console.log('=== sos:accepted ===', data)
    dispatch(sosAccepted({
      volunteerId:   data.volunteerId,
      volunteerName: data.volunteerName,
    }))

    const coords = data.victimLocation?.coordinates
    const lat = data.victimLocation?.latitude  ?? coords?.[1]
    const lng = data.victimLocation?.longitude ?? coords?.[0]

    if (lat != null && lng != null) {
      dispatch(startTracking({
        sosId:         data.sosId,
        volunteerId:   data.volunteerId,
        volunteerName: data.volunteerName,
        victimLat:     lat,
        victimLng:     lng,
        volunteerLat:  null,
        volunteerLng:  null,
      }))
    }
  }

  // sos:alert with type=firstaid — we are a nearby user being asked to help
  const handleSOSAlert = (data) => {
    console.log('=== sos:alert (user) ===', data)
    if (data.type === 'firstaid') {
      // Show toast with first aid request
      toast(
        (t) => (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>🚑</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                First Aid Needed Nearby!
              </p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Someone within 500m needs immediate help
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                {data.emergencyType} emergency
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                marginLeft: 'auto', padding: '6px 12px',
                background: '#dc2626', color: 'white',
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        ),
        {
          duration:   30000,
          style: {
            background:   '#fff',
            border:       '2px solid #fca5a5',
            borderRadius: '16px',
            padding:      '12px',
            maxWidth:     '360px',
          },
        }
      )
    }
  }

  // sos:volunteer_assigned — nearby user told volunteer is coming
  const handleVolunteerAssigned = (data) => {
    toast.success(
      `✅ Volunteer ${data.volunteerName} has been assigned to this emergency.`,
      { duration: 6000 }
    )
  }

  // location:update — volunteer broadcasting position
  const handleLocationUpdate = (data) => {
    dispatch(updateVolunteerPosition({
      latitude:  data.latitude,
      longitude: data.longitude,
    }))
  }

  socket.on(SOCKET_EVENTS.SOS_ACCEPTED,           handleSOSAccepted)
  socket.on(SOCKET_EVENTS.SOS_ALERT,              handleSOSAlert)
  socket.on(SOCKET_EVENTS.SOS_VOLUNTEER_ASSIGNED, handleVolunteerAssigned)
  socket.on(SOCKET_EVENTS.LOCATION_UPDATE,        handleLocationUpdate)

  return () => {
    socket.off(SOCKET_EVENTS.SOS_ACCEPTED,           handleSOSAccepted)
    socket.off(SOCKET_EVENTS.SOS_ALERT,              handleSOSAlert)
    socket.off(SOCKET_EVENTS.SOS_VOLUNTEER_ASSIGNED, handleVolunteerAssigned)
    socket.off(SOCKET_EVENTS.LOCATION_UPDATE,        handleLocationUpdate)
  }
}, [dispatch])

  return (
    <Suspense fallback={<AuthPageSkeleton/>}>
      <Routes>
        <Route element={<PublicRoute redirectTo="/dashboard" />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
