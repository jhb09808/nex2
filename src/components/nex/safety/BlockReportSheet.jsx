import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, Ban, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Portal from "@/components/nex/Portal";

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "stalking", label: "Stalking" },
  { value: "underage_suspicion", label: "Underage Suspicion" },
  { value: "threat", label: "Threat / Violence" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "other", label: "Other" },
];

export default function BlockReportSheet({ user, open, onClose, onBlocked }) {
  const [mode, setMode] = useState(null); // null | 'report' | 'block'
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [error, setError] = useState("");

  const targetId = user?.created_by_id || user?.id;

  const reset = () => {
    setMode(null);
    setReason("");
    setDescription("");
    setStatus("idle");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBlock = async () => {
    setStatus("submitting");
    setError("");
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length === 0) throw new Error("Profile not found");
      const p = profiles[0];
      const blocked = p.blocked_users || [];
      if (!blocked.includes(targetId)) {
        await base44.entities.UserProfile.update(p.id, {
          blocked_users: [...blocked, targetId],
        });
      }
      setStatus("done");
      setTimeout(() => {
        if (onBlocked) onBlocked();
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handleReport = async () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      await base44.functions.invoke("createReport", {
        reported_user_id: targetId,
        reason,
        description,
      });
      setStatus("done");
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setStatus("idle");
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg p-4 safe-bottom"
            >
              <div className="glass-strong rounded-3xl p-6">
                {/* Handle */}
                <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mb-5" />

                {status === "done" ? (
                  <div className="text-center py-6">
                    <div className="inline-flex w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-white font-semibold">
                      {mode === "block" ? "User blocked" : "Report submitted"}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {mode === "block"
                        ? "They won't be notified and can't contact you."
                        : "Our team will review this report."}
                    </p>
                  </div>
                ) : !mode ? (
                  <>
                    <h3 className="text-white font-semibold text-lg mb-1">Safety options</h3>
                    <p className="text-white/40 text-xs mb-5">
                      {user?.username ? `Managing @${user.username}` : "Managing this user"}
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setMode("report")}
                        className="w-full p-4 rounded-xl glass flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                      >
                        <Flag className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Report</p>
                          <p className="text-white/30 text-xs">Flag for harassment, threats, or underage</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setMode("block")}
                        className="w-full p-4 rounded-xl glass flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                      >
                        <Ban className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Block</p>
                          <p className="text-white/30 text-xs">Silently block — they won't know</p>
                        </div>
                      </button>
                    </div>
                    <button onClick={handleClose} className="w-full mt-4 py-3 text-white/40 text-sm">
                      Cancel
                    </button>
                  </>
                ) : mode === "report" ? (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <button onClick={() => setMode(null)} className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                        <X className="w-4 h-4 text-white/40" />
                      </button>
                      <h3 className="text-white font-semibold">Report user</h3>
                    </div>
                    <p className="text-white/40 text-xs mb-3">Select a reason</p>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
                      {REPORT_REASONS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setReason(r.value)}
                          className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${
                            reason === r.value ? "glass-strong ring-1 ring-blue-500/50 text-white" : "glass text-white/50"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details (optional)…"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm resize-none mb-4"
                    />
                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                    <button
                      onClick={handleReport}
                      disabled={status === "submitting"}
                      className="w-full py-3.5 rounded-2xl bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                      Submit Report
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <button onClick={() => setMode(null)} className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                        <X className="w-4 h-4 text-white/40" />
                      </button>
                      <h3 className="text-white font-semibold">Block user</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                      <p className="text-white/60 text-sm leading-relaxed">
                        Blocking is <span className="text-white font-medium">silent</span> — they won't be notified and won't be able to detect it. They can't wave at you, message you, or see your profile.
                      </p>
                    </div>
                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                    <button
                      onClick={handleBlock}
                      disabled={status === "submitting"}
                      className="w-full py-3.5 rounded-2xl bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                      Confirm Block
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}