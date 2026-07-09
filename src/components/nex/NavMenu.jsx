import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Radar, Compass, MessageCircle, Bell, User, Settings, X, Diamond, Sliders } from "lucide-react";
import { base44 } from "@/api/base44Client";

const baseNavItems = [
  { path: "/", icon: Radar, label: "Radar" },
  { path: "/discover", icon: Compass, label: "Discover" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [isPlatinum, setIsPlatinum] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkPlan();
  }, []);

  const checkPlan = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0 && profiles[0].plan === "platinum") {
        setIsPlatinum(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isMapRoute = location.pathname === "/" || location.pathname === "/map";
  const navItems = isPlatinum
    ? [
        ...baseNavItems.slice(0, 2),
        { path: "/platinum-lounge", icon: Diamond, label: "Platinum Lounge" },
        ...baseNavItems.slice(2),
      ]
    : baseNavItems;

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-[60] pointer-events-none">
      {/* Floating menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 right-4 pointer-events-auto w-10 h-10 rounded-xl glass-strong flex items-center justify-center active:scale-95 transition-transform safe-top"
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
              className="absolute inset-0 h-screen pointer-events-auto bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-16 right-4 pointer-events-auto w-56 ai-card rounded-2xl p-2 overflow-hidden"
            >
              {isMapRoute && (
                <>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("nex-open-filters"));
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 w-full transition-colors"
                  >
                    <Sliders className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Filters</span>
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                </>
              )}
              {navItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                const isPlatinumItem = item.path === "/platinum-lounge";
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
                        isActive
                          ? isPlatinumItem
                            ? "bg-cyan-500/10 text-cyan-300"
                            : "bg-blue-500/10 text-blue-400"
                          : isPlatinumItem
                          ? "text-cyan-300/70 hover:bg-cyan-500/5"
                          : "text-white/70 hover:bg-white/5"
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
    </div>
  );
}