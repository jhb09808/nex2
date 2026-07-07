import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, MessageCircle, Sliders } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";

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
      setUsers(allUsers.filter((u) => u.created_by_id !== me.id && !u.is_banned && !u.is_suspended));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Deterministic lat/lng offset from user's location
  const getUserLatLng = (userId) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    const latOffset = (Math.abs(hash % 1000) / 1000 - 0.5) * 0.04;
    const lngOffset = (Math.abs((hash * 31) % 1000) / 1000 - 0.5) * 0.04;
    return [userLocation.lat + latOffset, userLocation.lng + lngOffset];
  };

  const createUserIcon = (user) => {
    const isOnline = user.is_online;
    const photoHtml = user.profile_photo
      ? `<img src="${user.profile_photo}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;background:${isOnline ? "linear-gradient(135deg,#3B82F6,#60A5FA)" : "rgba(255,255,255,0.1)"};"></div>`;
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:36px;height:36px;">
        ${isOnline ? '<div style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(59,130,246,0.3);animation:nex-marker-pulse 2s ease-in-out infinite;"></div>' : ""}
        <div style="position:relative;width:36px;height:36px;border-radius:9999px;border:2px solid ${isOnline ? "#60A5FA" : "rgba(255,255,255,0.2)"};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
          ${photoHtml}
        </div>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
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

  const filteredUsers = users.filter((u) => !filters.onlineOnly || u.is_online);

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
              position={getUserLatLng(user.id)}
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