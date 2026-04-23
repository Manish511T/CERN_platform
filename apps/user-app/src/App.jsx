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

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div
      className="w-8 h-8 border-4 border-blue-500 border-t-transparent
                    rounded-full animate-spin"
    />
  </div>
);

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
      console.log(
        "=== SOS ACCEPTED SOCKET EVENT ===",
        JSON.stringify(data, null, 2),
      );
      console.log("victimLocation:", data.victimLocation);

      dispatch(
        sosAccepted({
          volunteerId: data.volunteerId,
          volunteerName: data.volunteerName,
        }),
      );

      const { lat, lng } = extractCoords(data.victimLocation);

      if (lat != null && lng != null) {
        dispatch(
          startTracking({
            sosId: data.sosId,
            volunteerId: data.volunteerId,
            volunteerName: data.volunteerName,
            victimLat: lat,
            victimLng: lng,
            volunteerLat: null,
            volunteerLng: null,
          }),
        );
      }
    };

    // location:update — volunteer is broadcasting their position
    const handleLocationUpdate = (data) => {
      console.log("=== location:update received ===", data);
      dispatch(
        updateVolunteerPosition({
          latitude: data.latitude,
          longitude: data.longitude,
        }),
      );
    };

    socket.on(SOCKET_EVENTS.SOS_ACCEPTED, handleSOSAccepted);
    socket.on(SOCKET_EVENTS.LOCATION_UPDATE, handleLocationUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.SOS_ACCEPTED, handleSOSAccepted);
      socket.off(SOCKET_EVENTS.LOCATION_UPDATE, handleLocationUpdate);
    };
  }, [dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
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
