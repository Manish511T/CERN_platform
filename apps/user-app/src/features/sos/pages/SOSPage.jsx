import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { AlertCircle, Camera, Mic, MicOff, X } from "lucide-react";
import {
  selectActiveSOS,
  selectLastResult,
  selectVolunteer,
} from "../../../store/slices/sosSlice";
import { Button, Card } from "../../../shared/components/ui";
import PageWrapper from "../../../shared/components/layout/PageWrapper";
import CountdownOverlay from "../components/CountdownOverlay";
import GPSIndicator from "../components/GPSIndicator";
import EmergencyTypeSelector from "../components/EmergencyTypeSelector";
import SOSSuccessCard from "../components/SOSSuccessCard";
import useGPS from "../hooks/useGPS";
import useSOS from "../hooks/useSOS";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { selectActiveTracking } from "../../../store/slices/trackingSlice";

const SOSPage = () => {
  // Form state
  const [emergencyType, setEmergencyType] = useState("accident");
  const [forSelf, setForSelf] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);

  const photoInputRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const cancelCountRef = useRef(null);

  // Redux state
  const navigate = useNavigate();
  const activeSOS = useSelector(selectActiveSOS);
  const lastResult = useSelector(selectLastResult);
  const volunteer = useSelector(selectVolunteer);
  const activeTracking = useSelector(selectActiveTracking);

  // Hooks
  const {
    location,
    gpsStatus,
    getFreshLocation,
    accuracyColor,
    accuracyLabel,
  } = useGPS();

  const { countdown, startCountdown, triggerSOS, cancelSOS, resolveSOS } =
    useSOS();

    // ── SOS Submit ──────────────────────────────────────────────────────────────
  const handleSOSSubmit = useCallback(() => {
    if (gpsStatus === "error") {
      toast.error("GPS required to send SOS.");
      return;
    }

    // Start countdown — fire SOS when it reaches 0
    cancelCountRef.current = startCountdown(async () => {
      try {
        const freshLocation = await getFreshLocation();

        await triggerSOS({
          latitude: freshLocation.latitude,
          longitude: freshLocation.longitude,
          emergencyType,
          forSelf,
          photo: photo || undefined,
          voice: voiceBlob
            ? new File([voiceBlob], "voice.webm", { type: "audio/webm" })
            : undefined,
        });
      } catch {
        toast.error("Could not get fresh location. Using last known.");
        if (location) {
          await triggerSOS({
            latitude: location.latitude,
            longitude: location.longitude,
            emergencyType,
            forSelf,
          });
        }
      }
    });
  }, [
    gpsStatus,
    location,
    emergencyType,
    forSelf,
    photo,
    voiceBlob,
    startCountdown,
    getFreshLocation,
    triggerSOS,
  ]);

   // If tracking is active (volunteer accepted + broadcasting), show link to map
  if (activeSOS && activeTracking) {
    return (
      <PageWrapper title="SOS Active">
        <SOSSuccessCard
          result={lastResult}
          volunteer={volunteer}
          onResolve={resolveSOS}
          onCancel={cancelSOS}
          onOpenMap={() => navigate("/tracking")} 
        />
      </PageWrapper>
    );
  }

  // After SOS triggered — show success/waiting state
  if (activeSOS) {
    return (
      <PageWrapper title="SOS Active">
        <SOSSuccessCard
          result={lastResult}
          volunteer={volunteer}
          onResolve={resolveSOS}
          onCancel={cancelSOS}
        />
      </PageWrapper>
    );
  }

  // ── Photo handler ───────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

 

  // ── Voice recording ─────────────────────────────────────────────────────────
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied.");
    }
  };

  const removeVoice = () => setVoiceBlob(null);



  const handleCancelCountdown = () => {
    cancelCountRef.current?.();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  

  return (
    <>
      {/* Countdown overlay — renders on top of everything */}
      <CountdownOverlay
        countdown={countdown}
        onCancel={handleCancelCountdown}
      />

      <PageWrapper title="Send SOS">
        <div className="space-y-5">
          {/* GPS Status */}
          <GPSIndicator
            gpsStatus={gpsStatus}
            accuracyColor={accuracyColor}
            accuracyLabel={accuracyLabel}
          />

          {/* For self toggle */}
          <Card padding="md">
            <p className="text-sm font-medium text-slate-700 mb-3">
              This emergency is for
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: "Myself" },
                { value: false, label: "Someone else" },
              ].map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setForSelf(value)}
                  className={`
                    py-2.5 rounded-xl border-2 text-sm font-medium
                    transition-all duration-200
                    ${
                      forSelf === value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {/* Emergency type */}
          <Card padding="md">
            <EmergencyTypeSelector
              value={emergencyType}
              onChange={setEmergencyType}
            />
          </Card>

          {/* Optional media */}
          <Card padding="md">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Attach evidence
              <span className="text-slate-400 font-normal ml-1">
                (optional)
              </span>
            </p>

            <div className="flex gap-3">
              {/* Photo */}
              <div className="flex-1">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <button
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500
                                 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-200
                               rounded-xl flex flex-col items-center justify-center
                               gap-2 hover:border-blue-400 hover:bg-blue-50
                               transition-all"
                  >
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-400">Photo</span>
                  </button>
                )}
              </div>

              {/* Voice */}
              <div className="flex-1">
                {voiceBlob ? (
                  <div
                    className="relative h-24 border-2 border-green-200
                                  bg-green-50 rounded-xl flex flex-col
                                  items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">
                      Recorded
                    </span>
                    <button
                      onClick={removeVoice}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500
                                 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`
                      w-full h-24 border-2 border-dashed rounded-xl
                      flex flex-col items-center justify-center gap-2
                      transition-all
                      ${
                        isRecording
                          ? "border-red-400 bg-red-50 animate-pulse"
                          : "border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                      }
                    `}
                  >
                    {isRecording ? (
                      <MicOff className="w-5 h-5 text-red-500" />
                    ) : (
                      <Mic className="w-5 h-5 text-slate-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isRecording ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      {isRecording ? "Stop" : "Voice note"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* SOS Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSOSSubmit}
            disabled={gpsStatus === "error" || gpsStatus === "idle"}
            className={`
              w-full py-5 rounded-2xl font-bold text-xl text-white
              flex items-center justify-center gap-3
              shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                gpsStatus === "error" || gpsStatus === "idle"
                  ? "bg-slate-400"
                  : "bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-red-200"
              }
            `}
          >
            <motion.div
              animate={
                gpsStatus === "ready" || gpsStatus === "low_accuracy"
                  ? { scale: [1, 1.2, 1] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertCircle className="w-7 h-7" />
            </motion.div>
            SEND SOS
          </motion.button>

          <p className="text-center text-xs text-slate-400">
            A 3-second countdown will start. You can cancel before it fires.
          </p>
        </div>
      </PageWrapper>
    </>
  );
};

export default SOSPage;
