import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, MessageCircle, Sliders, EyeOff, Shield, Crown, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import ChatApprovalModal from "@/components/nex/ChatApprovalModal";
import { generateMockProfiles } from "@/components/nex/mapMockProfiles";

const DEFAULT_LOCATION = { lat: 40.7589, lng: -73.9851 };

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 14, { duration: 1.2 });
  }, [center.lat, center.lng, map]);
  return null;
}

export default function NearbyMap() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ distance: 5, onlineOnly: false });
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [approvalUser, setApprovalUser] = useState(null);

  useEffect(() => {
    loadUsers();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await base44.entities.UserProfile.list("-created_date", 50);
      const me = await base44.auth.me();
      const realUsers = allUsers
        .filter((u) => u.created_by_id !== me.id && !u.is_banned && !u.is_suspended)
        .map((u) => ({ ...u, isMock: false }));
      setUsers(realUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Combine real users with mock profiles centered on user's location
  const allProfiles = [...users, ...generateMockProfiles(userLocation).map((u) => ({ ...u, isMock: true }))];

  const getDisplayName = (user) => {
    if (user.visibility === "anonymous") return "Anonymous";
    if (user.visibility === "first_name") return user.username;
    return user.username;
  };

  // Use explicit lat/lng for mock profiles, deterministic offset for real users
  const getUserLatLng = (user) => {
    if (user.lat != null && user.lng != null) return [user.lat, user.lng];
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = ((hash << 5) - hash) + user.id.charCodeAt(i);
      hash = hash & hash;
    }
    const latOffset = (Math.abs(hash % 1000) / 1000 - 0.5) * 0.04;
    const lngOffset = (Math.abs((hash * 31) % 1000) / 1000 - 0.5) * 0.04;
    return [userLocation.lat + latOffset, userLocation.lng + lngOffset];
  };

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const createUserIcon = (user) => {
    const isOnline = user.is_online;
    const visibility = user.visibility || "full_profile";
    const size = visibility === "anonymous" ? 32 : 36;

    let innerHtml;
    if (visibility === "anonymous") {
      // Mystery avatar — blurred gradient with eye-off icon
      innerHtml = `<div style="width:100%;height:100%;background:linear-gradient(135deg,rgba(59,130,246,0.15),rgba(255,255,255,0.05));display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
      </div>`;
    } else if (visibility === "first_name") {
      // Initial letter avatar
      const initial = (user.username || "?").charAt(0).toUpperCase();
      innerHtml = `<div style="width:100%;height:100%;background:linear-gradient(135deg,rgba(59,130,246,0.3),rgba(96,165,250,0.15));display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-weight:600;font-size:16px;color:rgba(255,255,255,0.85);">${escapeHtml(initial)}</div>`;
    } else {
      // Full profile photo
      innerHtml = user.profile_photo
        ? `<img src="${user.profile_photo}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<div style="width:100%;height:100%;background:${isOnline ? "linear-gradient(135deg,#3B82F6,#60A5FA)" : "rgba(255,255,255,0.1)"};"></div>`;
    }

    // Badge stack (verified + premium)
    const badges = [];
    if (user.is_verified) badges.push(`<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:9999px;background:#3B82F6;border:2px solid hsl(0,0%,8%);display:flex;align-items:center;justify-content:center;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`);
    if (user.is_premium) badges.push(`<div style="position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:9999px;background:linear-gradient(135deg,#F59E0B,#FBBF24);border:2px solid hsl(0,0%,8%);display:flex;align-items:center;justify-content:center;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V8l5 4 3-6 3 6 5-4v12"/></svg></div>`);
    const badgesHtml = badges.join("");

    const borderColor = isOnline
      ? (visibility === "anonymous" ? "rgba(59,130,246,0.4)" : "#60A5FA")
      : "rgba(255,255,255,0.2)";

    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:${size}px;height:${size}px;">
        ${isOnline ? `<div style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(59,130,246,${visibility === "anonymous" ? 0.15 : 0.3});animation:nex-marker-pulse 2s ease-in-out infinite;"></div>` : ""}
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;border:2px solid ${borderColor};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.4);${visibility === "anonymous" ? "filter:blur(0.5px);" : ""}">
          ${innerHtml}
        </div>
        ${badgesHtml}
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const userLocationIcon = L.divIcon({
    className: "",
    html: `<div style="position:relative;width:16px;height:16px;">
      <div style="position:absolute;inset:-14px;border-radius:9999px;background:rgba(59,130,246,0.15);animation:nex-marker-ping 3s ease-out infinite;"></div>
      <div style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(59,130,246,0.25);"></div>
      <div style="position:relative;width:16px;height:16px;border-radius:9999px;background:linear-gradient(135deg,#3B82F6,#60A5FA);box-shadow:0 0 20px rgba(59,130,246,0.6);"></div>
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const filteredUsers = allProfiles.filter((u) => !filters.onlineOnly || u.is_online);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ height: "100vh" }}>
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

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={14}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <MapController center={userLocation} />

          {/* Your location */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />

          {/* User markers */}
          {filteredUsers.map((user) => (
            <Marker
              key={user.id}
              position={getUserLatLng(user)}
              icon={createUserIcon(user)}
              eventHandlers={{ click: () => setSelectedUser(user) }}
            />
          ))}
        </MapContainer>
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
                {selectedUser.visibility === "anonymous" ? (
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-white/40" />
                  </div>
                ) : selectedUser.visibility === "first_name" ? (
                  <div className="w-14 h-14 rounded-full gradient-blue flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{getDisplayName(selectedUser).charAt(0)}</span>
                  </div>
                ) : (
                  <UserAvatar src={selectedUser.profile_photo} size="lg" isOnline={selectedUser.is_online} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-semibold text-lg truncate">{getDisplayName(selectedUser)}</p>
                    {selectedUser.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    {selectedUser.is_premium && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-white/40 text-sm">{(Math.random() * 5).toFixed(1)} miles away</p>
                  {selectedUser.visibility === "anonymous" && (
                    <p className="text-blue-400/60 text-xs flex items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3" /> Anonymous mode
                    </p>
                  )}
                  {selectedUser.visibility === "first_name" && (
                    <p className="text-white/30 text-xs mt-0.5">First name only</p>
                  )}
                </div>
              </div>

              {selectedUser.visibility !== "anonymous" && selectedUser.bio && (
                <p className="text-white/50 text-sm mb-4">{selectedUser.bio}</p>
              )}

              {selectedUser.visibility !== "anonymous" && selectedUser.interests?.length > 0 && (
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
                  onClick={() => {
                    setSelectedUser(null);
                    setApprovalUser(selectedUser);
                  }}
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

      {/* Chat Approval Modal */}
      {approvalUser && (
        <ChatApprovalModal
          user={approvalUser}
          onAccept={() => {
            setApprovalUser(null);
            navigate("/messages");
          }}
          onReject={() => setApprovalUser(null)}
          onClose={() => setApprovalUser(null)}
        />
      )}
    </div>
  );
}