import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Diamond } from "lucide-react";
import { base44 } from "@/api/base44Client";

const S = { fill: "none", "aria-hidden": "true" };

const ICONS = {
  radar: (
    <svg width="17" height="17" viewBox="0 0 20 20" {...S}>
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.4" fill="currentColor" />
      <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  discover: (
    <svg width="17" height="17" viewBox="0 0 20 20" {...S}>
      <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13.4 6.6l-2 4.8-4.8 2 2-4.8 4.8-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  messages: (
    <svg width="17" height="16" viewBox="0 0 18 17" {...S}>
      <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  alerts: (
    <svg width="16" height="17" viewBox="0 0 17 18" {...S}>
      <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  profile: (
    <svg width="16" height="17" viewBox="0 0 17 18" {...S}>
      <circle cx="8.5" cy="5.4" r="3.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.6 16.6c0-3.4 3.1-5.4 6.9-5.4s6.9 2 6.9 5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  leaderboard: (
    <svg width="17" height="17" viewBox="0 0 18 18" {...S}>
      <path d="M5 1.6h8v4.2a4 4 0 0 1-8 0V1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 2.8H2.4v1.4A2.6 2.6 0 0 0 5 6.8M13 2.8h2.6v1.4A2.6 2.6 0 0 1 13 6.8M9 9.8v3.4M5.8 16.4h6.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 18 18" {...S}>
      <circle cx="9" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 1.2v1.9M9 14.9v1.9M16.8 9h-1.9M3.1 9H1.2M14.5 3.5l-1.3 1.3M4.8 13.2l-1.3 1.3M14.5 14.5l-1.3-1.3M4.8 4.8L3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  signout: (
    <svg width="17" height="16" viewBox="0 0 18 17" {...S}>
      <path d="M11.4 1.6H2.6v13.8h8.8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12.4 5.4l3.2 3.1-3.2 3.1M15.4 8.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const baseNavItems = [
  { path: "/map", icon: ICONS.radar, label: "Radar" },
  { path: "/discover", icon: ICONS.discover, label: "Discover" },
  { path: "/messages", icon: ICONS.messages, label: "Messages" },
  { path: "/notifications", icon: ICONS.alerts, label: "Alerts" },
  { path: "/profile", icon: ICONS.profile, label: "Profile" },
  { path: "/leaderboard", icon: ICONS.leaderboard, label: "Leaderboard" },
  { path: "/settings", icon: ICONS.settings, label: "Settings" },
];

const TOP = "calc(14px + env(safe-area-inset-top, 0px))";

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [isPlatinum, setIsPlatinum] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    checkPlan();
    const handleCount = (e) => setUnreadCount(e.detail || 0);
    window.addEventListener("nex-unread-count", handleCount);
    return () => window.removeEventListener("nex-unread-count", handleCount);
  }, []);

  const checkPlan = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0 && profiles[0].plan === "platinum") {
        setIsPlatinum(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = isPlatinum
    ? [
        ...baseNavItems.slice(0, 2),
        { path: "/platinum-lounge", icon: <Diamond className="w-[17px] h-[17px]" strokeWidth={1.4} />, label: "Platinum Lounge" },
        ...baseNavItems.slice(2),
      ]
    : baseNavItems;

  return (
    <div className="nav-menu">
      {/* Hamburger / close — the design swaps the glyph in place. */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        className="circ"
        style={{
          position: "fixed",
          top: TOP,
          right: 16,
          zIndex: 62,
          flexDirection: "column",
          gap: 4,
          background: open ? "rgba(10,30,60,.9)" : "rgba(8,26,54,.66)",
          borderColor: open ? "rgba(105,190,255,.4)" : "rgba(105,190,255,.28)",
        }}
      >
        {open ? (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            <span style={{ width: 15, height: 1.5, background: "#bfe2ff" }} />
            <span style={{ width: 15, height: 1.5, background: "#bfe2ff" }} />
            <span style={{ width: 15, height: 1.5, background: "#bfe2ff" }} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div style={{ position: "fixed", inset: 0, zIndex: 61 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(1,6,14,.62)", backdropFilter: "blur(3px)" }}
            />

            <nav
              className="notch-lg"
              style={{
                position: "absolute",
                top: "calc(70px + env(safe-area-inset-top, 0px))",
                right: 16,
                width: 224,
                padding: "7px 0",
                background: "linear-gradient(180deg, rgba(10,30,60,.96), rgba(6,18,38,.97))",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(105,190,255,.34)",
                boxShadow: "0 18px 44px rgba(1,6,14,.7), 0 0 26px rgba(40,120,220,.16)",
                animation: "nxmenu .2s cubic-bezier(.16,1,.3,1)",
              }}
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="menu-row"
                    {...(isActive ? { "data-active": "" } : {})}
                  >
                    <span style={{ position: "relative", display: "flex", flex: "none" }}>
                      {item.icon}
                      {item.path === "/notifications" && unreadCount > 0 && (
                        <span style={{ position: "absolute", top: -6, right: -7, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: "#1b62d6", color: "#fff", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9, lineHeight: "16px", textAlign: "center" }}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="menu-sep" />

              <button
                onClick={() => {
                  setOpen(false);
                  base44.auth.logout("/welcome?logged_out=1");
                }}
                className="menu-row"
                style={{ width: "100%", border: 0, background: "transparent", cursor: "pointer", color: "#ff8080" }}
              >
                {ICONS.signout}
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
