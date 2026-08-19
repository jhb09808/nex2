import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, EyeOff, Shield, Crown, BadgeCheck, MapPin, Lock, Sparkles, Users, Check, Radar, List, Handshake, Plus, Minus, Loader2, UserCircle } from "lucide-react";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import InterestTag from "@/components/nex/InterestTag";
import PaywallPrompt from "@/components/nex/PaywallPrompt";
import Logo from "@/components/nex/Logo";

import { getUserDisplayName, getUserNumberLabel } from "@/components/nex/userDisplay";
import RadarOnboardingOverlay from "@/components/nex/radar/RadarOnboardingOverlay";
import RadarScope from "@/components/nex/radar/RadarScope";
import RadarList from "@/components/nex/radar/RadarList";
import NearbyMapDesktop from "@/pages/NearbyMapDesktop";
import useIsDesktop from "@/hooks/useIsDesktop";
import ChatRequestOverlay from "@/components/nex/radar/ChatRequestOverlay";

import { calculateSharedInterests, getSharedInterestLabels, getSubInterestName, INTEREST_CATEGORIES } from "@/components/nex/radar/interestCategories";
import { generateMockProfiles } from "@/components/nex/mapMockProfiles";

const DEFAULT_LOCATION = { lat: 40.7589, lng: -73.9851 };

// Match sheet — the bottom panel shown when a blip or list row is tapped.
const SHEET_SUB = { marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13.5, lineHeight: 1.4, letterSpacing: "0.04em", color: "#a6cbec" };
const SHEET_LABEL = { fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7fa9d4" };
const SHEET_STAT = { fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em", color: "#eaf6ff" };
const SHEET_DIV = { width: 1, alignSelf: "stretch", background: "rgba(105,190,255,.22)" };
const SHEET_GHOST = { display: "flex", alignItems: "center", justifyContent: "center", height: 52, border: "1px solid rgba(120,190,255,.32)", background: "rgba(10,30,60,.55)", backdropFilter: "blur(8px)", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 12, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" };
const SHEET_DOT_FALLBACK = "#8fd0ff";
// Toggle mock bots on the radar for testing chat/notification flows
const SHOW_MOCK_BOTS = true;

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
  const [requestWaiting, setRequestWaiting] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [showRadarOnboarding, setShowRadarOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState("best");
  const [layoutMode, setLayoutMode] = useState("sonar");
  const [activeFilters, setActiveFilters] = useState([]);
  const [expandedClusters, setExpandedClusters] = useState({});
  const [zoom, setZoom] = useState(1);
  // The radar needs room for its rail and side panel — 1200, not the 1024
  // the other desktop screens use.
  const isDesktop = useIsDesktop(1200);

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

      // Gender filter — users can choose to see only male, female, or all
      const genderFilter = myP?.radar_gender_filter || "all";
      if (genderFilter !== "all") {
        realUsers = realUsers.filter((u) => u.gender === genderFilter);
      }

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

  // Shared by the phone sheet and the desktop side panel.
  const requestChat = async () => {
    try {
      // Mock users — simulate the other person deciding
      if (selectedUser.isMock) {
        const bot = selectedUser;
        const myId = myProfile?.created_by_id;
        setSelectedUser(null);
        setRequestWaiting(true);
        // Create a real conversation so the chat works end-to-end
        let convo;
        try {
          convo = await base44.entities.Conversation.create({
            participants: [myId, bot.id].filter(Boolean),
            is_active: true,
          });
        } catch (e) {
          console.error(e);
        }
        // Simulate response delay (~2.5s)
        setTimeout(() => {
          setRequestWaiting(false);
          const accepted = Math.random() < 0.65;
          if (accepted && convo?.id) {
            navigate(`/chat/${convo.id}`, { state: { chatUser: bot } });
          }
          // If denied — silently close, no notification shown
        }, 2500);
        return;
      }
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
      }
    } catch (err) {
      console.error(err);
    }
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

  const getDisplayName = (user) => getUserDisplayName(user);

  const tierCeiling = capabilities?.radius_miles_max;
  const effectiveRadius = capabilities?.radius_miles ?? filters.distance ?? 5;

  // Use stored latitude/longitude from the user's profile (saved when they open the app)
  const getUserLatLng = (user) => {
    if (user.latitude != null && user.longitude != null) {
      return [user.latitude, user.longitude];
    }
    return null;
  };

  // Merge mock bots around the user's ACTUAL location, spread across the full radius
  const allProfiles = useMemo(() => {
    if (!SHOW_MOCK_BOTS) return users;
    const bots = generateMockProfiles(userLocation, effectiveRadius).map((b) => ({
      ...b,
      latitude: b.lat,
      longitude: b.lng,
      isMock: true,
    }));
    return [...users, ...bots];
  }, [users, userLocation, effectiveRadius]);

  // Interests affect ranking only — everyone within range is always visible
  const radiusFiltered = allProfiles.filter((u) => {
    if (filters.onlineOnly && !u.is_online) return false;
    const coords = getUserLatLng(u);
    if (!coords) return false;
    const dist = distanceMiles(userLocation.lat, userLocation.lng, coords[0], coords[1]);
    if (effectiveRadius != null && dist > effectiveRadius) return false;
    return true;
  });

  // Rank by shared sub-interests + proximity (Best Matches)
  const ranked = radiusFiltered
    .map((u) => {
      const { score } = calculateSharedInterests(activeFilters, u.interests || []);
      const coords = getUserLatLng(u);
      const dist = coords ? distanceMiles(userLocation.lat, userLocation.lng, coords[0], coords[1]) : Infinity;
      return { ...u, _shared: score, _dist: dist, _score: score - dist };
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

  const hasActiveFilters =
    activeFilters.length > 0 ||
    filters.onlineOnly ||
    (myProfile?.radar_gender_filter || "all") !== "all";

  const bestMatchId = viewMode === "best" && ranked.length > 0 ? ranked[0].id : null;
  const sheetColor = selectedUser?._blipColor || SHEET_DOT_FALLBACK;
  // One formula for the sheet, the desktop panel and its shortcut list.
  const matchPctFor = (u) =>
    u ? Math.min(99, Math.max(35, 50 + (u._shared || 0) * 8 + Math.max(0, 15 - (u._dist || 1) * 10))) : 0;
  const matchPct = matchPctFor(selectedUser);
  const markers = computeClusters(displayUsers);

  if (isDesktop && !loading && !areaRestricted?.restricted && !showRadarOnboarding) {
    return (
      <>
        <NearbyMapDesktop
          scope={{
            center: userLocation,
            markers,
            getUserLatLng,
            distanceMiles,
            onClusterClick: handleExpandCluster,
            bestMatchId,
          }}
          myProfile={myProfile}
          viewMode={viewMode}
          setViewMode={(m) => { setViewMode(m); setExpandedClusters({}); }}
          onlineCount={users.filter((u) => u.is_online).length}
          onScope={displayUsers}
          effectiveRadius={effectiveRadius}
          zoom={zoom}
          setZoom={setZoom}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          matchPct={matchPct}
          matchPctFor={matchPctFor}
          onRequestChat={requestChat}
          filters={filters}
          setFilters={setFilters}
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <PaywallPrompt variant={paywallVariant} open={!!paywallVariant} onClose={() => setPaywallVariant(null)} />
      </>
    );
  }

  if (areaRestricted?.restricted) {
    return (
      <div className="h-full flex items-center justify-center px-8 text-center">
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
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden h-full flex flex-col">
      {/* Logo as faded background watermark — part of the background, not a floating box */}
      {!showRadarOnboarding && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-0 pointer-events-none safe-top opacity-[0.06]">
          <Logo size="lg" />
        </div>
      )}

      {/* View Toggle — centered at top */}
      {!showRadarOnboarding && (
        <div
          className="absolute left-0 right-0 z-20 flex items-center gap-3"
          style={{
            // Centres this row on NavMenu's 44px hamburger: the row is 50px
            // tall (seg-wrap), the hamburger 44px at the same safe-area top.
            top: "calc(max(1rem, env(safe-area-inset-top, 0px)) - 3px)",
            paddingLeft: 16,
            // clear the hamburger (44px at right:16) and keep the design's 12px gap
            paddingRight: 72,
          }}
        >
          <div className="seg-wrap" style={{ flex: 1 }}>
            <button
              onClick={() => { setViewMode("best"); setExpandedClusters({}); }}
              className="seg"
              aria-pressed={viewMode === "best"}
            >
              <Sparkles className="w-3.5 h-3.5" /> Best Matches
            </button>
            <button
              onClick={() => { setViewMode("all"); setExpandedClusters({}); }}
              className="seg"
              aria-pressed={viewMode === "all"}
            >
              <Users className="w-3.5 h-3.5" /> All Nearby
            </button>
          </div>

          {/* Filters — the design puts this in the header; previously it was
              only reachable from the nav menu. */}
          <button
            onClick={() => setShowFilters(true)}
            className="circ"
            style={{ position: "relative" }}
            aria-label="Filters"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.4 2v4.4M3.4 10.2V16M9 2v2.6M9 8.4V16M14.6 2v7.4M14.6 13.2V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="3.4" cy="8.3" r="1.9" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9" cy="6.5" r="1.9" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14.6" cy="11.3" r="1.9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {hasActiveFilters && (
              <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0" }} />
            )}
          </button>
        </div>
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
          onUserClick={(user, blipColor) => setSelectedUser(blipColor ? { ...user, _blipColor: blipColor } : user)}
          onClusterClick={(key) => handleExpandCluster(key)}
          blurred={showRadarOnboarding}
          zoom={zoom}
          onZoomChange={setZoom}
          bestMatchId={bestMatchId}
        />
      ) : (
        <RadarList
          users={displayUsers}
          onUserClick={(user) => setSelectedUser(user)}
          activeInterests={activeFilters}
          radiusMiles={effectiveRadius}
        />
      )}

      {/* Live status — sonar only */}
      {!showRadarOnboarding && !selectedUser && layoutMode === "sonar" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <div className="relative w-1.5 h-1.5 rounded-full bg-green-400">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
            </div>
            <span className="text-[11px] font-cyber text-white/70 tracking-wider">
              {ranked.filter((u) => u.is_online).length} users online
            </span>
          </div>
          <p className="text-[10px] font-cyber text-blue-400/30 tracking-widest">
            {ranked.length > 0 ? `BEST MATCH DETECTED · ${ranked[0]?._dist < 0.1 ? `${Math.round(ranked[0]._dist * 5280)}FT` : `${ranked[0]?._dist?.toFixed(1)} MI`} AWAY` : "SCANNING"}
          </p>
        </div>
      )}

      {/* Zoom control + sonar/list toggle */}
      {!showRadarOnboarding && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
          {layoutMode === "sonar" && (
            <div className="rail">
              <button onClick={() => setZoom((z) => Math.min(5, z + 0.5))} className="rail-btn" aria-label="Zoom in">
                <Plus className="w-4 h-4" />
              </button>
              <div className="rail-sep" />
              <div style={{ width: 44, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#8fb9e2" }}>
                {zoom.toFixed(1)}×
              </div>
              <div className="rail-sep" />
              <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="rail-btn" aria-label="Zoom out">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="rail">
            <button
              onClick={() => setLayoutMode("sonar")}
              className="rail-btn"
              aria-current={layoutMode === "sonar" ? "page" : undefined}
              aria-label="Radar view"
            >
              <Radar className="w-4 h-4" />
            </button>
            <div className="rail-sep" />
            <button
              onClick={() => setLayoutMode("list")}
              className="rail-btn"
              aria-current={layoutMode === "list" ? "page" : undefined}
              aria-label="List view"
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
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ padding: "0 14px" }}
          >
            <div className="absolute inset-0" onClick={handleCloseFilters} style={{ background: "rgba(1,6,14,.78)", backdropFilter: "blur(4px)" }} />
            <div className="notch-lg" style={{ position: "relative", width: "100%", maxHeight: "86dvh", overflowY: "auto", padding: 18, background: "linear-gradient(180deg, rgba(10,32,64,.97), rgba(5,16,34,.98))", border: "1px solid rgba(105,190,255,.38)", boxShadow: "0 20px 60px rgba(1,6,14,.8)" }}>
              <div className="flex items-center justify-between">
                <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 19, lineHeight: 1, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff" }}>Filters</div>
                <button onClick={handleCloseFilters} aria-label="Close filters" style={{ width: 44, height: 44, margin: "-10px -10px -10px 0", display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#7fa9d4", cursor: "pointer" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>
                    Radius: {tierCeiling == null ? "Global" : `${filters.distance} mi`}
                  </span>
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
                  className="w-full" style={{ accentColor: "#3f9dff", cursor: "pointer" }}
                />
              </div>

              <label className="flex items-center justify-between">
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 14, lineHeight: 1, color: "#dceeff" }}>Online only</span>
                <button
                  onClick={() => setFilters({ ...filters, onlineOnly: !filters.onlineOnly })}
                  aria-pressed={filters.onlineOnly}
                  style={{ position: "relative", flex: "none", width: 52, height: 30, border: 0, borderRadius: 999, background: filters.onlineOnly ? "#1b62d6" : "rgba(105,190,255,.2)", cursor: "pointer", transition: "background .2s ease" }}
                >
                  <span style={{ position: "absolute", top: 3, left: filters.onlineOnly ? 25 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s ease" }} />
                </button>
              </label>

              <div>
                <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2", marginBottom: 10 }}>Show me</div>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "Everyone", icon: Users },
                    { value: "female", label: "Women", icon: UserCircle },
                    { value: "male", label: "Men", icon: UserCircle },
                  ].map((opt) => {
                    const active = (myProfile?.radar_gender_filter || "all") === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={async () => {
                          if (!myProfile) return;
                          const newVal = opt.value;
                          setMyProfile({ ...myProfile, radar_gender_filter: newVal });
                          try {
                            await base44.entities.UserProfile.update(myProfile.id, { radar_gender_filter: newVal });
                            loadUsers();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="notch"
                        aria-pressed={active}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 44, cursor: "pointer", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 12, lineHeight: 1, letterSpacing: "0.06em", transition: "background .2s ease, border-color .2s ease", border: active ? "1px solid rgba(140,205,255,.75)" : "1px solid rgba(105,190,255,.2)", background: active ? "rgba(45,115,215,.4)" : "rgba(16,44,84,.4)", color: active ? "#eaf6ff" : "#a6cbec" }}
                      >
                        <Icon className="w-3.5 h-3.5" /> {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>Prioritize interests</span>
                  {activeFilters.length > 0 && (
                    <button onClick={clearFilters} style={{ height: 28, border: 0, background: "transparent", padding: 0, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7fc8ff", cursor: "pointer" }}>
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {(myProfile?.interests || []).map((interestId) => {
                    const isActive = activeFilters.includes(interestId);
                    return (
                      <button
                        key={interestId}
                        onClick={() => toggleFilter(interestId)}
                        className="chip"
                        aria-pressed={isActive}
                      >
                        {getSubInterestName(interestId)}
                      </button>
                    );
                  })}
                </div>
                {activeFilters.length === 0 && (
                  <p className="text-white/30 text-[11px] mt-2">Showing all interests. Tap to prioritize.</p>
                )}
                {activeFilters.length > 0 && (
                  <p style={{ margin: "12px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 11, lineHeight: 1.5, color: "#7fa9d4" }}>Prioritizing selected interests. All nearby users still visible.</p>
                )}
              </div>

              <button onClick={handleCloseFilters} className="cta notch" style={{ width: "100%", height: 52, marginTop: 16, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 13, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                <span className="sheen" />
                <span style={{ position: "relative" }}>Show {displayUsers.length} results</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected User Panel — anonymous match card */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="notch-lg"
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
              zIndex: 30,
              padding: "16px 16px 14px",
              background: "linear-gradient(180deg, rgba(10,32,64,.92), rgba(6,20,42,.96))",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(105,190,255,.34)",
              boxShadow: "0 -8px 34px rgba(2,10,25,.6), 0 0 30px rgba(40,120,220,.18)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8fd0ff" }}>
                    <span style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: sheetColor, boxShadow: `0 0 10px ${sheetColor}` }} />
                    Nearby match
                  </div>

                  {selectedUser.visibility === "anonymous" ? (
                    <div style={SHEET_SUB}>Anonymous user — interests hidden</div>
                  ) : (() => {
                    const sharedLabels = getSharedInterestLabels(myProfile?.interests || [], selectedUser.interests || [], 3);
                    return sharedLabels.length > 0
                      ? <div style={SHEET_SUB}>You both like {sharedLabels.join(", ")}.</div>
                      : <div style={SHEET_SUB}>{getUserDisplayName(selectedUser)}</div>;
                  })()}
                </div>

                <button onClick={() => setSelectedUser(null)} aria-label="Dismiss" style={{ flex: "none", width: 44, height: 44, margin: "-10px -10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", cursor: "pointer", color: "#7fa9d4" }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {selectedUser.visibility !== "anonymous" && selectedUser.interests?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
                  {selectedUser.interests.slice(0, 5).map((id) => (
                    <span key={id} className="tag">{getSubInterestName(id)}</span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 16 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 34, lineHeight: 1, letterSpacing: "-0.01em", color: "#eaf6ff", textShadow: "0 0 22px rgba(90,180,255,.55)" }}>{Math.round(matchPct)}%</div>
                  <div style={{ ...SHEET_LABEL, color: "#8fd0ff", marginTop: 7 }}>Interest match</div>
                </div>
                <div style={SHEET_DIV} />
                <div>
                  <div style={SHEET_STAT}>
                    {selectedUser._dist < 0.1 ? `${Math.round(selectedUser._dist * 5280)} ft` : `${selectedUser._dist?.toFixed(1)} mi`}
                  </div>
                  <div style={{ ...SHEET_LABEL, marginTop: 8 }}>Away</div>
                </div>
                {selectedUser.connections_count != null && (
                  <>
                    <div style={SHEET_DIV} />
                    <div>
                      <div style={SHEET_STAT}>{selectedUser.connections_count}</div>
                      <div style={{ ...SHEET_LABEL, marginTop: 8 }}>Connections</div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
                  {capabilities && !capabilities.can_start_chat ? (
                    <button
                      onClick={() => setPaywallVariant("chat_limit")}
                      className="notch"
                      style={{ ...SHEET_GHOST, flex: 1, gap: 9 }}
                    >
                      <Lock className="w-4 h-4" /> Chat limit reached
                    </button>
                  ) : (
                    <button
                      onClick={requestChat}
                      className="cta notch"
                      style={{ flex: 1, height: 52, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 13, lineHeight: 1, letterSpacing: "0.17em", textTransform: "uppercase" }}
                    >
                      <span className="sheen" />
                      <svg width="16" height="15" viewBox="0 0 18 17" fill="none" aria-hidden="true" style={{ position: "relative" }}>
                        <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                      <span style={{ position: "relative" }}>Request chat</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/user/${selectedUser.id}`, { state: { user: selectedUser } })}
                    className="notch"
                    style={{ ...SHEET_GHOST, flex: "none", padding: "0 20px" }}
                  >
                    Profile
                  </button>
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

      {/* Waiting for Response Modal — shown while the other person "decides" */}
      <AnimatePresence>
        {requestWaiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="cyber-frame cyber-corners relative rounded-2xl p-7 max-w-xs w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <h2 className="font-cyber text-lg font-bold text-white neon-text mb-2">Waiting...</h2>
              <p className="text-blue-200/60 text-sm leading-relaxed">
                Your chat request was sent. Waiting for a response.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Sent Confirmation Modal */}
      <AnimatePresence>
        {requestSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setRequestSent(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="cyber-frame cyber-corners relative rounded-2xl p-7 max-w-xs w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-cyber text-lg font-bold text-white neon-text mb-2">Request Sent</h2>
              <p className="text-blue-200/60 text-sm leading-relaxed mb-5">
                We'll notify you when the user accepts your chat request.
              </p>
              <button
                onClick={() => setRequestSent(false)}
                className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider transition-transform"
              >
                GOT IT
              </button>
            </motion.div>
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