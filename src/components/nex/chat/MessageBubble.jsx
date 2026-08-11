import React from "react";
import { motion } from "framer-motion";
import moment from "moment";
import UserAvatar from "@/components/nex/UserAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";

const CLIP = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

export default function MessageBubble({ message, isMe, otherUser, showAvatar }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "flex-end", gap: 9, justifyContent: isMe ? "flex-end" : "flex-start" }}
    >
      {!isMe && (
        <span style={{ flex: "none", width: 28 }}>
          {showAvatar && otherUser ? (
            <UserAvatar name={getUserDisplayName(otherUser)} size="xs" plan={otherUser.plan} interests={otherUser.interests} gender={otherUser.gender} />
          ) : null}
        </span>
      )}
      <div
        style={{
          maxWidth: "78%",
          padding: "13px 15px 10px",
          clipPath: CLIP,
          ...(isMe
            ? { background: "linear-gradient(160deg, #2a72e8, #1b4fc4)", boxShadow: "0 0 22px rgba(50,130,240,.3)" }
            : { background: "rgba(10,30,60,.72)", backdropFilter: "blur(10px)", border: "1px solid rgba(105,190,255,.22)" }),
        }}
      >
        <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 14.5, lineHeight: 1.5, color: isMe ? "#fff" : "#dceeff", wordBreak: "break-word" }}>
          {message.content}
        </p>
        <div style={{ marginTop: 8, textAlign: isMe ? "right" : "left", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, color: isMe ? "rgba(255,255,255,.62)" : "#7fa9d4" }}>
          {moment(message.created_date).format("h:mm A")}
          {isMe && message.is_read ? " ✓✓" : ""}
        </div>
      </div>
    </motion.div>
  );
}