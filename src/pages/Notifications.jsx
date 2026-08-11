import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, MessageCircle, MapPin, Calendar, Zap, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import moment from "moment";

const iconMap = {
  message: MessageCircle,
  nearby: MapPin,
  event: Calendar,
  system: Zap,
  match: Zap,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const me = await base44.auth.me();
      const notifs = await base44.entities.Notification.filter({ user_id: me.id }, "-created_date", 30);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    window.dispatchEvent(new CustomEvent("nex-notifications-read"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 safe-top h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pr-12 flex-none">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={() => notifications.forEach((n) => !n.is_read && markAsRead(n.id))}
            className="text-blue-400 text-sm font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pb-24">
          {notifications.map((notif, i) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  className={`flex items-start gap-3 !p-3 ${!notif.is_read ? "ring-1 ring-blue-500/20" : ""}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.is_read ? "gradient-blue" : "bg-white/5"}`}>
                    <Icon className={`w-5 h-5 ${!notif.is_read ? "text-white" : "text-white/40"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notif.is_read ? "text-white" : "text-white/60"}`}>{notif.title}</p>
                    {notif.body && <p className="text-white/30 text-xs mt-0.5">{notif.body}</p>}
                    <p className="text-white/20 text-[10px] mt-1">{moment(notif.created_date).fromNow()}</p>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 rounded-full gradient-blue mt-2 flex-shrink-0" />}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">No notifications yet</p>
          <p className="text-white/20 text-xs">You'll see activity here</p>
        </div>
      )}
    </div>
  );
}