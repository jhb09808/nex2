import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProximityMatchNudge() {
  const navigate = useNavigate();
  const [activeNudge, setActiveNudge] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const myIdRef = useRef(null);
  const autoDismissTimer = useRef(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const me = await base44.auth.me();
        if (!isMounted) return;
        myIdRef.current = me.id;

        // Load recent unread match notifications
        const notifs = await base44.entities.Notification.filter(
          { user_id: me.id, type: "match", is_read: false },
          "-created_date",
          5
        );
        if (!isMounted) return;

        const unseen = notifs.filter((n) => !dismissedIds.has(n.id));
        if (unseen.length > 0) {
          setActiveNudge(unseen[0]);
          scheduleAutoDismiss(unseen[0].id);
        }
      } catch {
        // Silent fail — nudge is non-critical
      }
    })();

    // Subscribe to new match notifications in real-time
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type !== "create") return;
      const n = event.data;
      if (n.type !== "match" || n.user_id !== myIdRef.current) return;
      if (dismissedIds.has(n.id)) return;
      setActiveNudge(n);
      scheduleAutoDismiss(n.id);
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, []);

  const scheduleAutoDismiss = (notifId) => {
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    autoDismissTimer.current = setTimeout(() => {
      dismiss(notifId);
    }, 12000); // auto-dismiss after 12s — subtle, not intrusive
  };

  const dismiss = (notifId) => {
    setDismissedIds((prev) => new Set(prev).add(notifId));
    setActiveNudge((prev) => (prev?.id === notifId ? null : prev));
  };

  const handleTap = () => {
    if (!activeNudge) return;
    const id = activeNudge.id;
    dismiss(id);
    // Mark as read
    base44.entities.Notification.update(id, { is_read: true }).catch(() => {});
    navigate("/map");
  };

  return (
    <AnimatePresence>
      {activeNudge && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md px-2"
        >
          <motion.button
            onClick={handleTap}
            className="w-full glass-strong rounded-2xl p-3 flex items-center gap-3 text-left relative overflow-hidden ai-glow"
            whileTap={{ scale: 0.98 }}
          >
            {/* Subtle animated gradient sweep */}
            <motion.div
              className="absolute inset-0 opacity-[0.07]"
              style={{ background: "linear-gradient(135deg, #60A5FA, #A78BFA, #22D3EE)" }}
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Radar pulse */}
            <motion.div
              className="absolute -left-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%)" }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #60A5FA, #A78BFA)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <div className="relative flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {activeNudge.title}
              </p>
              {activeNudge.body && (
                <p className="text-white/50 text-xs truncate">
                  {activeNudge.body}
                </p>
              )}
            </div>

            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                dismiss(activeNudge.id);
              }}
              className="relative text-white/30 hover:text-white/60 transition-colors flex-shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}