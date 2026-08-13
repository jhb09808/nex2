import React from "react";
import { MapPin, MessageCircle, Star } from "lucide-react";
import UserAvatar from "@/components/nex/UserAvatar";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";
import { getUserDisplayName } from "@/components/nex/userDisplay";

export default function RadarList({ users, onUserClick }) {
  if (users.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="notch" style={{ width: "100%", padding: "26px 18px", textAlign: "center", background: "rgba(8,24,48,.6)", border: "1px solid rgba(105,190,255,.16)" }}>
          <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, color: "#dceeff" }}>No one in range</div>
          <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: "#7fa9d4" }}>
            Widen your radius or turn off filters.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto scrollbar-hide"
      style={{ padding: "112px 16px calc(34px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 10 }}
    >
      {users.map((user) => {
        const name = getUserDisplayName(user);
        const dist = typeof user._dist === "number" && isFinite(user._dist) ? user._dist : null;
        const shared = user._shared || 0;
        const tags = (user.interests || []).slice(0, 3).map((i) => getSubInterestName(i) || i);

        return (
          <div
            key={user.id}
            role="button"
            tabIndex={0}
            onClick={() => onUserClick(user)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onUserClick(user); } }}
            className="card notch"
            style={{ flex: "none", cursor: "pointer" }}
          >
            <div style={{ position: "relative", flex: "none", width: 50, height: 50 }}>
              <UserAvatar
                name={name}
                size="md"
                isOnline={user.is_online}
                plan={user.plan}
                interests={user.interests}
                gender={user.gender}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 16, lineHeight: 1, letterSpacing: "0.02em", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 7 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>
                  <MapPin style={{ width: 12, height: 12 }} />
                  {dist != null ? `${dist.toFixed(1)} mi` : "nearby"}
                </span>
                {shared > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11, lineHeight: 1, letterSpacing: "0.06em", color: "#8fd0ff" }}>
                    <Star style={{ width: 12, height: 12 }} />
                    {shared} shared
                  </span>
                )}
              </div>

              {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
                  {tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <button
              aria-label={`Message ${name}`}
              onClick={(e) => { e.stopPropagation(); onUserClick(user); }}
              style={{ flex: "none", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(120,190,255,.24)", borderRadius: "50%", background: "transparent", cursor: "pointer", color: "#bfe2ff" }}
            >
              <MessageCircle style={{ width: 17, height: 17 }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
