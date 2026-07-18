import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, MessageCircle } from "lucide-react";
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

  const isChat = toast?.type === "message" || toast?.type === "match";
  const Icon = isChat ? MessageCircle : Bell;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-6"
          onClick={() => {
            setToast(null);
            navigate("/notifications");
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-sm glass-strong rounded-3xl p-6 ai-glow"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mb-4 glow-blue">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">
                {isChat ? "New Chat" : "Notification"}
              </p>
              <p className="text-white font-bold text-lg mb-1">{toast.title}</p>
              {toast.body && (
                <p className="text-white/50 text-sm leading-relaxed">{toast.body}</p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToast(null);
                  navigate("/notifications");
                }}
                className="mt-5 w-full py-3.5 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                View <Icon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}