import React from "react";
import UserAvatar from "@/components/nex/UserAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import moment from "moment";

const CLIP = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

export default function ThreadRow({ convo, other, unread, onClick }) {
  const name = getUserDisplayName(other);
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        flex: "none",
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "13px 13px 13px 16px",
        textAlign: "left",
        background: unread ? "rgba(14,40,78,.66)" : "rgba(8,24,48,.55)",
        border: `1px solid ${unread ? "rgba(105,190,255,.3)" : "rgba(105,190,255,.14)"}`,
        clipPath: CLIP,
      }}
    >
      <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 2, background: unread ? "#2D7DFF" : "transparent" }} />
      <span style={{ position: "relative", flex: "none" }}>
        <UserAvatar name={name} size="md" isOnline={other?.is_online} plan={other?.plan} interests={other?.interests} isVerified={other?.is_verified} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 15.5, letterSpacing: "0.02em", color: unread ? "#eaf6ff" : "#c3d8ee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </span>
          <span style={{ flex: "none", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, color: "#7fa9d4" }}>
            {convo.last_message_at ? moment(convo.last_message_at).fromNow() : ""}
          </span>
        </span>
        <span style={{ display: "block", marginTop: 7, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.45, color: unread ? "#a6cbec" : "#7fa9d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {convo.connection_made ? "🤝 " : ""}
          {convo.last_message || "Start a conversation"}
        </span>
      </span>
    </button>
  );
}