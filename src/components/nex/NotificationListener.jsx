import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function NotificationListener() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [unread, setUnread] = useState(0);
  const meIdRef = useRef(null);
  const knownIdsRef = useRef(new Set());

  useEffect(() => {
    let unsub = null;

    const init = async () => {
      try {
        const me = await base44.auth.me();
        meIdRef.current = me.id;

        // Load existing unread count and mark known notifications
        const existing = await base44.entities.Notification.filter({ user_id: me.id }, "-created_date", 50);
        const unreadCount = existing.filter((n) => !n.is_read).length;
        setUnread(unreadCount);
        existing.forEach((n) => knownIdsRef.current.add(n.id));

        // Dispatch initial badge count
        window.dispatchEvent(new CustomEvent("nex-unread-count", { detail: unreadCount }));

        // Subscribe to real-time notification changes
        unsub = base44.entities.Notification.subscribe((event) => {
          const notif = event.data;
          if (!notif || notif.user_id !== meIdRef.current) return;

          if (event.type === "create") {
            // Skip if we already know about it (prevents toast on initial load)
            if (knownIdsRef.current.has(notif.id)) return;
            knownIdsRef.current.add(notif.id);

            setUnread((prev) => {
              const next = prev + 1;
              window.dispatchEvent(new CustomEvent("nex-unread-count", { detail: next }));
              return next;
            });

            // Show in-app toast
            setToast(notif);
            setTimeout(() => setToast(null), 5000);

            // Show system push notification if tab is hidden or permission granted
            if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
              new Notification(notif.title || "New notification", {
                body: notif.body || "",
                icon: "/favicon.ico",
              });
            }
          }

          if (event.type === "update" && notif.is_read) {
            knownIdsRef.current.add(notif.id);
            setUnread((prev) => {
              const next = Math.max(0, prev - 1);
              window.dispatchEvent(new CustomEvent("nex-unread-count", { detail: next }));
              return next;
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
    };

    init();

    // Request browser notification permission
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Listen for "mark all read" from the Notifications page
    const handleReset = () => {
      setUnread(0);
      window.dispatchEvent(new CustomEvent("nex-unread-count", { detail: 0 }));
    };
    window.addEventListener("nex-notifications-read", handleReset);

    return () => {
      if (unsub) unsub();
      window.removeEventListener("nex-notifications-read", handleReset);
    };
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm"
          onClick={() => {
            setToast(null);
            navigate("/notifications");
          }}
        >
          <div className="glass-strong rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center flex-shrink-0 glow-blue-sm">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{toast.title}</p>
              {toast.body && <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{toast.body}</p>}
              <p className="text-blue-400 text-[10px] mt-1 font-medium">Tap to view</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}