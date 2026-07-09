import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import RadarScope from "@/components/nex/radar/RadarScope";
import { RADAR_INTERESTS } from "@/components/nex/radar/constants";

const DEFAULT_LOCATION = { lat: 40.7589, lng: -73.9851 };

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
  const [zoom, setZoom] = useState(1);

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

  const displayUsers = viewMode === "best" ? ranked.slice(0, 15) : ranked;

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
        </>
      )}

      {/* Radar Scope — tactical radar with privacy jitter on blip positions */}
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
      />

      {/* Zoom controls */}
      {!showRadarOnboarding && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(5, z + 1))}
            className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center text-white/70 text-xl font-light active:scale-95 transition-transform"
          >
            +
          </button>
          <span className="text-center text-[10px] font-mono text-white/30">{zoom}x</span>
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 1))}
            className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center text-white/70 text-xl font-light active:scale-95 transition-transform"
          >
            −
          </button>
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Interests</label>
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
                          isActive ? "gradient-blue text-white glow-blue-sm" : "glass text-white/40"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
                {activeFilters.length === 0 && (
                  <p className="text-white/30 text-[11px] mt-2">Showing all interests. Tap to filter.</p>
                )}
              </div>
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