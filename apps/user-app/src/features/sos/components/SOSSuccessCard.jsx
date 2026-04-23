import { motion } from "framer-motion";
import { CheckCircle, Users, Zap, MapPin, Navigation } from "lucide-react";
import { Button } from "../../../shared/components/ui";

const sourceLabels = {
  branch: "Branch volunteers",
  nearby: "Nearby volunteers",
  global: "Global network",
};

const SOSSuccessCard = ({
  result,
  volunteer,
  onResolve,
  onCancel,
  onOpenMap, // ✅ added prop
}) => {
  const isAccepted = !!volunteer;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* ── Status Banner ───────────────────────── */}
      <div
        className={`rounded-2xl p-5 text-center ${
          isAccepted ? "bg-green-500" : "bg-blue-500"
        }`}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            repeat: isAccepted ? 0 : Infinity,
            duration: 2,
          }}
          className="inline-flex items-center justify-center w-16 h-16
                     bg-white/20 rounded-full mb-3"
        >
          {isAccepted ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : (
            <Zap className="w-8 h-8 text-white" />
          )}
        </motion.div>

        <h2 className="text-white text-xl font-bold mb-1">
          {isAccepted ? "Help is coming!" : "SOS Sent!"}
        </h2>

        <p className="text-white/80 text-sm">
          {isAccepted
            ? `${volunteer.name} is on the way to you`
            : "Waiting for a volunteer to accept..."}
        </p>
      </div>

      {/* ── Stats ───────────────────────── */}
      {result && !isAccepted && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className="flex justify-center mb-1">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {result.notifiedVolunteers}
            </p>
            <p className="text-xs text-slate-500">Volunteers notified</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className="flex justify-center mb-1">
              <MapPin className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {sourceLabels[result.source] || "Network"}
            </p>
            <p className="text-xs text-slate-500">Dispatch source</p>
          </div>
        </div>
      )}

      {/* ── Volunteer Info ───────────────────────── */}
      {isAccepted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-green-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-600">
              {volunteer.name?.[0]}
            </div>

            <div>
              <p className="font-semibold text-slate-800">{volunteer.name}</p>
              <p className="text-sm text-green-600">Volunteer • En route</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Actions ───────────────────────── */}
      <div className="space-y-3">
        {isAccepted && (
          <>
            {/* 🔥 NEW BUTTON */}
            <Button
              variant="primary"
              size="full"
              onClick={onOpenMap}
              icon={<Navigation className="w-4 h-4" />}
            >
              Track Volunteer Live
            </Button>

            <Button variant="success" size="full" onClick={onResolve}>
              Mark as Resolved
            </Button>
          </>
        )}

        <Button variant="secondary" size="full" onClick={onCancel}>
          Cancel SOS
        </Button>
      </div>
    </motion.div>
  );
};

export default SOSSuccessCard;
