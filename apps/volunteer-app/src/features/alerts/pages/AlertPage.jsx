import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Clock, CheckCircle, X, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import {
  selectIncomingAlert,
  selectActiveRescue,
  setActiveRescue,
  clearIncomingAlert,
} from "../../../store/slices/alertSlice";
import { acceptSOSApi } from "../services/alertApi";
import PageWrapper from "../../../shared/components/layout/PageWrapper";
import { EMERGENCY_LABELS } from "../../../shared/constants";

// Extract lat/lng from various victimLocation shapes
// Backend returns location as GeoJSON: { type:'Point', coordinates:[lng, lat] }
// or as { latitude, longitude }
const extractCoords = (victimLocation) => {
  if (!victimLocation) return { lat: null, lng: null };

  // GeoJSON format: coordinates = [longitude, latitude]
  if (victimLocation.coordinates?.length === 2) {
    return {
      lat: victimLocation.coordinates[1],
      lng: victimLocation.coordinates[0],
    };
  }

  // Flat format
  if (victimLocation.latitude != null) {
    return {
      lat: victimLocation.latitude,
      lng: victimLocation.longitude,
    };
  }

  return { lat: null, lng: null };
};

const AlertPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const incomingAlert = useSelector(selectIncomingAlert);
  const activeRescue = useSelector(selectActiveRescue);
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (!incomingAlert?.sosId) {
      console.error("NO SOS ID in incomingAlert:", incomingAlert);
      return;
    }
    setAccepting(true);

    try {
      const { data } = await acceptSOSApi(incomingAlert.sosId);
      console.log("=== ACCEPT RESPONSE ===", JSON.stringify(data, null, 2));
      const { victimId, victimName, victimPhone, victimLocation } = data.data;

      console.log("victimLocation raw:", victimLocation);
      console.log("victimLocation.coordinates:", victimLocation?.coordinates);

      // Extract coordinates from GeoJSON format
      const { lat, lng } = extractCoords(victimLocation);

      console.log("Extracted lat:", lat, "lng:", lng);

      if (lat == null || lng == null) {
        toast.error(
          "Could not read victim location. Please check SOS details.",
        );
        setAccepting(false);
        return;
      }

      // Store in Redux with clean lat/lng numbers
      dispatch(
        setActiveRescue({
          sosId: incomingAlert.sosId,
          victimId: victimId,
          victimName,
          victimPhone,
          victimLat: lat,
          victimLng: lng,
        }),
      );

      toast.success("SOS accepted! Navigate to victim.", { icon: "🚑" });

      // Navigate AFTER dispatch so tracking page has data
      navigate("/tracking");
    } catch (err) {
      console.error("Accept SOS error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to accept SOS.");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    dispatch(clearIncomingAlert());
    toast("Alert dismissed.", { icon: "↩️" });
    navigate("/dashboard");
  };

  const info = incomingAlert
    ? EMERGENCY_LABELS[incomingAlert.emergencyType] || EMERGENCY_LABELS.other
    : null;

  // ── Active rescue in progress ───────────────────────────────────────────────
  if (activeRescue) {
    return (
      <PageWrapper title="Active Rescue">
        <div className="space-y-4">
          <div className="bg-green-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Rescue in Progress</h2>
                <p className="text-green-100 text-sm">Navigate to victim</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 bg-green-100 rounded-full flex items-center
                              justify-center text-lg font-bold text-green-600"
              >
                {activeRescue.victimName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {activeRescue.victimName}
                </p>
                <p className="text-sm text-slate-500">Victim</p>
              </div>
            </div>

            {activeRescue.victimPhone && (
              <a
                href={`tel:${activeRescue.victimPhone}`}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl
                           hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {activeRescue.victimPhone}
                </span>
              </a>
            )}

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {activeRescue.victimLat?.toFixed(5)},{" "}
                {activeRescue.victimLng?.toFixed(5)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/tracking")}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white
                       font-semibold rounded-xl transition-colors flex items-center
                       justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Open Live Tracking Map
          </button>
        </div>
      </PageWrapper>
    );
  }

  // ── No alert ────────────────────────────────────────────────────────────────
  if (!incomingAlert) {
    return (
      <PageWrapper title="Alerts">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div
            className="w-20 h-20 bg-slate-100 rounded-full flex items-center
                          justify-center mb-4"
          >
            <CheckCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700">
            No Active Alerts
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Stay on duty to receive SOS alerts
          </p>
        </div>
      </PageWrapper>
    );
  }

  // ── Incoming alert ──────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Incoming SOS" showNav={false}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5"
        >
          {/* Alert banner */}
          <div className="bg-red-500 rounded-2xl p-6 text-center text-white">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-3"
            >
              {info.emoji}
            </motion.div>
            <h2 className="text-2xl font-bold mb-1">{info.label}</h2>
            <p className="text-red-100">Emergency Alert</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 bg-blue-50 rounded-xl flex items-center
                              justify-center shrink-0"
              >
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Location</p>
                <p className="text-sm text-slate-500">
                  {incomingAlert.location?.address ||
                    "GPS coordinates received"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 bg-orange-50 rounded-xl flex items-center
                              justify-center shrink-0"
              >
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Triggered by
                </p>
                <p className="text-sm text-slate-500">
                  {incomingAlert.triggeredBy?.name || "Anonymous"}
                </p>
              </div>
            </div>
          </div>

          {/* Photo */}
          {incomingAlert.photoUrl && (
            <img
              src={incomingAlert.photoUrl}
              alt="Emergency"
              className="w-full h-48 object-cover rounded-2xl"
            />
          )}

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white
                         font-bold text-lg rounded-2xl transition-colors
                         disabled:opacity-60 flex items-center justify-center
                         gap-2 shadow-lg shadow-green-100"
            >
              {accepting && (
                <span
                  className="w-5 h-5 border-2 border-white
                                 border-t-transparent rounded-full animate-spin"
                />
              )}
              ✅ Accept & Respond
            </motion.button>

            <button
              onClick={handleDecline}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600
                         font-medium rounded-2xl border border-slate-200
                         transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
};

export default AlertPage;
