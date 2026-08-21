import React, { useState } from "react";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import moment from "moment";
import { BELL, kindOf, TABS, EMPTY_BELL, CHECK } from "@/components/nex/alertKinds";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";

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
              {CHECK}
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
                {EMPTY_BELL}
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
