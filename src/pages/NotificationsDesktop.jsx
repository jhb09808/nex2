import React, { useState } from "react";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import moment from "moment";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";

const BELL = (
  <svg width="24" height="25" viewBox="0 0 17 18" fill="none" aria-hidden="true">
    <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="#8fd0ff" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="#8fd0ff" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ICON_REQUEST = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="7.2" cy="6" r="3.4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1.4 16c0-3.2 2.6-5 5.8-5 1.2 0 2.3.3 3.2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13.6 10.4v5.2M11 13h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ICON_ACCEPTED = (
  <svg width="17" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <path d="M1.4 7.4l4.6 4.6L16.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ICON_MESSAGE = (
  <svg width="17" height="16" viewBox="0 0 18 17" fill="none" aria-hidden="true">
    <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
const ICON_MATCH = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="2.4" fill="currentColor" />
    <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ICON_RANK = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M5 1.6h8v4.2a4 4 0 0 1-8 0V1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5 2.8H2.4v1.4A2.6 2.6 0 0 0 5 6.8M13 2.8h2.6v1.4A2.6 2.6 0 0 1 13 6.8M9 9.8v3.4M5.8 16.4h6.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// Maps the app's Notification.type values onto the design's tone + tab.
const KIND = {
  request: { tab: "Requests", tone: "#a98cff", icon: ICON_REQUEST },
  accepted: { tab: "Requests", tone: "#4dffb0", icon: ICON_ACCEPTED },
  message: { tab: "Messages", tone: "#7fc8ff", icon: ICON_MESSAGE },
  nearby: { tab: "Activity", tone: "#ffb454", icon: ICON_MATCH },
  match: { tab: "Activity", tone: "#ffb454", icon: ICON_MATCH },
  event: { tab: "Activity", tone: "#ffc46b", icon: ICON_RANK },
  system: { tab: "Activity", tone: "#ffc46b", icon: ICON_RANK },
};
const kindOf = (n) => KIND[n.type] || KIND.system;

const TABS = ["All", "Requests", "Messages", "Activity"];

export default function NotificationsDesktop({
  notifications,
  markAsRead,
  markAllRead,
  waves,
  waveProfiles,
  onAcceptWave,
  onDeclineWave,
  actionLoading,
  myProfile,
}) {
  const [tab, setTab] = useState("All");

  const unread = notifications.filter((n) => !n.is_read).length;
  const inTab = (n) => tab === "All" || kindOf(n).tab === tab;
  const rows = notifications.filter(inTab);
  const unreadIn = (t) =>
    notifications.filter((n) => !n.is_read && (t === "All" || kindOf(n).tab === t)).length;

  return (
    <DesktopShell myProfile={myProfile} navCounts={{ "/notifications": unread }}>
      <main style={{ position: "relative", zIndex: 5, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "26px 30px 24px" }}>
        <header style={{ flex: "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 }}>
            <div style={{ position: "relative", flex: "none", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(105,190,255,.4)", background: "rgba(16,44,86,.6)", boxShadow: "0 0 20px rgba(60,150,255,.22)", clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)" }}>
              {BELL}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,.5)" }}>Alerts</h1>
              <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.4, color: "#7fa9d4" }}>
                {unread > 0 ? `${unread} unread of ${notifications.length}` : `${notifications.length} alert${notifications.length === 1 ? "" : "s"} · all caught up`}
              </div>
            </div>
          </div>

          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="dk-ghost-btn"
              style={{ flex: "none", clipPath: NOTCH_SM }}
            >
              <svg width="15" height="12" viewBox="0 0 16 13" fill="none" aria-hidden="true">
                <path d="M1 7l4.4 4.4L15 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mark all read
            </button>
          )}
        </header>

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 26, marginTop: 22 }}>
          {/* Alert feed */}
          <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="seg-dk-wrap" style={{ flex: "none", alignSelf: "flex-start" }}>
              {TABS.map((t) => {
                const pip = unreadIn(t);
                return (
                  <button key={t} onClick={() => setTab(t)} {...(tab === t ? { "data-on": "" } : {})}>
                    {t}
                    {pip > 0 && <span className="pip">{pip}</span>}
                  </button>
                );
              })}
            </div>

            {rows.length > 0 ? (
              <div className="scrollbar-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {rows.map((n) => {
                  const k = kindOf(n);
                  return (
                    <button
                      key={n.id}
                      className="alert-row"
                      style={{ clipPath: NOTCH }}
                      {...(!n.is_read ? { "data-unread": "" } : {})}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                    >
                      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 13, bottom: 13, width: 2, background: n.is_read ? "transparent" : k.tone }} />
                      <span style={{ flex: "none", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${k.tone}55`, background: `${k.tone}1f`, borderRadius: "50%", color: k.tone }}>
                        {k.icon}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="a-title" style={{ display: "block" }}>{n.title}</span>
                        {n.body && <span className="a-body" style={{ display: "block" }}>{n.body}</span>}
                      </span>
                      <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, color: k.tone, opacity: 0.9 }}>{k.icon}</span>
                        <span className="a-time">{moment(n.created_date).fromNow(true)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#5f89b2" }}>
                <svg width="42" height="44" viewBox="0 0 17 18" fill="none" aria-hidden="true" style={{ opacity: 0.5 }}>
                  <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12.5, lineHeight: 1.6, letterSpacing: "0.08em" }}>Nothing here yet</span>
              </div>
            )}
          </section>

          {/* Connection requests */}
          <section style={{ flex: "none", width: 400, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, height: 46 }}>
              <span className="col-head">Connection requests</span>
              <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#5f89b2" }}>
                {waves.length ? `${waves.length} pending` : "None pending"}
              </span>
            </div>

            <div className="scrollbar-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {waves.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "40px 0", color: "#5f89b2", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, lineHeight: 1.6, letterSpacing: "0.08em" }}>
                  No pending requests
                </div>
              ) : (
                waves.map((w) => {
                  const who = waveProfiles[w.sender_id];
                  const name = getUserDisplayName(who);
                  const busy = actionLoading?.[w.id];
                  return (
                    <div key={w.id} className="req-card" style={{ clipPath: NOTCH, animation: "nxrise .32s cubic-bezier(.16,1,.3,1)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                        <div style={{ flex: "none", width: 48, height: 48, border: "2px solid rgba(255,255,255,.2)", borderRadius: "50%", overflow: "hidden", boxSizing: "border-box" }}>
                          <GenerativeAvatar seed={name || "unknown"} gender={who?.gender} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 15, lineHeight: 1, color: "#eaf6ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                          <div style={{ marginTop: 7, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#8fd0ff" }}>Wants to connect</div>
                        </div>
                        <span className="a-time">{moment(w.created_date).fromNow(true)}</span>
                      </div>
                      <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                        <button className="btn-accept" style={{ clipPath: NOTCH_SM }} disabled={!!busy} onClick={() => onAcceptWave(w.id)}>
                          {busy === "accepting" ? "Accepting" : "Accept"}
                        </button>
                        <button className="btn-decline" style={{ clipPath: NOTCH_SM }} disabled={!!busy} onClick={() => onDeclineWave(w.id)}>
                          {busy === "declining" ? "Declining" : "Decline"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </DesktopShell>
  );
}
