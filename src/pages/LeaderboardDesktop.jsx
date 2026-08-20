import React from "react";
import { Link } from "react-router-dom";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";

const PALETTE = ["#a98cff", "#4dffb0", "#7fc8ff", "#ff8fb0", "#ffc46b"];
const GOLD = "#ffc46b";

function hashStr(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  return Math.abs(h) || 1;
}
const colorFor = (id) => PALETTE[hashStr(id) % PALETTE.length];

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";

const TROPHY = (
  <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M5 1.6h8v4.2a4 4 0 0 1-8 0V1.6z" stroke="#ffc46b" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5 2.8H2.4v1.4A2.6 2.6 0 0 0 5 6.8M13 2.8h2.6v1.4A2.6 2.6 0 0 1 13 6.8M9 9.8v3.4M5.8 16.4h6.4" stroke="#ffc46b" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const CROWN = (
  <svg width="26" height="18" viewBox="0 0 22 15" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 3.4l3.4 3.8L11 1.6l6.2 5.6 3.4-3.8v9.2H1.4V3.4z" fill="#ffc46b" />
  </svg>
);

const STAR = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M6 .8l1.3 3.3L10.6 5.4 7.3 6.7 6 10 4.7 6.7 1.4 5.4l3.3-1.3L6 .8z" fill="#8fd0ff" />
  </svg>
);

const CHEVRON = (
  <svg width="8" height="13" viewBox="0 0 9 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 1.4L7 7l-5.6 5.6" stroke="#5f89b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Avatar({ name, ring, glow }) {
  return (
    <div style={{ width: "100%", height: "100%", border: `2px solid ${ring}`, borderRadius: "50%", overflow: "hidden", boxSizing: "border-box", boxShadow: `0 0 ${glow}px ${ring}` }}>
      <GenerativeAvatar seed={name || "unknown"} />
    </div>
  );
}

export default function LeaderboardDesktop({ data, myProfile }) {
  const leaderboard = data?.leaderboard || [];
  const myRank = data?.myRank || 1;
  const myCount = data?.myCount || 0;
  const totalUsers = data?.totalUsers || 0;
  const totalConnections = data?.totalConnections || 0;

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const podiumOrder = podium.length >= 3 ? [1, 0, 2] : podium.map((_, i) => i);
  const topScore = Math.max(1, ...podium.map((p) => p.connections || 0));

  return (
    <DesktopShell myProfile={myProfile}>
      <main style={{ position: "relative", zIndex: 5, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "26px 30px 24px" }}>
        <header style={{ flex: "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 }}>
            <div style={{ flex: "none", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,190,90,.42)", background: "rgba(64,44,12,.55)", boxShadow: "0 0 20px rgba(255,180,84,.2)", clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)" }}>
              {TROPHY}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,.5)" }}>Leaderboard</h1>
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", clipPath: NOTCH_SM, border: "1px solid rgba(77,255,176,.4)", background: "rgba(20,72,52,.5)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7de0b0" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0", animation: "nxglow 2s ease-in-out infinite" }} />
                  Live
                </span>
              </div>
              <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.4, color: "#7fa9d4" }}>
                {totalConnections} connections across {totalUsers} networkers
              </div>
            </div>
          </div>

          <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 18, padding: "12px 18px", clipPath: NOTCH, background: "linear-gradient(120deg, rgba(20,54,104,.7), rgba(8,24,48,.6))", border: "1px solid rgba(105,190,255,.32)", boxShadow: "0 0 22px rgba(40,120,220,.16)" }}>
            <div>
              <div className="col-head">Your rank</div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em", color: "#7fc8ff", textShadow: "0 0 20px rgba(90,180,255,.6)" }}>#{myRank}</div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "rgba(105,190,255,.2)" }} />
            <div>
              <div className="col-head">Connections</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 8 }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 24, lineHeight: 1, color: "#eaf6ff" }}>{myCount}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 11.5, lineHeight: 1.3, color: "#7fa9d4" }}>
                  {myRank === 1 ? "You're #1 — defend your throne." : "Keep networking to climb the ranks"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 26, marginTop: 24 }}>
          {/* Podium */}
          <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "22px 24px 0", clipPath: NOTCH_LG, background: "rgba(6,20,42,.5)", border: "1px solid rgba(105,190,255,.18)", animation: "nxrise .4s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ flex: "none", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
              <div className="col-head">Top three</div>
              <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, lineHeight: 1, letterSpacing: "0.04em", color: "#5f89b2" }}>Bars scale to connection count</div>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(14px, 2vw, 34px)", paddingTop: 20 }}>
              {podiumOrder.map((idx) => {
                const entry = podium[idx];
                if (!entry) return null;
                const isWinner = idx === 0;
                const color = isWinner ? GOLD : colorFor(entry.user_id);
                const size = isWinner ? 84 : 68;
                // Percentage height keeps the bars honest at any window size.
                const pct = (8 + ((entry.connections || 0) / topScore) * 58).toFixed(1);
                const isMe = idx + 1 === myRank;
                return (
                  <div key={entry.user_id} style={{ flex: 1, maxWidth: 150, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                    {isWinner ? CROWN : null}
                    <Link to={`/user/${entry.user_id}`} style={{ position: "relative", flex: "none", marginTop: 8, width: size, height: size, display: "block" }}>
                      <Avatar name={entry.username} ring={color} glow={isWinner ? 30 : 18} />
                      <span className="pod-rank" style={{ background: color }}>{idx + 1}</span>
                    </Link>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 7, marginTop: 12, maxWidth: "100%" }}>
                      <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 13, lineHeight: 1.2, letterSpacing: "0.02em", color: "#c3d8ee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.username}</span>
                      {isMe && (
                        <span style={{ flex: "none", padding: "3px 7px", clipPath: NOTCH_SM, background: "rgba(45,115,215,.4)", border: "1px solid rgba(120,200,255,.5)", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 8.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bfe2ff" }}>You</span>
                      )}
                    </div>
                    <div style={{ flex: "none", marginTop: 7, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 22, lineHeight: 1, color }}>{entry.connections}</div>
                    <div style={{ flex: "none", width: "100%", height: `${pct}%`, marginTop: 11, transformOrigin: "bottom", animation: "nxgrow .55s cubic-bezier(.16,1,.3,1)", background: `linear-gradient(180deg, ${isWinner ? "rgba(255,196,107,.34)" : "rgba(120,190,255,.2)"}, rgba(6,20,42,0))`, borderTop: `2px solid ${color}` }} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Table */}
          <section style={{ flex: "none", width: 470, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 14px 12px" }}>
              <span className="col-head" style={{ width: 26, textAlign: "center" }}>#</span>
              <span style={{ flex: "none", width: 42 }} aria-hidden="true" />
              <span className="col-head" style={{ flex: 1 }}>Member</span>
              <span className="col-head">Connections</span>
              <span style={{ flex: "none", width: 8 }} aria-hidden="true" />
            </div>

            <div className="scrollbar-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {rest.map((entry, i) => {
                const rank = i + 4;
                const isMe = rank === myRank;
                return (
                  <Link
                    key={entry.user_id}
                    to={`/user/${entry.user_id}`}
                    className="rank-row rank-row-dk"
                    style={{ clipPath: NOTCH }}
                    {...(isMe ? { "data-me": "" } : {})}
                  >
                    <span className="r-num-dk">{rank}</span>
                    <div style={{ flex: "none", width: 42, height: 42 }}>
                      <Avatar name={entry.username} ring="rgba(255,255,255,.2)" glow={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="r-name-dk">{entry.username}</div>
                    </div>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 7 }}>
                      {STAR}
                      <span className="r-conn-dk">{entry.connections}</span>
                    </div>
                    {CHEVRON}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </DesktopShell>
  );
}
