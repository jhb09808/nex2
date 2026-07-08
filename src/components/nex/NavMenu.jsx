import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Radar, Compass, MessageCircle, Bell, User, Settings, X } from "lucide-react";

const navItems = [
  { path: "/", icon: Radar, label: "Radar" },
  { path: "/discover", icon: Compass, label: "Discover" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Floating menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-xl glass-strong flex items-center justify-center active:scale-95 transition-transform safe-top"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white/80" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="w-5 h-5 text-white/80" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 z-[55] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-16 right-4 z-[60] w-56 ai-card rounded-2xl p-2 overflow-hidden"
            >
              {navItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.03 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive ? "bg-blue-500/10 text-blue-400" : "text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}