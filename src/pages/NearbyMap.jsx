import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, EyeOff, Shield, Crown, BadgeCheck, MapPin, Lock, MessageCircle, Sparkles, Users, Check, Radar, List, Handshake, Plus, Minus, SlidersHorizontal } from "lucide-react";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import PaywallPrompt from "@/components/nex/PaywallPrompt";

import { getUserDisplayName, getUserNumberLabel } from "@/components/nex/userDisplay";
import RadarOnboardingOverlay from "@/components/nex/radar/RadarOnboardingOverlay";
import RadarScope from "@/components/nex/radar/RadarScope";
import RadarList from "@/components/nex/radar/RadarList";
import ChatRequestOverlay from "@/components/nex/radar/ChatRequestOverlay";

import { RADAR_INTERESTS } from "@/components/nex/radar/constants";

const DEFAULT_LOCATION = { lat: 40.7589, lng: -73.9851 };

export default function NearbyMap() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ distance: 5, onlineOnly: false });
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [areaRestricted, setAreaRestricted] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [paywallVariant, setPaywallVariant] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [showRadarOnboarding, setShowRadarOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState("best");
  const [layoutMode, setLayoutMode] = useState("sonar");
  const [activeFilters, setActiveFilters] = useState([]);
  const [expandedClusters, setExpandedClusters] = useState({});
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadUsers();
    checkLocation();
    loadCapabilities();
  }, []);

  useEffect(() => {
    const openFilters = () => setShowFilters(true);
    window.addEventListener("nex-open-filters", openFilters);
    return () => window.removeEventListener("nex-open-filters", openFilters);
  }, []);

  // Save real GPS to profile on app open so nearby users can see each other
  const checkLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        try {
          const me = await base44.auth.me();
          const myProfiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
          if (myProfiles[0]) {
            await base44.entities.UserProfile.update(myProfiles[0].id, {
              latitude: loc.lat,
              longitude: loc.lng,
              is_online: true,
              last_seen: new Date().toISOString(),
              location_refreshed_at: new Date().toISOString(),
            });
          }
          const res = await base44.functions.invoke("checkAreaRestriction", loc);
          setAreaRestricted(res.data);
        } catch (e) {
          console.error(e);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
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
        (u) => u.created_by_id !== me.id &&
          !u.is_banned && !u.is_suspended && !u.invisible_mode &&
          !String(u.created_by_id).startsWith("service_")
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
    if (myProfile && filters.distance !== (myProfile.radius_miles ?? 5)) {
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

  const allProfiles = users;

  const getDisplayName = (user) => getUserDisplayName(user);

  // Use stored latitude/longitude from the user's profile (saved when they open the app)
  const getUserLatLng = (user) => {
    if (user.latitude != null && user.longitude != null) {
      return [user.latitude, user.longitude];
    }
    return null;
  };

  const tierCeiling = capabilities?.radius_miles_max;
  const effectiveRadius = capabilities?.radius_miles ?? filters.distance ?? 5;

  // Interests affect ranking only — everyone within range is always visible
  const radiusFiltered = allProfiles.filter((u) => {
    if (filters.onlineOnly && !u.is_online) return false;
    const coords = getUserLatLng(u);
    if (!coords) return false;
    const dist = distanceMiles(userLocation.lat, userLocation.lng, coords[0], coords[1]);
    if (effectiveRadius != null && dist > effectiveRadius) return false;
    return true;
  });

  // Rank by shared interests + proximity (Best Matches)
  const ranked = radiusFiltered
    .map((u) => {
      const shared = (u.interests || []).filter((i) => activeFilters.includes(i)).length;
      const coords = getUserLatLng(u);
      const dist = coords ? distanceMiles(userLocation.lat, userLocation.lng, coords[0], coords[1]) : Infinity;
      return { ...u, _shared: shared, _dist: dist, _score: shared * 10 - dist };
    })
    .sort((a, b) => b._score - a._score);

  const displayUsers = viewMode === "best" ? ranked.slice(0, 15) : ranked;

  // Smart clustering: threshold shrinks with zoom so blips spread out when zoomed in
  const CLUSTER_THRESHOLD = 0.02 / zoom;
  const CLUSTER_MIN = 3;

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

  const bestMatchId = viewMode === "best" && ranked.length > 0 ? ranked[0].id : null;
  const matchPct = selectedUser ? Math.min(99, Math.max(35, 50 + (selectedUser._shared || 0) * 8 + Math.max(0, 15 - (selectedUser._dist || 1) * 10))) : 0;
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
          <div className="absolute top-4 left-4 z-20 safe-top flex items-center gap-2">
            <div className="relative w-2 h-2 rounded-full bg-green-400">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
            </div>
            <span className="text-[11px] font-cyber text-white/70 tracking-wider">
              {users.filter((u) => u.is_online).length} users online
            </span>
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 safe-top">
            <img
              src="https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/a1047e68c_29CEE08A-B9AB-4759-8C30-4B99BC19A018.png"
              alt="NEX2"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* View Toggle — reduced glow, centered beneath title */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
            <div className="cyber-frame rounded-full p-0.5 flex gap-0.5">
              <button
                onClick={() => { setViewMode("best"); setExpandedClusters({}); }}
                className={`px-5 py-1.5 rounded-full text-xs font-cyber font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "best" ? "bg-blue-500/15 text-blue-300" : "text-white/40"
                }`}
              >
                <Sparkles className="w-3 h-3" /> Best Matches
              </button>
              <button
                onClick={() => { setViewMode("all"); setExpandedClusters({}); }}
                className={`px-5 py-1.5 rounded-full text-xs font-cyber font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "all" ? "bg-blue-500/15 text-blue-300" : "text-white/40"
                }`}
              >
                <Users className="w-3 h-3" /> All Nearby
              </button>
            </div>
          </div>
        </>
      )}

      {/* Chat Request Overlay — glass circle in radar center */}
      <ChatRequestOverlay blurred={showRadarOnboarding} />

      {/* Radar Scope / List View */}
      {layoutMode === "sonar" ? (
        <RadarScope
          center={userLocation}
          markers={markers}
          effectiveRadius={effectiveRadius}
          getUserLatLng={getUserLatLng}
          distanceMiles={distanceMiles}
          onUserClick={(user) => setSelectedUser(user)}
          onClusterClick={(key) => handleExpandCluster(key)}
          blurred={showRadarOnboarding}
          zoom={zoom}
          onZoomChange={setZoom}
          bestMatchId={bestMatchId}
        />
      ) : (
        <RadarList users={displayUsers} onUserClick={(user) => setSelectedUser(user)} />
      )}

      {/* Live status */}
      {!showRadarOnboarding && !selectedUser && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="text-[10px] font-cyber text-blue-400/30 tracking-widest">
            {users.length > 0 ? "BEST MATCH DETECTED" : "SCANNING"} · {effectiveRadius} MI RADIUS
          </p>
        </div>
      )}

      {/* Unified zoom control + view toggle */}
      {!showRadarOnboarding && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
          {layoutMode === "sonar" && (
            <div className="cyber-frame rounded-2xl flex flex-col items-center py-1">
              <button
                onClick={() => setZoom((z) => Math.min(5, z + 0.5))}
                className="w-10 h-10 flex items-center justify-center text-blue-300/70 active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="px-2 py-1.5 border-t border-b border-blue-500/10">
                <span className="text-[10px] font-cyber text-blue-300/50 tracking-wider">{zoom.toFixed(1)}×</span>
              </div>
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                className="w-10 h-10 flex items-center justify-center text-blue-300/70 active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* Sonar / List toggle */}
          <div className="cyber-frame rounded-full p-0.5 flex flex-col gap-0.5">
            <button
              onClick={() => setLayoutMode("sonar")}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${layoutMode === "sonar" ? "bg-blue-500/15 text-blue-300" : "text-white/30"}`}
            >
              <Radar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode("list")}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${layoutMode === "list" ? "bg-blue-500/15 text-blue-300" : "text-white/30"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                <h3 className="text-white font-cyber font-bold neon-text tracking-wider">FILTERS</h3>
                <button onClick={handleCloseFilters}>
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-blue-200/50 font-cyber uppercase tracking-wider">
                    Radius: {tierCeiling == null ? "Global" : `${filters.distance} mi`}
                  </label>
                  {tierCeiling != null && (
                    <button
                      onClick={() => setPaywallVariant("radius")}
                      className="text-[10px] text-blue-400 font-cyber font-medium flex items-center gap-1"
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
                  value={filters.distance || 5}
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
                <span className="text-blue-200/60 text-sm">Online only</span>
                <button
                  onClick={() => setFilters({ ...filters, onlineOnly: !filters.onlineOnly })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${filters.onlineOnly ? "gradient-blue" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${filters.onlineOnly ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-blue-200/50 font-cyber uppercase tracking-wider">Prioritize Interests</label>
                  {activeFilters.length > 0 && (
                    <button onClick={clearFilters} className="text-[10px] text-blue-400 font-medium">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {RADAR_INTERESTS.map((interest) => {
                    const isActive = activeFilters.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleFilter(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                          isActive ? "neon-btn text-white" : "cyber-input text-white/40"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
                {activeFilters.length === 0 && (
                  <p className="text-white/30 text-[11px] mt-2">Showing all interests. Tap to prioritize.</p>
                )}
                {activeFilters.length > 0 && (
                  <p className="text-white/30 text-[11px] mt-2">Prioritizing selected interests. All nearby users still visible.</p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected User Panel — anonymous match card */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute bottom-24 left-0 right-0 z-30 px-4"
          >
            <div className="cyber-frame rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
              <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3 z-10">
                <X className="w-4 h-4 text-white/30" />
              </button>

              <div className="relative">
                <p className="text-[10px] font-cyber text-blue-400/50 tracking-widest mb-2">NEARBY MATCH</p>

                {selectedUser.visibility !== "anonymous" && selectedUser.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedUser.interests.slice(0, 5).map((interest) => (
                      <span key={interest} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/8 text-blue-300/80 border border-blue-500/10">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                {selectedUser.visibility === "anonymous" && (
                  <p className="text-white/30 text-xs mb-4">Anonymous user — interests hidden</p>
                )}

                <div className="flex items-center gap-5 mb-4">
                  <div>
                    <p className="text-2xl font-cyber font-bold text-white neon-text">{Math.round(matchPct)}%</p>
                    <p className="text-[9px] font-cyber text-blue-400/40 tracking-wider uppercase mt-0.5">interest match</p>
                  </div>
                  <div className="h-8 w-px bg-blue-500/10" />
                  <div>
                    <p className="text-lg font-cyber font-bold text-white">
                      {selectedUser._dist < 0.1 ? `${Math.round(selectedUser._dist * 5280)}ft` : `${selectedUser._dist?.toFixed(1)}mi`}
                    </p>
                    <p className="text-[9px] font-cyber text-blue-400/40 tracking-wider uppercase mt-0.5">away</p>
                  </div>
                  {selectedUser.connections_count != null && (
                    <>
                      <div className="h-8 w-px bg-blue-500/10" />
                      <div>
                        <p className="text-lg font-cyber font-bold text-white">{selectedUser.connections_count}</p>
                        <p className="text-[9px] font-cyber text-blue-400/40 tracking-wider uppercase mt-0.5">connections</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  {capabilities && !capabilities.can_start_chat ? (
                    <button
                      onClick={() => setPaywallVariant("chat_limit")}
                      className="flex-1 py-3.5 rounded-xl cyber-input flex items-center justify-center gap-1.5 text-white/40 font-cyber font-medium text-sm"
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
                          const targetId = selectedUser.created_by_id || selectedUser.id;
                          const res = await base44.functions.invoke("submitWave", { receiver_id: targetId });
                          const data = res.data;
                          if (data?.mutual_match && data?.conversation_id) {
                            setSelectedUser(null);
                            navigate(`/chat/${data.conversation_id}`, { state: { chatUser: selectedUser } });
                          } else if (data?.error) {
                            console.error("Request error:", data.error);
                          } else {
                            setSelectedUser(null);
                            setRequestSent(true);
                            setTimeout(() => setRequestSent(false), 3000);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="flex-1 py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <MessageCircle className="w-4 h-4" /> REQUEST CHAT
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/user/${selectedUser.id}`, { state: { user: selectedUser } })}
                    className="px-4 py-3.5 rounded-xl cyber-input text-white/60 font-medium text-sm active:scale-[0.98] transition-transform"
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paywall Prompts */}
      <PaywallPrompt
        variant={paywallVariant}
        open={!!paywallVariant}
        onClose={() => setPaywallVariant(null)}
      />

      {/* Request Sent Confirmation */}
      <AnimatePresence>
        {requestSent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="cyber-frame rounded-2xl px-5 py-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <p className="text-white text-sm font-cyber font-medium neon-text">Chat request sent!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radar Onboarding Overlay */}
      <AnimatePresence>
        {showRadarOnboarding && (
          <RadarOnboardingOverlay key="radar-onboarding" onComplete={handleRadarOnboardingComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}