import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Sliders, EyeOff, Shield, Crown, BadgeCheck, Radar, MapPin, Lock, MessageCircle, Sparkles, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import LiveRadar from "@/components/nex/home/LiveRadar";
import { generateMockProfiles } from "@/components/nex/mapMockProfiles";
import BlockReportSheet from "@/components/nex/safety/BlockReportSheet";
import PaywallPrompt from "@/components/nex/PaywallPrompt";
import ChatApprovalModal from "@/components/nex/ChatApprovalModal";
import ProximityTier, { calculateProximityTier } from "@/components/nex/safety/ProximityTier";
import RadarOnboardingOverlay from "@/components/nex/radar/RadarOnboardingOverlay";
import RadarFilterChips from "@/components/nex/radar/RadarFilterChips";

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
  const [filters, setFilters] = useState({ distance: 0.5, onlineOnly: false });
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [showRadar, setShowRadar] = useState(false);
  const [areaRestricted, setAreaRestricted] = useState(null);
  const [safetyUser, setSafetyUser] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [paywallVariant, setPaywallVariant] = useState(null);
  const [chatApprovalUser, setChatApprovalUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [showRadarOnboarding, setShowRadarOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState("best");
  const [activeFilters, setActiveFilters] = useState([]);
  const [expandedClusters, setExpandedClusters] = useState({});

  useEffect(() => {
    loadUsers();
    checkLocation();
    loadCapabilities();
  }, []);

  // Location refreshes only on app open — no continuous streaming
  const checkLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        try {
          const res = await base44.functions.invoke("checkAreaRestriction", loc);
          setAreaRestricted(res.data);
        } catch (e) {
          console.error(e);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const distanceMiles = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const loadCapabilities = async () => {
    try {
      const res = await base44.functions.invoke("getSubscriptionCapabilities", {});
      setCapabilities(res.data);
      const userRadius = res.data?.radius_miles ?? 0.5;
      setFilters((prev) => ({ ...prev, distance: userRadius }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await base44.entities.UserProfile.list("-created_date", 50);
      const me = await base44.auth.me();
      const myProfiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      const myP = myProfiles[0];
      setMyProfile(myP);
      const myPlan = myP?.plan || "free";

      if (!myP?.radar_onboarding_complete) {
        setShowRadarOnboarding(true);
      }

      const defaultFilters = myP?.radar_filter_interests?.length > 0
        ? myP.radar_filter_interests
        : myP?.interests || [];
      setActiveFilters(defaultFilters);

      let realUsers = allUsers.filter(
        (u) => u.created_by_id !== me.id && !u.is_banned && !u.is_suspended && !u.invisible_mode
      );

      // Platinum exclusivity: platinum users only see other platinum users
      if (myPlan === "platinum") {
        realUsers = realUsers.filter((u) => u.plan === "platinum");
      }

      // Non-platinum users cannot see platinum users (keeps platinum exclusive)
      if (myPlan !== "platinum") {
        realUsers = realUsers.filter((u) => u.plan !== "platinum");
      }

      realUsers = realUsers.map((u) => ({ ...u, isMock: false }));
      setUsers(realUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRadarOnboardingComplete = async (selectedInterests) => {
    setShowRadarOnboarding(false);
    setActiveFilters(selectedInterests);
    setExpandedClusters({});
    if (myProfile) {
      try {
        await base44.entities.UserProfile.update(myProfile.id, {
          radar_onboarding_complete: true,
          radar_filter_interests: selectedInterests,
        });
        setMyProfile({ ...myProfile, radar_onboarding_complete: true, radar_filter_interests: selectedInterests });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleFilter = (interest) => {
    setActiveFilters((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
    setExpandedClusters({});
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setExpandedClusters({});
  };

  const handleExpandCluster = (key) => {
    setExpandedClusters((prev) => ({ ...prev, [key]: true }));
  };

  const saveRadius = async () => {
    if (myProfile && filters.distance !== (myProfile.radius_miles ?? 0.5)) {
      try {
        await base44.entities.UserProfile.update(myProfile.id, { radius_miles: filters.distance });
        setMyProfile({ ...myProfile, radius_miles: filters.distance });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
    saveRadius();
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
    const isVerified = user.is_verified;
    const isPremium = user.is_premium;
    const plan = user.plan || "free";
    const isPlatinum = plan === "platinum";

    // Tier-based gradient colors (non-platinum users get colored icons, no photos)
    const tierGradients = {
      free: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))",
      plus: "linear-gradient(135deg,#3B82F6,#60A5FA)",
      pro: "linear-gradient(135deg,#F59E0B,#FBBF24)",
      platinum: "linear-gradient(135deg,#22D3EE,#60A5FA)",
    };
    const tierBorderColors = {
      free: "rgba(255,255,255,0.2)",
      plus: "rgba(96,165,250,0.5)",
      pro: "rgba(251,191,36,0.5)",
      platinum: "rgba(34,211,238,0.6)",
    };

    // ---- ANONYMOUS: subtle expanding pulse rings, no solid avatar ----
    if (visibility === "anonymous") {
      const ringColor = isOnline ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.25)";
      return L.divIcon({
        className: "",
        html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;border-radius:9999px;border:1.5px solid ${ringColor};animation:nex-marker-ping 3s ease-out infinite;"></div>
          <div style="position:absolute;inset:4px;border-radius:9999px;border:1px solid ${ringColor};animation:nex-marker-ping 3s ease-out 1s infinite;"></div>
          <div style="position:absolute;inset:8px;border-radius:9999px;border:1px solid ${ringColor};opacity:0.4;"></div>
          <div style="position:relative;width:8px;height:8px;border-radius:9999px;background:${ringColor};opacity:0.6;"></div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    }

    // ---- Named profiles: avatar with status-based glow ----
    const size = 36;
    let innerHtml;
    if (visibility === "first_name") {
      // First-name-only: tier-colored glass with initial
      const initial = (user.username || "?").charAt(0).toUpperCase();
      innerHtml = `<div style="width:100%;height:100%;background:${tierGradients[plan]};backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-weight:600;font-size:16px;color:rgba(255,255,255,0.9);">${escapeHtml(initial)}</div>`;
    } else {
      // Only platinum users with show_profile_photo enabled can display a photo
      const showPhoto = isPlatinum && user.show_profile_photo && user.profile_photo;
      innerHtml = showPhoto
        ? `<img src="${user.profile_photo}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<div style="width:100%;height:100%;background:${tierGradients[plan]};"></div>`;
    }

    // Outer glow layers — stacked for richer effect
    let glowLayers = "";
    if (isVerified) {
      // Gold glow for verified users
      const goldGlow = isPremium
        ? "rgba(245,158,11,0.35)"
        : "rgba(250,204,21,0.3)";
      glowLayers = `<div style="position:absolute;inset:-8px;border-radius:9999px;background:radial-gradient(circle, ${goldGlow} 30%, transparent 70%);animation:nex-marker-pulse 2.5s ease-in-out infinite;"></div>
        <div style="position:absolute;inset:-3px;border-radius:9999px;background:${goldGlow};opacity:0.4;filter:blur(6px);"></div>`;
    } else if (visibility === "first_name") {
      // Indigo glow for first-name-only users
      glowLayers = `<div style="position:absolute;inset:-6px;border-radius:9999px;background:radial-gradient(circle, rgba(139,92,246,${isOnline ? 0.3 : 0.15}) 30%, transparent 70%);${isOnline ? "animation:nex-marker-pulse 2.5s ease-in-out infinite;" : ""}"></div>`;
    } else if (isOnline) {
      // Blue glow for online full-profile users
      glowLayers = `<div style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(59,130,246,0.25);animation:nex-marker-pulse 2s ease-in-out infinite;"></div>`;
    }

    // Border color by status
    const borderColor = isVerified
      ? "rgba(250,204,21,0.7)"
      : isPlatinum
        ? tierBorderColors.platinum
        : tierBorderColors[plan];

    // Badge stack (verified checkmark + premium crown)
    const badges = [];
    if (isVerified) badges.push(`<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:9999px;background:linear-gradient(135deg,#F59E0B,#FBBF24);border:2px solid hsl(0,0%,8%);display:flex;align-items:center;justify-content:center;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`);
    if (isPremium) badges.push(`<div style="position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:9999px;background:linear-gradient(135deg,#F59E0B,#FBBF24);border:2px solid hsl(0,0%,8%);display:flex;align-items:center;justify-content:center;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V8l5 4 3-6 3 6 5-4v12"/></svg></div>`);
    const badgesHtml = badges.join("");

    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:${size}px;height:${size}px;">
        ${glowLayers}
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;border:2px solid ${borderColor};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
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

  const createClusterIcon = (count) => {
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:-4px;border-radius:9999px;background:radial-gradient(circle,rgba(59,130,246,0.2) 30%,transparent 70%);animation:nex-marker-pulse 2s ease-in-out infinite;"></div>
        <div style="position:relative;width:40px;height:40px;border-radius:9999px;background:linear-gradient(135deg,#3B82F6,#60A5FA);border:2px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-weight:700;font-size:14px;color:white;box-shadow:0 0 16px rgba(59,130,246,0.35);">${count}</div>
      </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  const tierCeiling = capabilities?.radius_miles_max;
  const effectiveRadius = capabilities?.radius_miles ?? filters.distance ?? 0.5;

  // Filter by interest chips
  const interestFiltered = activeFilters.length > 0
    ? allProfiles.filter((u) => (u.interests || []).some((i) => activeFilters.includes(i)))
    : allProfiles;

  // Filter by radius and online status
  const radiusFiltered = interestFiltered.filter((u) => {
    if (filters.onlineOnly && !u.is_online) return false;
    const [uLat, uLng] = getUserLatLng(u);
    const dist = distanceMiles(userLocation.lat, userLocation.lng, uLat, uLng);
    if (effectiveRadius != null && dist > effectiveRadius) return false;
    return true;
  });

  // Rank by shared interests + proximity (Best Matches)
  const ranked = radiusFiltered
    .map((u) => {
      const shared = (u.interests || []).filter((i) => activeFilters.includes(i)).length;
      const [uLat, uLng] = getUserLatLng(u);
      const dist = distanceMiles(userLocation.lat, userLocation.lng, uLat, uLng);
      return { ...u, _shared: shared, _dist: dist, _score: shared * 10 - dist };
    })
    .sort((a, b) => b._score - a._score);

  const displayUsers = viewMode === "best" ? ranked.slice(0, 18) : ranked;

  // Clustering: collapse 4+ users within a small area into a single marker
  const CLUSTER_THRESHOLD = 0.02;
  const CLUSTER_MIN = 4;

  const computeClusters = (userList) => {
    const result = [];
    const assigned = new Set();
    userList.forEach((user, i) => {
      if (assigned.has(i)) return;
      const [uLat, uLng] = getUserLatLng(user);
      const group = [{ user, i }];
      assigned.add(i);
      userList.forEach((other, j) => {
        if (assigned.has(j)) return;
        const [oLat, oLng] = getUserLatLng(other);
        if (distanceMiles(uLat, uLng, oLat, oLng) < CLUSTER_THRESHOLD) {
          group.push({ user: other, j });
          assigned.add(j);
        }
      });
      if (group.length >= CLUSTER_MIN) {
        const avgLat = group.reduce((s, g) => s + getUserLatLng(g.user)[0], 0) / group.length;
        const avgLng = group.reduce((s, g) => s + getUserLatLng(g.user)[1], 0) / group.length;
        const key = `${avgLat.toFixed(4)},${avgLng.toFixed(4)}`;
        if (expandedClusters[key]) {
          group.forEach((g) => result.push({ type: "single", user: g.user }));
        } else {
          result.push({ type: "cluster", count: group.length, lat: avgLat, lng: avgLng, key, users: group.map((g) => g.user) });
        }
      } else {
        group.forEach((g) => result.push({ type: "single", user: g.user }));
      }
    });
    return result;
  };

  const markers = computeClusters(displayUsers);

  if (areaRestricted?.restricted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8 text-center">
        <div>
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Area Restricted</h1>
          <p className="text-white/40 text-sm max-w-xs mx-auto">{areaRestricted.reason}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ height: "100vh" }}>
      {/* Header + controls — hidden during radar onboarding */}
      {!showRadarOnboarding && (
        <>
          <div className="absolute top-4 left-4 right-16 z-20 flex items-center justify-between safe-top">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRadar(!showRadar)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showRadar ? "gradient-blue" : "glass-strong"}`}
              >
                <Radar className="w-5 h-5 text-white/60" />
              </button>
              <h1 className="text-xl font-bold text-white">Nearby</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showFilters ? "gradient-blue" : "glass-strong"}`}
            >
              <Sliders className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
            <div className="glass-strong rounded-full p-1 flex gap-1">
              <button
                onClick={() => { setViewMode("best"); setExpandedClusters({}); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "best" ? "gradient-blue text-white" : "text-white/40"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Best Matches
              </button>
              <button
                onClick={() => { setViewMode("all"); setExpandedClusters({}); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "all" ? "gradient-blue text-white" : "text-white/40"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> All Nearby
              </button>
            </div>
          </div>

          {/* Filter Chips Dock */}
          <div className="absolute top-[92px] left-0 right-0 z-20 px-4">
            <RadarFilterChips
              activeFilters={activeFilters}
              onToggle={toggleFilter}
              onClear={clearFilters}
            />
          </div>
        </>
      )}

      {/* Map — blurred and dimmed behind the onboarding overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          filter: showRadarOnboarding ? "blur(16px) brightness(0.35)" : "none",
          transition: "filter 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
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

          {/* Cluster + user markers */}
          {markers.map((m, idx) =>
            m.type === "cluster" ? (
              <Marker
                key={`cluster-${m.key}-${idx}`}
                position={[m.lat, m.lng]}
                icon={createClusterIcon(m.count)}
                eventHandlers={{ click: () => handleExpandCluster(m.key) }}
              />
            ) : (
              <Marker
                key={m.user.id}
                position={getUserLatLng(m.user)}
                icon={createUserIcon(m.user)}
                eventHandlers={{ click: () => setSelectedUser(m.user) }}
              />
            )
          )}
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
                <button onClick={handleCloseFilters}>
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/40 uppercase tracking-wider">
                    Radius: {tierCeiling == null ? "Global" : `${filters.distance} mi`}
                  </label>
                  {tierCeiling != null && (
                    <button
                      onClick={() => setPaywallVariant("radius")}
                      className="text-[10px] text-blue-400 font-medium flex items-center gap-1"
                    >
                      Expand →
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min="0.5"
                  step="0.5"
                  max={tierCeiling == null ? 100 : tierCeiling}
                  value={filters.distance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (tierCeiling != null && val > tierCeiling) {
                      setPaywallVariant("radius");
                      return;
                    }
                    setFilters({ ...filters, distance: val });
                  }}
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

      {/* Live Radar Panel */}
      <AnimatePresence>
        {showRadar && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-24 left-0 right-0 z-30 px-4"
          >
            <LiveRadar nearbyUsers={allProfiles} />
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
                  <UserAvatar src={selectedUser.profile_photo} size="lg" isOnline={selectedUser.is_online} plan={selectedUser.plan} showProfilePhoto={selectedUser.show_profile_photo} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-semibold text-lg truncate">{getDisplayName(selectedUser)}</p>
                    {selectedUser.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    {selectedUser.is_premium && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </div>
                  <ProximityTier tier={selectedUser.proximity_tier || calculateProximityTier(Math.random() * 3)} />
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

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/user/${selectedUser.id}`)}
                  className="flex-1 py-3 rounded-xl glass text-white/70 font-medium text-sm active:scale-[0.98] transition-transform"
                >
                  View Profile
                </button>
                {capabilities && !capabilities.can_start_chat ? (
                  <button
                    onClick={() => setPaywallVariant("chat_limit")}
                    className="flex-1 py-3 rounded-xl glass flex items-center justify-center gap-1.5 text-white/40 font-medium text-sm"
                  >
                    <Lock className="w-4 h-4" /> Chat limit reached
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const enforceRes = await base44.functions.invoke("enforceChatLimit", {});
                        if (!enforceRes.data?.allowed) {
                          setPaywallVariant("chat_limit");
                          return;
                        }
                        setChatApprovalUser(selectedUser);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl gradient-blue text-white font-medium text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                )}
                <button
                  onClick={() => setSafetyUser(selectedUser)}
                  className="w-12 py-3 rounded-xl glass flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  <Shield className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block / Report Sheet */}
      <BlockReportSheet
        user={safetyUser}
        open={!!safetyUser}
        onClose={() => setSafetyUser(null)}
        onBlocked={() => {
          setSelectedUser(null);
          loadUsers();
        }}
      />

      {/* Paywall Prompts */}
      <PaywallPrompt
        variant={paywallVariant}
        open={!!paywallVariant}
        onClose={() => setPaywallVariant(null)}
      />

      {/* Chat Approval Modal */}
      <ChatApprovalModal
        user={chatApprovalUser}
        onAccept={async () => {
          if (!chatApprovalUser) return;
          try {
            const existing = await base44.entities.Conversation.filter({});
            const convo = existing.find(
              (c) =>
                c.participants?.includes(chatApprovalUser.created_by_id) ||
                c.participants?.includes(chatApprovalUser.id)
            );
            let conversationId;
            if (convo) {
              conversationId = convo.id;
            } else {
              const me = await base44.auth.me();
              const newConvo = await base44.entities.Conversation.create({
                participants: [me.id, chatApprovalUser.created_by_id || chatApprovalUser.id],
                last_message: "",
                is_active: true,
              });
              conversationId = newConvo.id;
            }
            setChatApprovalUser(null);
            setSelectedUser(null);
            navigate(`/chat/${conversationId}`);
          } catch (err) {
            console.error(err);
            setChatApprovalUser(null);
          }
        }}
        onReject={() => setChatApprovalUser(null)}
        onClose={() => setChatApprovalUser(null)}
      />

      {/* Radar Onboarding Overlay */}
      <AnimatePresence>
        {showRadarOnboarding && (
          <RadarOnboardingOverlay key="radar-onboarding" onComplete={handleRadarOnboardingComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}