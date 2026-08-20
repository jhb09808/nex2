import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import networkBg from "@/assets/network-bg.webp";

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

// Swap this to change the background on every desktop screen at once. A page
// can override it with the `background` / `scrim` props.
const DEFAULT_BG = networkBg;
const DEFAULT_SCRIM = "radial-gradient(52% 62% at 44% 52%, rgba(1,6,14,.86) 0%, rgba(1,6,14,.66) 54%, rgba(1,6,14,.34) 100%)";
const DEFAULT_BASE = "radial-gradient(80% 70% at 44% 52%, #08203f 0%, #04101f 46%, #01050c 100%)";

/**
 * The chrome every desktop screen shares: background, HUD frame and the nav
 * rail. Pages supply their own <main> as children.
 */
export default function DesktopShell({
  children,
  myProfile,
  navCounts = {},
  background = DEFAULT_BG,
  scrim = DEFAULT_SCRIM,
  base = DEFAULT_BASE,
}) {
  const location = useLocation();

  // Hides AppLayout's floating phone menu while a desktop shell is mounted.
  useEffect(() => {
    document.body.dataset.desktopShell = "1";
    return () => { delete document.body.dataset.desktopShell; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", overflow: "hidden", padding: 20, boxSizing: "border-box", background: base }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={background} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: scrim }} />
      </div>

      {/* HUD frame */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 20, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 20, left: 20, width: 30, height: 30, borderLeft: "2px solid rgba(125,205,255,.6)", borderTop: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 20, right: 20, width: 30, height: 30, borderRight: "2px solid rgba(125,205,255,.6)", borderTop: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 20, left: 20, width: 30, height: 30, borderLeft: "2px solid rgba(125,205,255,.6)", borderBottom: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 20, right: 20, width: 30, height: 30, borderRight: "2px solid rgba(125,205,255,.6)", borderBottom: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />

      {/* Nav rail */}
      <aside style={{ position: "relative", zIndex: 6, flex: "none", width: 258, height: "100%", display: "flex", flexDirection: "column", padding: "24px 0 10px", background: "rgba(4,14,30,.72)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(105,190,255,.16)" }}>
        <div style={{ padding: "0 18px" }}>
          <img src={LOGO_URL} alt="NEX2" style={{ display: "block", width: 110, height: 17.7, filter: "drop-shadow(0 0 10px rgba(90,180,255,.7))" }} />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
          {NAV.map((item) => {
            const count = navCounts[item.path];
            return (
              <Link key={item.path} to={item.path} className="nav-row" {...(location.pathname === item.path ? { "data-active": "" } : {})}>
                {item.icon}
                <span>{item.label}</span>
                {count > 0 && <span className="nav-count">{count}</span>}
              </Link>
            );
          })}
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

      {children}
    </div>
  );
}
