import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, MessageCircle, Bell, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/map", icon: Map, label: "Map" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong safe-bottom">
        <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -inset-2 rounded-xl gradient-blue opacity-15"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 relative z-10 transition-colors ${
                      isActive ? "text-blue-400" : "text-white/40"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-blue-400" : "text-white/30"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}