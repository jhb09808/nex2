import React, { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

// Hold-free voice note: tap to start, tap again to stop and send.
export default function VoiceRecorderButton({ style, disabled, onRecorded }) {
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
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      setBusy(true);
      try {
        await onRecorded(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }));
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
      await start();
    } catch (e) {
      console.error("Mic permission denied or unavailable", e);
    }
  };

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