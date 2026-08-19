import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import RadarScope from "@/components/nex/radar/RadarScope";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";
import radarBg from "@/assets/radar-map.webp";

const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/37125597e_NEX2.png";

const S = { fill: "none", "aria-hidden": "true", style: { flex: "none" } };

const NAV = [
  { path: "/map", label: "Radar", icon: (
    <svg width="19" height="19" viewBox="0 0 20 20" {...S}>
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.4" fill="currentColor" />
      <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) },
  { path: "/discover", label: "Discover", icon: (
    <svg width="19" height="19" viewBox="0 0 20 20" {...S}>
      <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13.4 6.6l-2 4.8-4.8 2 2-4.8 4.8-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ) },
  { path: "/messages", label: "Messages", icon: (
    <svg width="19" height="18" viewBox="0 0 18 17" {...S}>
      <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ) },
  { path: "/notifications", label: "Alerts", icon: (
    <svg width="18" height="19" viewBox="0 0 17 18" {...S}>
      <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) },
  { path: "/profile", label: "Profile", icon: (
    <svg width="19" height="19" viewBox="0 0 18 18" {...S}>
      <circle cx="9" cy="6" r="3.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.4 16.4c0-3.4 2.9-5.4 6.6-5.4s6.6 2 6.6 5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) },
  { path: "/leaderboard", label: "Leaderboard", icon: (
    <svg width="19" height="19" viewBox="0 0 18 18" {...S}>
      <path d="M5 1.6h8v4.2a4 4 0 0 1-8 0V1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 2.8H2.4v1.4A2.6 2.6 0 0 0 5 6.8M13 2.8h2.6v1.4A2.6 2.6 0 0 1 13 6.8M9 9.8v3.4M5.8 16.4h6.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) },
  { path: "/settings", label: "Settings", icon: (
    <svg width="19" height="19" viewBox="0 0 18 18" {...S}>
      <circle cx="9" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 1.2v1.9M9 14.9v1.9M16.8 9h-1.9M3.1 9H1.2M14.5 3.5l-1.3 1.3M4.8 13.2l-1.3 1.3M14.5 14.5l-1.3-1.3M4.8 4.8L3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) },
];

const SIGNOUT = (
  <svg width="16" height="15" viewBox="0 0 18 17" {...S}>
    <path d="M11.4 1.6H2.6v13.8h8.8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12.4 5.4l3.2 3.1-3.2 3.1M15.4 8.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FILTER_GLYPH = (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.4 2v4.4M3.4 10.2V16M9 2v2.6M9 8.4V16M14.6 2v7.4M14.6 13.2V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="3.4" cy="8.3" r="1.9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="6.5" r="1.9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="14.6" cy="11.3" r="1.9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RECENTER_GLYPH = (
  <svg width="19" height="19" viewBox="0 0 20 20" {...S}>
    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="2.4" fill="currentColor" />
    <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const STAT = { fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 20, lineHeight: 1, color: "#eaf6ff" };
const STAT_LABEL = { marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7fa9d4" };
const F_LABEL = { fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" };
const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";
const PILL = { display: "flex", border: "1px solid rgba(105,190,255,.26)", borderRadius: 999, background: "rgba(8,26,54,.72)", backdropFilter: "blur(12px)", overflow: "hidden" };

const fmtDist = (d) => (d == null ? "—" : d < 0.1 ? `${Math.round(d * 5280)} ft` : `${d.toFixed(1)} mi`);

export default function NearbyMapDesktop({
  scope,
  myProfile,
  viewMode,
  setViewMode,
  onlineCount,
  onScope,
  effectiveRadius,
  zoom,
  setZoom,
  selectedUser,
  setSelectedUser,
  matchPct,
  matchPctFor,
  onRequestChat,
  filters,
  setFilters,
  activeFilters,
  toggleFilter,
  clearFilters,
  hasActiveFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const location = useLocation();

  const closest = [...onScope]
    .filter((u) => u._dist != null)
    .sort((a, b) => a._dist - b._dist)
    .slice(0, 3);

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", overflow: "hidden", padding: 20, boxSizing: "border-box", background: "radial-gradient(80% 70% at 44% 52%, #08203f 0%, #04101f 46%, #01050c 100%)" }}>
      {/* Background */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={radarBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(52% 62% at 44% 52%, rgba(1,6,14,.94) 0%, rgba(1,6,14,.74) 54%, rgba(1,6,14,.4) 100%)" }} />
      </div>

      {/* HUD frame */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 20, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 20, left: 20, width: 30, height: 30, borderLeft: "2px solid rgba(125,205,255,.6)", borderTop: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 20, right: 20, width: 30, height: 30, borderRight: "2px solid rgba(125,205,255,.6)", borderTop: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 20, left: 20, width: 30, height: 30, borderLeft: "2px solid rgba(125,205,255,.6)", borderBottom: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 20, right: 20, width: 30, height: 30, borderRight: "2px solid rgba(125,205,255,.6)", borderBottom: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />

      {/* Sidebar */}
      <aside style={{ position: "relative", zIndex: 6, flex: "none", width: 258, height: "100%", display: "flex", flexDirection: "column", padding: "24px 0 10px", background: "rgba(4,14,30,.72)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(105,190,255,.16)" }}>
        <div style={{ padding: "0 18px" }}>
          <img src={LOGO_URL} alt="NEX2" style={{ display: "block", width: 110, height: 17.7, filter: "drop-shadow(0 0 10px rgba(90,180,255,.7))" }} />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-row"
              {...(location.pathname === item.path ? { "data-active": "" } : {})}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ margin: "0 18px", paddingTop: 18, borderTop: "1px solid rgba(105,190,255,.14)", display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ flex: "none", width: 38, height: 38, border: "2px solid rgba(255,255,255,.2)", borderRadius: "50%", overflow: "hidden" }}>
            <GenerativeAvatar seed={myProfile ? getUserDisplayName(myProfile) : "you"} gender={myProfile?.gender} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 13, lineHeight: 1, color: "#eaf6ff" }}>You</div>
            <div style={{ marginTop: 6, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: myProfile?.invisible_mode ? "#7fa9d4" : "#4dffb0" }}>
              {myProfile?.invisible_mode ? "Hidden" : "Visible"}
            </div>
          </div>
          <button
            onClick={() => base44.auth.logout("/welcome?logged_out=1")}
            aria-label="Sign Out"
            className="dk-signout"
            style={{ flex: "none", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,128,128,.28)", borderRadius: "50%", background: "transparent", color: "#ff8080", cursor: "pointer" }}
          >
            {SIGNOUT}
          </button>
        </div>
      </aside>

      <main style={{ position: "relative", zIndex: 5, flex: 1, minWidth: 0, display: "flex" }}>
        {/* Scope column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "24px 40px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", padding: 4, border: "1px solid rgba(105,190,255,.28)", borderRadius: 999, background: "rgba(8,26,54,.66)", backdropFilter: "blur(10px)" }}>
                <button className="seg-dk" aria-pressed={viewMode === "best"} onClick={() => setViewMode("best")}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 .8l1.5 3.9L12.4 6 8.5 7.5 7 11.4 5.5 7.5 1.6 6l3.9-1.3L7 .8z" fill="currentColor" /></svg>
                  Best matches
                </button>
                <button className="seg-dk" aria-pressed={viewMode === "all"} onClick={() => setViewMode("all")}>
                  <svg width="14" height="12" viewBox="0 0 16 13" fill="none" aria-hidden="true"><circle cx="5.6" cy="3.6" r="2.6" stroke="currentColor" strokeWidth="1.3" /><path d="M1 12c0-2.3 2-3.6 4.6-3.6S10.2 9.7 10.2 12" stroke="currentColor" strokeWidth="1.3" /><path d="M11.4 1.4a2.6 2.6 0 0 1 0 4.6M12.6 8.8c1.5.5 2.4 1.6 2.4 3.2" stroke="currentColor" strokeWidth="1.3" /></svg>
                  All nearby
                </button>
              </div>

              <div style={{ position: "relative" }}>
                <button className="circ" aria-label="Filters" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)} style={{ position: "relative" }}>
                  {FILTER_GLYPH}
                  {hasActiveFilters && <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0" }} />}
                </button>

                {filtersOpen && (
                  <div style={{ position: "absolute", left: 0, top: "calc(100% + 8px)", zIndex: 30, width: 340, maxHeight: "min(440px, 70vh)", overflowY: "auto", padding: "18px 20px 20px", background: "linear-gradient(180deg, rgba(10,30,60,.97), rgba(6,18,38,.98))", backdropFilter: "blur(18px)", border: "1px solid rgba(105,190,255,.34)", boxShadow: "0 18px 44px rgba(1,6,14,.7)", clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={F_LABEL}>Filters</span>
                      <button onClick={clearFilters} style={{ border: 0, background: "transparent", padding: 0, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7fa9d4", cursor: "pointer" }}>Reset</button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                      <span style={F_LABEL}>Radius</span>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(105,190,255,.26)", borderRadius: 999, overflow: "hidden" }}>
                        <button className="rail-btn-dk" aria-label="Smaller radius" onClick={() => setFilters((f) => ({ ...f, distance: Math.max(0.5, (f.distance || 1) - 0.5) }))}>−</button>
                        <div style={{ width: 56, textAlign: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11.5, lineHeight: 1, color: "#eaf6ff" }}>{effectiveRadius} mi</div>
                        <button className="rail-btn-dk" aria-label="Larger radius" onClick={() => setFilters((f) => ({ ...f, distance: Math.min(5, (f.distance || 1) + 0.5) }))}>+</button>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                      <span style={F_LABEL}>Online only</span>
                      <button
                        role="switch"
                        aria-checked={!!filters.onlineOnly}
                        aria-label="Online only"
                        onClick={() => setFilters((f) => ({ ...f, onlineOnly: !f.onlineOnly }))}
                        style={{ position: "relative", width: 54, height: 30, border: 0, borderRadius: 999, background: filters.onlineOnly ? "#1b62d6" : "rgba(120,200,255,.18)", cursor: "pointer", transition: "background .2s ease" }}
                      >
                        <span style={{ position: "absolute", top: 3, left: filters.onlineOnly ? 27 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s ease" }} />
                      </button>
                    </div>

                    <div style={{ ...F_LABEL, marginTop: 18 }}>Interests</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                      {(myProfile?.interests || []).map((id) => (
                        <button key={id} className="chip-dk" data-on={activeFilters.includes(id) ? "" : undefined} onClick={() => toggleFilter(id)}>
                          {getSubInterestName(id)}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(105,190,255,.18)", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>
                      {onScope.length} on scope
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 9, whiteSpace: "nowrap", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 13, lineHeight: 1, letterSpacing: "0.1em", color: "#dceeff" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 9px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
              {onlineCount} users online
            </div>
          </div>

          {/* Disc — sized from the shorter axis so it never turns into an ellipse */}
          <div className="dk-disc-stage" style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div aria-hidden="true" style={{ position: "absolute", width: 620, height: 620, maxWidth: "100%", maxHeight: "100%", borderRadius: "50%", background: "radial-gradient(circle at center, rgba(45,130,255,.24) 0%, rgba(6,20,40,0) 66%)" }} />
            <div className="dk-disc-box" style={{ position: "relative" }}>
              <RadarScope
                bare
                discSize="100%"
                center={scope.center}
                markers={scope.markers}
                effectiveRadius={effectiveRadius}
                getUserLatLng={scope.getUserLatLng}
                distanceMiles={scope.distanceMiles}
                onUserClick={(user, blipColor) => setSelectedUser(blipColor ? { ...user, _blipColor: blipColor } : user)}
                onClusterClick={scope.onClusterClick}
                zoom={zoom}
                onZoomChange={setZoom}
                bestMatchId={scope.bestMatchId}
              />
            </div>
          </div>

          {/* Zoom + recenter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={PILL}>
              <button className="rail-btn-dk" style={{ width: 46, height: 44 }} aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>−</button>
              <div style={{ width: 56, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 12, lineHeight: 1, color: "#8fb9e2", borderLeft: "1px solid rgba(105,190,255,.16)", borderRight: "1px solid rgba(105,190,255,.16)" }}>
                {zoom.toFixed(1)}×
              </div>
              <button className="rail-btn-dk" style={{ width: 46, height: 44 }} aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(5, z + 0.5))}>+</button>
            </div>
            <button
              onClick={() => { setZoom(1); setSelectedUser(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", border: "1px solid rgba(105,190,255,.26)", borderRadius: 999, background: "rgba(8,26,54,.72)", backdropFilter: "blur(12px)", color: "#bfe2ff", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
            >
              {RECENTER_GLYPH}
              Recenter
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: "none", width: 340, padding: "24px 30px 10px", borderLeft: "1px solid rgba(105,190,255,.16)", background: "rgba(4,14,30,.6)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column" }}>
          {selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8fd0ff" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: selectedUser._blipColor || "#8fd0ff", boxShadow: `0 0 10px ${selectedUser._blipColor || "#8fd0ff"}` }} />
                Nearby match
              </div>

              <div style={{ width: 104, height: 104, margin: "26px auto 0", border: "2px solid rgba(255,255,255,.2)", borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 26px rgba(120,200,255,.22)" }}>
                <GenerativeAvatar seed={getUserDisplayName(selectedUser)} gender={selectedUser.gender} />
              </div>

              <div style={{ marginTop: 22, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: "-0.01em", color: "#eaf6ff", textShadow: "0 0 28px rgba(90,180,255,.55)" }}>{Math.round(matchPct)}%</div>
                <div style={{ marginTop: 10, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.24em", textTransform: "uppercase", color: "#8fd0ff" }}>Interest match</div>
              </div>

              <div style={{ display: "flex", marginTop: 24, padding: "16px 0", borderTop: "1px solid rgba(105,190,255,.18)", borderBottom: "1px solid rgba(105,190,255,.18)" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={STAT}>{fmtDist(selectedUser._dist)}</div>
                  <div style={STAT_LABEL}>Away</div>
                </div>
                <div style={{ width: 1, background: "rgba(105,190,255,.18)" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={STAT}>{selectedUser._shared ?? 0}</div>
                  <div style={STAT_LABEL}>Shared</div>
                </div>
              </div>

              <p style={{ margin: "20px 0 0", textAlign: "center", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.55, color: "#a6cbec" }}>
                Identity and interests stay hidden until you both accept a chat.
              </p>

              <div style={{ flex: 1, minHeight: 20 }} />

              <button
                onClick={onRequestChat}
                className="cta"
                style={{ position: "relative", overflow: "hidden", width: "100%", height: 54, gap: 11, clipPath: NOTCH, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 13, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase" }}
              >
                <span className="sheen" />
                <svg width="19" height="18" viewBox="0 0 18 17" fill="none" aria-hidden="true" style={{ flex: "none", position: "relative" }}>
                  <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <span style={{ position: "relative" }}>Request chat</span>
              </button>

              <Link
                to={`/user/${selectedUser.id}`}
                state={{ user: selectedUser }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 48, marginTop: 10, clipPath: NOTCH_SM, border: "1px solid rgba(120,190,255,.3)", background: "rgba(10,30,60,.5)", color: "#bcd9f5", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase" }}
              >
                View profile
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7fa9d4" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", border: "1px solid rgba(127,169,212,.7)" }} />
                No one selected
              </div>

              <div style={{ position: "relative", width: 104, height: 104, margin: "26px auto 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(105,190,255,.3)" }} />
                <div style={{ position: "absolute", inset: 26, borderRadius: "50%", border: "1px solid rgba(105,190,255,.18)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(130,210,255,.24), rgba(130,210,255,0) 54%)", animation: "nxsweep 5s linear infinite" }} />
                </div>
                <div style={{ position: "relative", width: 9, height: 9, borderRadius: "50%", background: "#7fa9d4", boxShadow: "0 0 14px rgba(120,200,255,.5)" }} />
              </div>

              <p style={{ margin: "24px 0 0", textAlign: "center", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.6, color: "#a6cbec" }}>
                Click any blip on the radar to see how closely your interests line up.
              </p>

              <div style={{ display: "flex", marginTop: 26, padding: "16px 0", borderTop: "1px solid rgba(105,190,255,.18)", borderBottom: "1px solid rgba(105,190,255,.18)" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={STAT}>{onScope.length}</div>
                  <div style={STAT_LABEL}>On scope</div>
                </div>
                <div style={{ width: 1, background: "rgba(105,190,255,.18)" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={STAT}>{effectiveRadius} mi</div>
                  <div style={STAT_LABEL}>Radius</div>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 20 }} />

              <div style={F_LABEL}>Closest right now</div>
              {closest.map((u) => (
                <button key={u.id} className="shortcut-dk" onClick={() => setSelectedUser(u)}>
                  <span style={{ flex: "none", width: 9, height: 9, borderRadius: "50%", background: "#7fc8ff", boxShadow: "0 0 8px #7fc8ff" }} />
                  {/* Match strength, not a name — identities stay hidden until
                      both sides accept a chat. */}
                  <span style={{ flex: 1, minWidth: 0, textAlign: "left", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 12.5, lineHeight: 1, color: "#dceeff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {Math.round(matchPctFor(u))}% match
                  </span>
                  <span style={{ flex: "none", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>{fmtDist(u._dist)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
