import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Chat from "@/pages/Chat";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import moment from "moment";
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

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";

// The thread list shows a label rather than a raw media URL.
function preview(convo) {
  const text = convo.last_message;
  if (!text) return "Start a conversation";
  if (/^https?:\/\/\S+$/.test(text)) {
    return /\.(png|jpe?g|gif|webp|heic|avif)(\?|$)/i.test(text) ? "Photo" : "Voice message";
  }
  return text;
}

export default function MessagesDesktop({
  conversations,
  getOtherParticipant,
  isUnread,
  search,
  setSearch,
  myProfile,
  openId,
  setOpenId,
  unreadCount,
}) {
  const location = useLocation();

  // Hides AppLayout's floating phone menu while this shell — which has its own
  // nav rail — is mounted.
  useEffect(() => {
    document.body.dataset.desktopShell = "1";
    return () => { delete document.body.dataset.desktopShell; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", overflow: "hidden", padding: 20, boxSizing: "border-box", background: "radial-gradient(80% 70% at 44% 52%, #08203f 0%, #04101f 46%, #01050c 100%)" }}>
      {/* Background */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={radarBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(52% 62% at 44% 52%, rgba(1,6,14,.94) 0%, rgba(1,6,14,.78) 54%, rgba(1,6,14,.46) 100%)" }} />
      </div>

      {/* HUD frame */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 20, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 20, left: 20, width: 30, height: 30, borderLeft: "2px solid rgba(125,205,255,.6)", borderTop: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 20, right: 20, width: 30, height: 30, borderRight: "2px solid rgba(125,205,255,.6)", borderTop: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 20, left: 20, width: 30, height: 30, borderLeft: "2px solid rgba(125,205,255,.6)", borderBottom: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 20, right: 20, width: 30, height: 30, borderRight: "2px solid rgba(125,205,255,.6)", borderBottom: "2px solid rgba(125,205,255,.6)", pointerEvents: "none", zIndex: 8 }} />

      {/* Rail */}
      <aside style={{ position: "relative", zIndex: 6, flex: "none", width: 258, height: "100%", display: "flex", flexDirection: "column", padding: "24px 0 10px", background: "rgba(4,14,30,.72)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(105,190,255,.16)" }}>
        <div style={{ padding: "0 18px" }}>
          <img src={LOGO_URL} alt="NEX2" style={{ display: "block", width: 110, height: 17.7, filter: "drop-shadow(0 0 10px rgba(90,180,255,.7))" }} />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
          {NAV.map((item) => (
            <Link key={item.path} to={item.path} className="nav-row" {...(location.pathname === item.path ? { "data-active": "" } : {})}>
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
        {/* Inbox */}
        <div style={{ flex: "none", width: 380, display: "flex", flexDirection: "column", padding: "24px 0 10px", borderRight: "1px solid rgba(105,190,255,.16)", background: "rgba(4,14,30,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "0 22px" }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 25, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 18px rgba(90,180,255,.5)" }}>Messages</h1>
            {unreadCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10.5, lineHeight: 1, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a6cbec" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
                {unreadCount} new
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "16px 22px 0", height: 48, padding: "0 14px", clipPath: NOTCH, background: "rgba(8,26,54,.7)", border: "1px solid rgba(105,190,255,.28)" }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flex: "none" }}>
              <circle cx="7.8" cy="7.8" r="6" stroke="#6fb8ff" strokeWidth="1.4" />
              <path d="M12.2 12.2l4 4" stroke="#6fb8ff" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 14.5 }}
            />
          </div>

          <div className="scrollbar-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 22px 20px", display: "flex", flexDirection: "column", gap: 9 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: "26px 4px", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.6, color: "#7fa9d4" }}>
                {search.trim() ? `No matches for “${search.trim()}”` : "No conversations yet. Find someone on the radar."}
              </div>
            ) : (
              conversations.map((convo) => {
                const other = getOtherParticipant(convo);
                const name = getUserDisplayName(other);
                const isOpen = openId === convo.id;
                const unread = isUnread?.(convo);
                return (
                  <button
                    key={convo.id}
                    className="thread-row"
                    style={{
                      clipPath: NOTCH,
                      ...(unread && !isOpen
                        ? { background: "rgba(14,40,78,.66)", borderColor: "rgba(105,190,255,.3)" }
                        : {}),
                    }}
                    {...(isOpen ? { "data-open": "" } : {})}
                    onClick={() => setOpenId(convo.id)}
                  >
                    <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 2, background: unread ? "#2D7DFF" : "transparent" }} />
                    <span style={{ position: "relative", flex: "none", width: 46, height: 46, display: "block" }}>
                      <span style={{ display: "block", width: "100%", height: "100%", border: "2px solid rgba(255,255,255,.2)", borderRadius: "50%", overflow: "hidden" }}>
                        <GenerativeAvatar seed={name || "unknown"} gender={other?.gender} />
                      </span>
                      <span style={{ position: "absolute", right: 0, bottom: 0, width: 11, height: 11, borderRadius: "50%", background: other?.is_online ? "#60a5fa" : "#4a6785", boxShadow: other?.is_online ? "0 0 8px rgba(96,165,250,.8)" : "none", border: "2px solid #050810" }} />
                    </span>

                    <span style={{ flex: 1, minWidth: 0, display: "block" }}>
                      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 15.5, lineHeight: 1, letterSpacing: "0.02em", color: unread ? "#eaf6ff" : "#c3d8ee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                        <span style={{ flex: "none", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, color: "#7fa9d4" }}>
                          {convo.last_message_at ? moment(convo.last_message_at).fromNow() : ""}
                        </span>
                      </span>
                      <span style={{ display: "block", marginTop: 7, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.45, color: unread ? "#a6cbec" : "#7fa9d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {preview(convo)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {openId ? (
            <Chat key={openId} conversationId={openId} embedded />
          ) : (
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ position: "relative", width: 104, height: 104, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(105,190,255,.3)" }} />
                <div style={{ position: "absolute", inset: 26, borderRadius: "50%", border: "1px solid rgba(105,190,255,.18)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg, rgba(130,210,255,.24), rgba(130,210,255,0) 54%)", animation: "nxsweep 5s linear infinite" }} />
                </div>
                <svg width="26" height="24" viewBox="0 0 18 17" fill="none" aria-hidden="true" style={{ position: "relative" }}>
                  <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="#7fa9d4" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ marginTop: 24, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7fa9d4" }}>No conversation open</div>
              <p style={{ margin: "14px 0 0", maxWidth: 340, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.6, color: "#a6cbec" }}>
                Pick a conversation on the left, or find someone new on the radar.
              </p>

              <Link
                to="/map"
                style={{ display: "flex", alignItems: "center", gap: 10, height: 48, marginTop: 24, padding: "0 22px", clipPath: NOTCH_SM, border: "1px solid rgba(120,190,255,.32)", background: "rgba(10,30,60,.5)", color: "#bcd9f5", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase" }}
              >
                <svg width="17" height="17" viewBox="0 0 20 20" {...S}>
                  <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="10" cy="10" r="2.4" fill="currentColor" />
                  <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Open radar
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
