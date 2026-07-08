import React, { useState } from "react";
import { motion } from "framer-motion";
import { Hand, Loader2, Check, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WaveButton({ targetUser, onMutualMatch, compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | matched | error
  const [error, setError] = useState("");

  const targetId = targetUser.created_by_id || targetUser.id;

  const handleWave = async () => {
    setStatus("sending");
    setError("");
    try {
      const res = await base44.functions.invoke("submitWave", { receiver_id: targetId });
      const data = res.data;

      if (data.mutual_match) {
        setStatus("matched");
        if (onMutualMatch) onMutualMatch(data.conversation_id);
      } else if (data.error && data.error.includes("limit")) {
        setError(data.error);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      setStatus("error");
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleWave}
        disabled={status === "sending" || status === "sent" || status === "matched"}
        className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${
          status === "matched"
            ? "bg-green-500/20 text-green-400"
            : status === "sent"
              ? "glass text-white/40"
              : "gradient-blue text-white"
        }`}
      >
        {status === "sending" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === "matched" ? (
          <>
            <Check className="w-4 h-4" /> Matched!
          </>
        ) : status === "sent" ? (
          "Wave sent"
        ) : (
          <>
            <Hand className="w-4 h-4" /> Wave
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <motion.button
        onClick={handleWave}
        disabled={status === "sending" || status === "sent" || status === "matched"}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors ${
          status === "matched"
            ? "bg-green-500/20 text-green-400"
            : status === "sent"
              ? "glass text-white/40"
              : "gradient-blue text-white"
        }`}
      >
        {status === "sending" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Sending…
          </>
        ) : status === "matched" ? (
          <>
            <Check className="w-5 h-5" /> Mutual match! Chat open
          </>
        ) : status === "sent" ? (
          "Wave sent — waiting for response"
        ) : (
          <>
            <Hand className="w-5 h-5" /> Wave to connect
          </>
        )}
      </motion.button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      {status === "idle" && (
        <p className="text-white/20 text-xs text-center">
          Both people must wave before a chat opens. No unsolicited messages.
        </p>
      )}
    </div>
  );
}