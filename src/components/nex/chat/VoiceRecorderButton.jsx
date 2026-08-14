import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

// Hold-free voice note: tap to start, tap again to stop and send.
export default function VoiceRecorderButton({ style, disabled, onRecorded, onError }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const mime = rec.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      // Safari records audio/mp4 — a .webm name gets served as the wrong type
      // and won't play back.
      const ext = mime.includes("mp4") || mime.includes("mpeg") ? "m4a"
        : mime.includes("ogg") ? "ogg"
        : "webm";
      setBusy(true);
      try {
        await onRecorded(new File([blob], `voice-${Date.now()}.${ext}`, { type: mime }));
      } finally {
        setBusy(false);
      }
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const handleClick = async () => {
    if (busy || disabled) return;
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        onError?.("Voice messages aren't supported on this browser.");
        return;
      }
      await start();
    } catch (e) {
      console.error("Mic permission denied or unavailable", e);
      onError?.("Microphone access was denied.");
    }
  };

  // Leaving the chat mid-recording must release the mic, or iOS keeps the
  // recording indicator up.
  useEffect(() => () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  return (
    <button
      onClick={handleClick}
      aria-label={recording ? "Stop recording" : "Record voice message"}
      style={{
        ...style,
        border: recording ? "1px solid rgba(255,90,90,.6)" : style?.border,
        background: recording ? "rgba(90,16,24,.7)" : style?.background,
      }}
    >
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#bfe2ff" }} />
      ) : recording ? (
        <Square className="w-3.5 h-3.5" style={{ color: "#ff8a80" }} />
      ) : (
        <Mic className="w-4 h-4" style={{ color: "#bfe2ff" }} />
      )}
    </button>
  );
}