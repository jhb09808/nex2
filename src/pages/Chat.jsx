import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Image, Shield, Snowflake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import IcebreakerModal from "@/components/nex/IcebreakerModal";
import BlockReportSheet from "@/components/nex/safety/BlockReportSheet";
import NotificationListener from "@/components/nex/NotificationListener";
import MessageCounter from "@/components/nex/chat/MessageCounter";
import PostChatPanel from "@/components/nex/chat/PostChatPanel";
import ContactExchangeSheet from "@/components/nex/chat/ContactExchangeSheet";
import MessageBubble from "@/components/nex/chat/MessageBubble";
import VoiceRecorderButton from "@/components/nex/chat/VoiceRecorderButton";
import moment from "moment";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import { generateMockProfiles } from "@/components/nex/mapMockProfiles";

const MAX_MESSAGES = 20;

const ICON_BTN = {
  flex: "none",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(105,190,255,.26)",
  borderRadius: "50%",
  background: "rgba(8,26,54,.66)",
  cursor: "pointer",
};

const dayLabel = (d) => {
  const m = moment(d);
  if (m.isSame(moment(), "day")) return "Today";
  if (m.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  return m.format("MMM D, YYYY");
};

const distanceMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const chatUser = location.state?.chatUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [me, setMe] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [sending, setSending] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [showIcebreaker, setShowIcebreaker] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [showContactExchange, setShowContactExchange] = useState(false);
  const messagesEnd = useRef(null);
  const fileInputRef = useRef(null);
  const [mediaError, setMediaError] = useState("");

  const limitReached = sentCount >= MAX_MESSAGES;
  const conversationEnded = conversation?.ended_by != null;
  const isMyEnded = conversation?.ended_by === me?.id;

  useEffect(() => {
    loadChat();
  }, [conversationId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => setNewMessage(e.detail);
    window.addEventListener("wingman-icebreaker", handler);
    return () => window.removeEventListener("wingman-icebreaker", handler);
  }, []);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        if (event.type === "create") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === event.data.id)) return prev;
            return [...prev, event.data];
          });
        }
      }
    });
    return unsub;
  }, [conversationId]);

  // Real-time conversation subscription (contact exchange, ended, connection made)
  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.entities.Conversation.subscribe((event) => {
      if (event.data?.id === conversationId && event.type === "update") {
        setConversation(event.data);
        // Auto-open contact exchange sheet when a request comes in
        if (
          event.data.contact_exchange_status === "pending" &&
          event.data.contact_exchange_requested_by !== me?.id
        ) {
          setShowContactExchange(true);
        }
      }
    });
    return unsub;
  }, [conversationId, me]);

  // Proximity check for "Connection Made" — fires every 15s
  useEffect(() => {
    if (!myProfile || !otherUser || !conversation || conversation.connection_made) return;

    const checkProximity = async () => {
      if (
        myProfile.latitude == null ||
        myProfile.longitude == null ||
        otherUser.latitude == null ||
        otherUser.longitude == null
      )
        return;

      const dist = distanceMiles(
        myProfile.latitude,
        myProfile.longitude,
        otherUser.latitude,
        otherUser.longitude
      );
      // ~50 feet threshold
      if (dist <= 50 / 5280) {
        try {
          await base44.entities.Conversation.update(conversationId, {
            connection_made: true,
            connection_made_at: new Date().toISOString(),
          });
          setConversation((prev) => ({
            ...prev,
            connection_made: true,
            connection_made_at: new Date().toISOString(),
          }));
        } catch (e) {
          console.error(e);
        }
      }
    };

    checkProximity();
    const interval = setInterval(checkProximity, 15000);
    return () => clearInterval(interval);
  }, [myProfile, otherUser, conversation, conversationId]);

  const loadChat = async () => {
    try {
      const user = await base44.auth.me();
      setMe(user);
      const myProfiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      if (myProfiles[0]) setMyProfile(myProfiles[0]);
      const convo = await base44.entities.Conversation.get(conversationId);
      setConversation(convo);
      const otherId = convo.participants?.find((id) => id !== user.id);
      const msgs = await base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100);
      setMessages(msgs);

      // Count my sent messages (excluding system messages)
      const mySentCount = msgs.filter(
        (m) => m.sender_id === user.id && m.type !== "system"
      ).length;
      setSentCount(mySentCount);

      // Auto-open icebreaker for new conversations with no messages yet
      if (msgs.length === 0) {
        setShowIcebreaker(true);
      }

      if (otherId) {
        const profiles = await base44.entities.UserProfile.filter({ created_by_id: otherId });
        if (profiles.length > 0) setOtherUser(profiles[0]);
      }
      // Fallback to user info passed from the approval flow (e.g. mock profiles)
      if (!otherUser) {
        if (chatUser) {
          setOtherUser(chatUser);
        } else if (otherId && String(otherId).startsWith("bot-")) {
          const mockBots = generateMockProfiles({ lat: 0, lng: 0 });
          const bot = mockBots.find((b) => b.id === otherId);
          if (bot) setOtherUser(bot);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBotChat = () => {
    const botId = otherUser?.id || chatUser?.id;
    return botId && String(botId).startsWith("bot-");
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || limitReached) return;
    setSending(true);
    const msgText = newMessage.trim();
    try {
      const res = await base44.functions.invoke("sendMessage", {
        conversation_id: conversationId,
        content: msgText,
      });
      const data = res.data;
      if (data?.sent_count != null) {
        setSentCount(data.sent_count);
      }
      setNewMessage("");

      // If chatting with a bot, generate an AI reply
      if (isBotChat() && !data?.limit_reached) {
        const botId = otherUser?.id || chatUser?.id;
        const botProfile = otherUser || chatUser;
        try {
          const botRes = await base44.functions.invoke("generateBotReply", {
            conversation_id: conversationId,
            bot_user_id: botId,
            bot_profile: botProfile,
            recent_messages: [...messages, { sender_id: me.id, content: msgText }],
          });
          if (botRes.data?.reply && !botRes.data?.reply?.error) {
            // Real-time subscription should pick it up; this is a fallback
            const botMsg = {
              id: `bot-reply-${Date.now()}`,
              conversation_id: conversationId,
              sender_id: botId,
              content: botRes.data.reply,
              type: "text",
              created_date: new Date().toISOString(),
            };
            setMessages((prev) => {
              if (prev.some((m) => m.content === botMsg.content && m.sender_id === botId)) return prev;
              return [...prev, botMsg];
            });
          }
        } catch (botErr) {
          console.error("Bot reply failed:", botErr);
        }
      }
    } catch (err) {
      const errorData = err?.response?.data;
      if (errorData?.limit_reached) {
        setSentCount(MAX_MESSAGES);
      }
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const sendMedia = async (file, type) => {
    if (!file || sending || limitReached) return;
    setMediaError("");
    if (type === "image" && file.size > 8 * 1024 * 1024) {
      setMediaError("Images need to be under 8MB.");
      return;
    }
    setSending(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("sendMessage", {
        conversation_id: conversationId,
        media_url: file_url,
        type,
        content: type === "voice" ? "Voice message" : "Photo",
      });
      if (res.data?.sent_count != null) setSentCount(res.data.sent_count);
    } catch (err) {
      console.error(err);
      setMediaError(type === "voice" ? "Couldn't send that recording." : "Couldn't send that photo.");
    } finally {
      setSending(false);
    }
  };

  const handleEndConnection = async () => {
    try {
      await base44.functions.invoke("endConversation", { conversation_id: conversationId });
      navigate("/messages");
    } catch (err) {
      console.error(err);
    }
  };

  const showPostChatPanel = limitReached || conversationEnded;

  return (
    <div
      className="flex flex-col"
      style={{ position: "fixed", inset: 0, height: "100dvh", minHeight: 0, background: "radial-gradient(110% 30% at 50% 0%, #0a2545 0%, #04101f 40%, #01050c 100%)" }}
    >
      <NotificationListener />
      {/* Header */}
      <div
        className="flex-none"
        style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 11, paddingTop: "max(16px, env(safe-area-inset-top, 0px))", paddingLeft: 20, paddingRight: 20, paddingBottom: 12, borderBottom: "1px solid rgba(105,190,255,.16)" }}
      >
        <button onClick={() => navigate("/messages")} style={ICON_BTN} aria-label="Back">
          <ArrowLeft className="w-4 h-4" style={{ color: "#bfe2ff" }} />
        </button>
        <UserAvatar name={getUserDisplayName(otherUser)} size="sm" isOnline={otherUser?.is_online} plan={otherUser?.plan} interests={otherUser?.interests} gender={otherUser?.gender} />
        <div className="flex-1 min-w-0">
          <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 16, lineHeight: 1, letterSpacing: "0.02em", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {getUserDisplayName(otherUser)}
          </p>
          <p style={{ margin: "5px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", color: conversation?.connection_made ? "#7fc8ff" : otherUser?.is_online ? "#4dffb0" : "#7fa9d4" }}>
            {conversation?.connection_made ? "Connected in real life" : otherUser?.is_online ? "Online" : "Away"}
          </p>
        </div>
        <button
          onClick={() => setShowIcebreaker(true)}
          style={{ ...ICON_BTN, border: "1px solid rgba(120,190,255,.4)", background: "rgba(20,58,112,.6)" }}
          title="Icebreaker"
        >
          <Snowflake className="w-4 h-4" style={{ color: "#7fc8ff" }} />
        </button>
        <button onClick={() => setSafetyOpen(true)} style={ICON_BTN} aria-label="Safety options">
          <Shield className="w-4 h-4" style={{ color: "#bfe2ff" }} />
        </button>
      </div>

      <BlockReportSheet user={otherUser} open={safetyOpen} onClose={() => setSafetyOpen(false)} onBlocked={() => navigate("/messages")} conversationId={conversationId} />

      <IcebreakerModal
        open={showIcebreaker}
        onClose={() => setShowIcebreaker(false)}
        myProfile={myProfile}
        otherUser={otherUser}
        onUseSuggestion={(text) => setNewMessage(text)}
      />

      {/* Messages */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ position: "relative", zIndex: 1, padding: "18px 20px 10px", display: "flex", flexDirection: "column", gap: 16, overscrollBehavior: "contain" }}
      >
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === me?.id;
          const isSystem = msg.type === "system";
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const showDay =
            !prev || !moment(msg.created_date).isSame(moment(prev.created_date), "day");

          const daySeparator = showDay ? (
            <div style={{ textAlign: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9, lineHeight: 1, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5f89b2" }}>
              {dayLabel(msg.created_date)}
            </div>
          ) : null;

          if (isSystem) {
            return (
              <React.Fragment key={msg.id}>
                {daySeparator}
                <div style={{ textAlign: "center", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, letterSpacing: "0.12em", color: "#7fa9d4" }}>
                  {msg.content}
                </div>
              </React.Fragment>
            );
          }

          const isLastOfGroup =
            !next ||
            next.type === "system" ||
            next.sender_id !== msg.sender_id ||
            !moment(next.created_date).isSame(moment(msg.created_date), "day");

          return (
            <React.Fragment key={msg.id}>
              {daySeparator}
              <MessageBubble
                message={msg}
                isMe={isMe}
                otherUser={otherUser}
                showAvatar={isLastOfGroup}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input / Post-chat panel / Ended state */}
      {conversationEnded ? (
        <div className="glass-strong px-4 py-6 safe-bottom text-center flex-none">
          <p className="font-cyber text-sm text-white/40 tracking-wider">
            {isMyEnded ? "You ended this connection." : "Connection ended."}
          </p>
          <button
            onClick={() => navigate("/messages")}
            className="mt-3 px-6 py-2.5 rounded-xl cyber-input text-white/60 font-cyber text-xs tracking-wider"
          >
            BACK TO MESSAGES
          </button>
        </div>
      ) : showPostChatPanel ? (
        <div className="glass-strong safe-bottom flex-none">
          <PostChatPanel
            conversation={conversation}
            myProfile={myProfile}
            otherUser={otherUser}
            onShareContact={() => setShowContactExchange(true)}
            onEndConnection={handleEndConnection}
          />
        </div>
      ) : (
        <div className="flex-none" style={{ position: "relative", zIndex: 3, paddingTop: 12, paddingLeft: 20, paddingRight: 20, paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))", borderTop: "1px solid rgba(105,190,255,.16)" }}>
          <MessageCounter sentCount={sentCount} max={MAX_MESSAGES} />
          {mediaError && (
            <div style={{ marginBottom: 8, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", color: "#ff8a80" }}>
              {mediaError}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) sendMedia(file, "image");
              }}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              style={{ ...ICON_BTN, width: 44, height: 44 }}
              aria-label="Send image"
            >
              <Image className="w-4 h-4" style={{ color: "#bfe2ff" }} />
            </button>
            <div
              style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, height: 48, padding: "0 14px", background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.3)", clipPath: "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)" }}
            >
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message…"
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 14.5 }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                aria-label="Send"
                style={{ flex: "none", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: 0, borderRadius: "50%", background: newMessage.trim() ? "linear-gradient(160deg, #2a72e8, #1b4fc4)" : "rgba(105,190,255,.14)", color: newMessage.trim() ? "#fff" : "#6f9dc8", cursor: newMessage.trim() ? "pointer" : "default" }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <VoiceRecorderButton
              style={{ ...ICON_BTN, width: 44, height: 44 }}
              disabled={sending}
              onRecorded={(file) => sendMedia(file, "voice")}
              onError={setMediaError}
            />
          </div>
        </div>
      )}

      {/* Contact Exchange Sheet */}
      <AnimatePresence>
        {showContactExchange && (
          <ContactExchangeSheet
            open={showContactExchange}
            onClose={() => setShowContactExchange(false)}
            conversation={conversation}
            currentUser={me}
          />
        )}
      </AnimatePresence>
    </div>
  );
}