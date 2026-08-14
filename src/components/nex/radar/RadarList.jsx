import React from "react";
import { EyeOff } from "lucide-react";
import UserAvatar from "@/components/nex/UserAvatar";
import VerifiedBadges from "@/components/nex/VerifiedBadges";
import { getSubInterestName, getCategoryForSubInterest } from "@/components/nex/radar/interestCategories";
import { getUserDisplayName } from "@/components/nex/userDisplay";

const PIN = (
  <svg width="9" height="11" viewBox="0 0 10 12" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M5 11.2S9 7.6 9 4.8A4 4 0 0 0 1 4.8C1 7.6 5 11.2 5 11.2z" stroke="#7fa9d4" strokeWidth="1.2" />
    <circle cx="5" cy="4.7" r="1.3" fill="#7fa9d4" />
  </svg>
);

const STAR = (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M6 .8l1.3 3.3L10.6 5.4 7.3 6.7 6 10 4.7 6.7 1.4 5.4l3.3-1.3L6 .8z" fill="#8fd0ff" />
  </svg>
);

const CHAT = (
  <svg width="17" height="16" viewBox="0 0 18 17" fill="none" aria-hidden="true">
    <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="#9fd8ff" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const META_DIST = { display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" };
const META_SHARED = { display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11, lineHeight: 1, letterSpacing: "0.06em", color: "#8fd0ff" };
const TAG_ON = { borderColor: "rgba(90,175,255,.7)", background: "rgba(45,115,215,.4)", color: "#eaf6ff" };

// Clears the absolutely-positioned segmented header above the list.
const HEADER_CLEARANCE = "calc(max(1rem, env(safe-area-inset-top, 0px)) + 44px)";

// This design notches at 14px; the global .notch is 13px for the other screens.
const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

export default function RadarList({ users, onUserClick, activeInterests = [], radiusMiles }) {
  const onlineCount = users.filter((u) => u.is_online).length;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ paddingTop: HEADER_CLEARANCE }}>
      {/* Count line */}
      <div style={{ position: "relative", flex: "none", zIndex: 2, display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 16px 10px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7fa9d4" }}>
          {users.length} {users.length === 1 ? "person" : "people"}
          {radiusMiles != null ? ` · within ${radiusMiles} mi` : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10.5, lineHeight: 1, letterSpacing: "0.1em", color: "#a6cbec" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dffb0", boxShadow: "0 0 8px #4dffb0" }} />
          {onlineCount} online
        </div>
      </div>

      <div
        className="scrollbar-hide"
        style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "0 16px calc(112px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}
      >
        {users.length === 0 ? (
          <div style={{ clipPath: NOTCH, padding: "26px 18px", textAlign: "center", background: "rgba(8,24,48,.6)", border: "1px solid rgba(105,190,255,.16)" }}>
            <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, color: "#dceeff" }}>No one in range</div>
            <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: "#7fa9d4" }}>Widen your radius or turn off filters.</div>
          </div>
        ) : (
          users.map((user) => {
            const name = getUserDisplayName(user);
            return (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                onClick={() => onUserClick(user)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onUserClick(user); } }}
                className="card"
                style={{ cursor: "pointer", clipPath: NOTCH }}
              >
                {user.visibility === "anonymous" ? (
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-5 h-5 text-white/40" />
                  </div>
                ) : (
                  <UserAvatar name={name} size="md" isOnline={user.is_online} plan={user.plan} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 16, lineHeight: 1, letterSpacing: "0.02em", color: "#dceeff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <VerifiedBadges isVerified={user.is_verified} isOg={user.is_og} size="sm" />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 7 }}>
                    {user._dist != null && (
                      <span style={META_DIST}>
                        {PIN}
                        {user._dist < 0.1 ? `${Math.round(user._dist * 5280)} ft` : `${user._dist.toFixed(1)} mi`}
                      </span>
                    )}
                    {user._shared > 0 && (
                      <span style={META_SHARED}>
                        {STAR}
                        {user._shared} shared
                      </span>
                    )}
                  </div>

                  {user.interests?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
                      {user.interests.slice(0, 5).map((interestId) => {
                        // Unknown ids would fall back to the raw slug — skip them.
                        if (!getCategoryForSubInterest(interestId)) return null;
                        const label = getSubInterestName(interestId);
                        return (
                          <span key={interestId} className="tag" style={activeInterests.includes(interestId) ? TAG_ON : undefined}>
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span style={{ flex: "none", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(120,190,255,.24)", borderRadius: "50%" }}>
                  {CHAT}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
