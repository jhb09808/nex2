import React from "react";
import { Link } from "react-router-dom";
import Chat from "@/pages/Chat";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import moment from "moment";

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
  return (
    <DesktopShell myProfile={myProfile}>
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
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
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
    </DesktopShell>
  );
}
