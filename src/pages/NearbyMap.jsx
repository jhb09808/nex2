import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, MessageCircle, ChevronDown, Sliders } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";

export default function NearbyMap() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ distance: 5, onlineOnly: false, interests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await base44.entities.UserProfile.list("-created_date", 50);
      const me = await base44.auth.me();
      setUsers(allUsers.filter((u) => u.created_by_id !== me.id && !u.is_banned && !u.is_suspended));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate consistent random positions for the map visualization
  const getUserPosition = (userId) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return {
      x: 10 + Math.abs(hash % 80),
      y: 10 + Math.abs((hash * 31) % 80),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen safe-top relative">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between safe-top">
        <h1 className="text-xl font-bold text-white">Nearby</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center"
        >
          <Sliders className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Map Area */}
      <div className="relative w-full h-screen bg-[hsl(0,0%,4%)] overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-blue-500/10 blur-[60px]" />

        {/* User dots */}
        {users.map((user) => {
          const pos = getUserPosition(user.id);
          const isOnline = user.is_online;
          return (
            <motion.button
              key={user.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.random() * 0.3 }}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => setSelectedUser(user)}
            >
              <div className="relative">
                {isOnline && (
                  <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-pulse" />
                )}
                <div
                  className={`w-8 h-8 rounded-full border-2 overflow-hidden ${
                    isOnline ? "border-blue-400 glow-blue-sm" : "border-white/20"
                  }`}
                >
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${isOnline ? "gradient-blue" : "bg-white/10"}`} />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Your location */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute -inset-3 rounded-full bg-blue-500/20" />
            <div className="w-4 h-4 rounded-full gradient-blue glow-blue" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-24 left-0 right-0 z-30 px-4"
          >
            <GlassCard strong className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Distance: {filters.distance} mi</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <label className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Online only</span>
                <button
                  onClick={() => setFilters({ ...filters, onlineOnly: !filters.onlineOnly })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${filters.onlineOnly ? "gradient-blue" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${filters.onlineOnly ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </label>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected User Panel */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-24 left-0 right-0 z-30 px-4"
          >
            <GlassCard strong>
              <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3">
                <X className="w-5 h-5 text-white/40" />
              </button>
              <div className="flex items-center gap-4 mb-4">
                <UserAvatar src={selectedUser.profile_photo} size="lg" isOnline={selectedUser.is_online} />
                <div>
                  <p className="text-white font-semibold text-lg">{selectedUser.username}</p>
                  <p className="text-white/40 text-sm">{(Math.random() * 5).toFixed(1)} miles away</p>
                </div>
              </div>

              {selectedUser.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedUser.interests.slice(0, 5).map((interest) => (
                    <InterestTag key={interest} label={interest} size="sm" />
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/user/${selectedUser.id}`)}
                  className="flex-1 py-3 rounded-xl glass text-white/70 font-medium text-sm active:scale-[0.98] transition-transform"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate("/messages")}
                  className="flex-1 py-3 rounded-xl gradient-blue text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}