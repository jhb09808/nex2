import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import NotificationsDesktop from "@/pages/NotificationsDesktop";
import PhoneShell from "@/components/nex/PhoneShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import { KIND, kindOf, TABS, CHECK } from "@/components/nex/alertKinds";
import useIsDesktop from "@/hooks/useIsDesktop";
import { useNavigate } from "react-router-dom";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waves, setWaves] = useState([]);
  const [waveProfiles, setWaveProfiles] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [myProfile, setMyProfile] = useState(null);
  const isDesktop = useIsDesktop(1200);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const me = await base44.auth.me();
      const notifs = await base44.entities.Notification.filter({ user_id: me.id }, "-created_date", 30);
      setNotifications(notifs);

      const mine = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (mine[0]) setMyProfile(mine[0]);

      // The desktop design puts pending connection requests beside the feed.
      const myWaves = await base44.entities.Wave.filter({ receiver_id: me.id }, "-created_date", 20);
      const pending = myWaves.filter((w) => w.status === "pending");
      setWaves(pending);
      const profileMap = {};
      for (const id of [...new Set(pending.map((w) => w.sender_id))].slice(0, 20)) {
        try {
          const p = await base44.entities.UserProfile.filter({ created_by_id: id });
          if (p.length > 0) profileMap[id] = p[0];
        } catch (e) { /* skip profiles we can't read */ }
      }
      setWaveProfiles(profileMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    window.dispatchEvent(new CustomEvent("nex-notifications-read"));
  };

  const markAllRead = () => notifications.forEach((n) => !n.is_read && markAsRead(n.id));

  const handleAcceptWave = async (waveId) => {
    setActionLoading((prev) => ({ ...prev, [waveId]: "accepting" }));
    try {
      const res = await base44.functions.invoke("acceptWave", { wave_id: waveId });
      setWaves((prev) => prev.filter((w) => w.id !== waveId));
      if (res.data?.conversation_id) navigate(`/chat/${res.data.conversation_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [waveId]: null }));
    }
  };

  const handleDeclineWave = async (waveId) => {
    setActionLoading((prev) => ({ ...prev, [waveId]: "declining" }));
    try {
      await base44.entities.Wave.update(waveId, { status: "declined" });
      setWaves((prev) => prev.filter((w) => w.id !== waveId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [waveId]: null }));
    }
  };

  if (isDesktop && !loading) {
    return (
      <NotificationsDesktop
        notifications={notifications}
        markAsRead={markAsRead}
        markAllRead={markAllRead}
        waves={waves}
        waveProfiles={waveProfiles}
        onAcceptWave={handleAcceptWave}
        onDeclineWave={handleDeclineWave}
        actionLoading={actionLoading}
        myProfile={myProfile}
      />
    );
  }

  if (loading) {
    return (
      <PhoneShell title="Alerts">
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </PhoneShell>
    );
  }

  // The design folds pending connection requests into the feed as actionable
  // rows, so waves and notifications become one list.
  const feed = [
    ...waves.map((w) => {
      const who = waveProfiles[w.sender_id];
      const name = getUserDisplayName(who);
      return {
        id: `wave-${w.id}`,
        waveId: w.id,
        kind: "request",
        title: `${name} wants to connect`,
        body: "Accept to open a chat with them",
        who: name,
        gender: who?.gender,
        unread: true,
        at: w.created_date,
      };
    }),
    ...notifications.map((n) => ({
      id: n.id,
      notifId: n.id,
      kind: KIND[n.type] ? n.type : "system",
      title: n.title,
      body: n.body,
      unread: !n.is_read,
      at: n.created_date,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  const inTab = (a) => tab === "All" || kindOf({ type: a.kind }).tab === tab;
  const unreadIn = (t) => feed.filter((a) => a.unread && (t === "All" || kindOf({ type: a.kind }).tab === t)).length;
  const rows = feed.filter(inTab);
  const totalUnread = unreadIn("All");
  const hasUnreadNotifs = notifications.some((n) => !n.is_read);

  const badge = totalUnread > 0 && (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 22, height: 22, padding: "0 6px", borderRadius: 999, background: "#2d7dff", boxShadow: "0 0 14px rgba(45,125,255,.6)", fontFamily: "var(--font-jetbrains)", fontWeight: 700, fontSize: 11, lineHeight: 1, color: "#fff" }}>
      {totalUnread}
    </span>
  );

  return (
    <PhoneShell title="Alerts" badge={badge}>
      <div style={{ position: "relative", flex: "none", zIndex: 3, padding: "0 16px" }}>
        <div className="tab-row" style={{ marginTop: 14 }}>
          {TABS.map((t) => {
            const pip = unreadIn(t);
            return (
              <button key={t} aria-pressed={tab === t} {...(tab === t ? { "data-on": "" } : {})} onClick={() => setTab(t)}>
                {t}
                {pip > 0 && <b>{pip}</b>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
          <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7fa9d4" }}>
            {rows.length} {rows.length === 1 ? "alert" : "alerts"}
          </span>
          {hasUnreadNotifs && (
            <button
              onClick={markAllRead}
              style={{ display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px", border: "1px solid rgba(105,190,255,.24)", background: "transparent", color: "#8fb9e2", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
            >
              {CHECK}
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div
        className="scrollbar-hide"
        style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 1, overflowY: "auto", marginTop: 14, padding: "0 16px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 9 }}
      >
        {rows.length === 0 ? (
          <div className="a-empty">
            <svg width="44" height="44" viewBox="0 0 17 18" fill="none" aria-hidden="true" style={{ opacity: 0.4 }}>
              <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="#5f89b2" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="#5f89b2" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 13, lineHeight: 1.5, letterSpacing: "0.06em", color: "#7fa9d4" }}>
              Nothing in {tab.toLowerCase()}
            </div>
          </div>
        ) : (
          rows.map((a) => {
            const k = kindOf({ type: a.kind });
            const busy = a.waveId ? actionLoading[a.waveId] : null;
            // A request row carries its own Accept/Decline buttons, so the row
            // itself stays a plain div rather than nesting buttons.
            const tappable = !!a.notifId && a.unread;
            return (
              <div
                key={a.id}
                className="alert-row"
                style={{ clipPath: NOTCH, cursor: tappable ? "pointer" : "default" }}
                {...(a.unread ? { "data-unread": "" } : {})}
                {...(tappable
                  ? {
                      role: "button",
                      tabIndex: 0,
                      onClick: () => markAsRead(a.notifId),
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); markAsRead(a.notifId); }
                      },
                    }
                  : {})}
              >
                <span className="a-rail" aria-hidden="true" style={{ background: a.unread ? k.tone : "transparent" }} />
                {a.who ? (
                  <span className="a-ico" style={{ border: "2px solid rgba(255,255,255,.2)", overflow: "hidden", boxSizing: "border-box" }}>
                    <GenerativeAvatar seed={a.who} gender={a.gender} />
                  </span>
                ) : (
                  <span className="a-ico" style={{ border: `1px solid ${k.tone}55`, background: `${k.tone}1f`, color: k.tone }}>
                    {k.icon}
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <span className="a-title">{a.title}</span>
                    <span className="a-time">{moment(a.at).fromNow(true)}</span>
                  </span>
                  {a.body && <span className="a-body" style={{ display: "block" }}>{a.body}</span>}
                  {a.waveId && (
                    <span className="a-acts">
                      <button
                        data-yes=""
                        disabled={!!busy}
                        onClick={(e) => { e.stopPropagation(); handleAcceptWave(a.waveId); }}
                      >
                        {busy === "accepting" ? "Accepting" : "Accept"}
                      </button>
                      <button
                        disabled={!!busy}
                        onClick={(e) => { e.stopPropagation(); handleDeclineWave(a.waveId); }}
                      >
                        {busy === "declining" ? "Declining" : "Decline"}
                      </button>
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </PhoneShell>
  );
}