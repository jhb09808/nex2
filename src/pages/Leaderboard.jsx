import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import boardBg from "@/assets/radar-map.webp";

// Rank colours cycle the sweep palette; #1 is always gold.
const PALETTE = ["#a98cff", "#4dffb0", "#7fc8ff", "#ff8fb0", "#ffc46b"];
const GOLD = "#ffc46b";

function hashStr(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  return Math.abs(h) || 1;
}

const colorFor = (id) => PALETTE[hashStr(id) % PALETTE.length];

const TROPHY = (
  <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M5 1.6h8v4.2a4 4 0 0 1-8 0V1.6z" stroke="#ffc46b" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5 2.8H2.4v1.4A2.6 2.6 0 0 0 5 6.8M13 2.8h2.6v1.4A2.6 2.6 0 0 1 13 6.8M9 9.8v3.4M5.8 16.4h6.4" stroke="#ffc46b" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const CROWN = (
  <svg width="20" height="14" viewBox="0 0 22 15" fill="none" aria-hidden="true">
    <path d="M1.4 3.4l3.4 3.8L11 1.6l6.2 5.6 3.4-3.8v9.2H1.4V3.4z" fill="#ffc46b" />
  </svg>
);

const STAR = (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M6 .8l1.3 3.3L10.6 5.4 7.3 6.7 6 10 4.7 6.7 1.4 5.4l3.3-1.3L6 .8z" fill="#8fd0ff" />
  </svg>
);

const CHEVRON = (
  <svg width="8" height="13" viewBox="0 0 9 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 1.4L7 7l-5.6 5.6" stroke="#5f89b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TREND = (
  <svg width="22" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1 14.5L8.5 7l4.5 4.5L22.5 2" stroke="#4dffb0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 1.6h6.2v6.2" stroke="#4dffb0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";

const LABEL = { fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" };

function Avatar({ name, ring, glow }) {
  return (
    <div style={{ width: "100%", height: "100%", border: `2px solid ${ring}`, borderRadius: "50%", overflow: "hidden", boxSizing: "border-box", boxShadow: `0 0 ${glow}px ${ring}` }}>
      <GenerativeAvatar seed={name || "unknown"} />
    </div>
  );
}

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await base44.functions.invoke("getNetworkLeaderboard", {});
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const leaderboard = data?.leaderboard || [];
  const myRank = data?.myRank || 1;
  const myCount = data?.myCount || 0;
  const totalUsers = data?.totalUsers || 0;
  const totalConnections = data?.totalConnections || 0;

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  // Second place stands left of the winner, third to the right.
  const podiumOrder = podium.length >= 3 ? [1, 0, 2] : podium.map((_, i) => i);
  const topScore = Math.max(1, ...podium.map((p) => p.connections || 0));

  return (
    <div className="relative overflow-hidden h-full flex flex-col" style={{ background: "radial-gradient(110% 34% at 50% 0%, #0a2545 0%, #04101f 42%, #01050c 100%)" }}>
      {/* City-lights background under its scrim */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={boardBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(3,12,26,.68) 0%, rgba(2,9,20,.92) 20%, rgba(1,6,14,.97) 42%, #01050c 66%)" }} />
      </div>

      {/* HUD frame */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 8, border: "1px solid rgba(86,180,255,.10)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", pointerEvents: "none", zIndex: 5 }} />

      {/* Header — paddingRight clears NavMenu's hamburger at right:16 */}
      <header style={{ position: "relative", flex: "none", zIndex: 3, display: "flex", alignItems: "flex-start", gap: 13, padding: "calc(14px + env(safe-area-inset-top, 0px)) 72px 0 16px" }}>
        <div style={{ flex: "none", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,190,90,.42)", background: "rgba(64,44,12,.55)", boxShadow: "0 0 20px rgba(255,180,84,.2)", clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}>
          {TROPHY}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 25, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 18px rgba(90,180,255,.5)" }}>Leaderboard</h1>
            <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", border: "1px solid rgba(77,255,176,.4)", background: "rgba(20,72,52,.5)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 8.5, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7de0b0" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
              Live
            </span>
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12, lineHeight: 1.4, color: "#7fa9d4" }}>
            {totalConnections} connections across {totalUsers} networkers
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ position: "relative", zIndex: 2, flex: 1, minHeight: 0, padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="shimmer" style={{ height: 84, clipPath: NOTCH_LG }} />
          <div className="shimmer" style={{ height: 210, clipPath: NOTCH_LG }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 62, clipPath: NOTCH }} />
          ))}
        </div>
      ) : (
        <>
          {/* Your rank */}
          <div style={{ position: "relative", flex: "none", zIndex: 2, display: "flex", alignItems: "center", gap: 16, margin: "16px 16px 0", padding: "14px 16px", clipPath: NOTCH_LG, background: "linear-gradient(120deg, rgba(20,54,104,.7), rgba(8,24,48,.6))", border: "1px solid rgba(105,190,255,.32)", boxShadow: "0 0 22px rgba(40,120,220,.16)" }}>
            <div style={{ flex: "none" }}>
              <div style={LABEL}>Your rank</div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em", color: "#7fc8ff", textShadow: "0 0 20px rgba(90,180,255,.6)" }}>#{myRank}</div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "rgba(105,190,255,.2)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 19, lineHeight: 1, color: "#eaf6ff" }}>{myCount}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.13em", textTransform: "uppercase", color: "#a6cbec" }}>connections</span>
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 11.5, lineHeight: 1.4, color: "#7fa9d4" }}>
                {myRank === 1 ? "You're #1 — defend your throne." : "Keep networking to climb the ranks"}
              </div>
            </div>
            {TREND}
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", opacity: 0.4 }}>{CROWN}</div>
                <div style={{ marginTop: 12, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, color: "#dceeff" }}>No one ranked yet</div>
                <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: "#7fa9d4" }}>Make a connection and you'll be the first.</div>
              </div>
            </div>
          ) : (
            <>
              {/* Podium */}
              {podium.length >= 3 && (
                <div style={{ position: "relative", flex: "none", zIndex: 2, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, margin: "18px 16px 0", padding: "16px 12px 0", clipPath: NOTCH_LG, background: "rgba(6,20,42,.5)", border: "1px solid rgba(105,190,255,.18)" }}>
                  {podiumOrder.map((idx) => {
                    const entry = podium[idx];
                    if (!entry) return null;
                    const isWinner = idx === 0;
                    const color = isWinner ? GOLD : colorFor(entry.user_id);
                    const size = isWinner ? 62 : 52;
                    const bar = Math.round(10 + ((entry.connections || 0) / topScore) * 84);
                    return (
                      <div key={entry.user_id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                        {isWinner ? CROWN : null}
                        <Link to={`/user/${entry.user_id}`} style={{ position: "relative", marginTop: 7, width: size, height: size, display: "block" }}>
                          <Avatar name={entry.username} ring={color} glow={isWinner ? 26 : 16} />
                          <span style={{ position: "absolute", right: -3, bottom: -3, width: 19, height: 19, borderRadius: "50%", border: "2px solid #061428", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 10, lineHeight: 1, color: "#03101f", background: color }}>
                            {idx + 1}
                          </span>
                        </Link>
                        <div style={{ marginTop: 10, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11.5, lineHeight: 1.2, letterSpacing: "0.02em", color: "#c3d8ee", textAlign: "center", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.username}
                        </div>
                        <div style={{ marginTop: 6, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 17, lineHeight: 1, color }}>{entry.connections}</div>
                        <div style={{ width: "100%", height: bar, marginTop: 9, transformOrigin: "bottom", animation: "nxgrow .5s cubic-bezier(.16,1,.3,1)", background: `linear-gradient(180deg, ${isWinner ? "rgba(255,196,107,.32)" : "rgba(120,190,255,.18)"}, rgba(6,20,42,0))`, borderTop: `2px solid ${color}` }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ranks 4 and below */}
              <div className="scrollbar-hide" style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 1, overflowY: "auto", marginTop: 14, padding: "0 16px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 7 }}>
                {rest.map((entry, i) => {
                  const rank = i + 4;
                  const isMe = rank === myRank;
                  return (
                    <Link
                      key={entry.user_id}
                      to={`/user/${entry.user_id}`}
                      className="rank-row"
                      style={{ clipPath: NOTCH }}
                      {...(isMe ? { "data-me": "" } : {})}
                    >
                      <span style={{ flex: "none", width: 20, textAlign: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 13, lineHeight: 1, color: "#7fa9d4" }}>{rank}</span>
                      <div style={{ flex: "none", width: 38, height: 38 }}>
                        <Avatar name={entry.username} ring="rgba(255,255,255,.2)" glow={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14.5, lineHeight: 1, letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.username}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, flexWrap: "nowrap" }}>
                          {STAR}
                          <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4", whiteSpace: "nowrap" }}>
                            {entry.connections} connection{entry.connections === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                      {CHEVRON}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
