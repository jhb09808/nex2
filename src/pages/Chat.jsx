import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Image, Mic, Smile, Shield, Snowflake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import IcebreakerModal from "@/components/nex/IcebreakerModal";
import BlockReportSheet from "@/components/nex/safety/BlockReportSheet";
import NotificationListener from "@/components/nex/NotificationListener";
import MessageCounter from "@/components/nex/chat/MessageCounter";
import PostChatPanel from "@/components/nex/chat/PostChatPanel";
import ContactExchangeSheet from "@/components/nex/chat/ContactExchangeSheet";
import moment from "moment";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import { generateMockProfiles } from "@/components/nex/mapMockProfiles";

const MAX_MESSAGES = 20;

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
    <div className="flex flex-col h-full bg-[hsl(0,0%,4%)] max-w-lg mx-auto">
      <NotificationListener />
      {/* Header */}
      <div className="glass-strong px-4 py-3 flex items-center gap-3 safe-top flex-none">
        <button onClick={() => navigate("/messages")} className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <UserAvatar name={getUserDisplayName(otherUser)} size="sm" isOnline={otherUser?.is_online} plan={otherUser?.plan} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{getUserDisplayName(otherUser)}</p>
          <p className="text-white/30 text-[10px]">
            {conversation?.connection_made
              ? "🤝 Connected in real life"
              : otherUser?.is_online
              ? "Online"
              : "Away"}
          </p>
        </div>
        <button
          onClick={() => setShowIcebreaker(true)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          title="Icebreaker"
        >
          <Snowflake className="w-5 h-5 text-blue-400" />
        </button>
        <button
          onClick={() => setSafetyOpen(true)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0"
        >
          <Shield className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <BlockReportSheet user={otherUser} open={safetyOpen} onClose={() => setSafetyOpen(false)} onBlocked={() => navigate("/messages")} />

      <IcebreakerModal
        open={showIcebreaker}
        onClose={() => setShowIcebreaker(false)}
        myProfile={myProfile}
        otherUser={otherUser}
        onUseSuggestion={(text) => setNewMessage(text)}
      />

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === me?.id;
          const isSystem = msg.type === "system";
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-white/30 text-[11px] font-cyber tracking-wider px-3 py-1 rounded-full glass">
                  {msg.content}
                </span>
              </div>
            );
          }
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && otherUser && (
                <UserAvatar name={getUserDisplayName(otherUser)} size="xs" plan={otherUser.plan} className="flex-shrink-0" />
              )}
              <div
                className={`max-w-[65%] px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? "gradient-blue text-white rounded-br-md"
                    : "glass text-white/80 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                  <span className={`text-[10px] ${isMe ? "text-white/50" : "text-white/30"}`}>
                    {moment(msg.created_date).format("h:mm A")}
                  </span>
                  {isMe && msg.is_read && <span className="text-[10px] text-white/50">✓✓</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input / Post-chat panel / Ended state */}
      {conversationEnded ? (
        <div className="glass-strong px-4 py-6 safe-bottom text-center">
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
        <div className="glass-strong safe-bottom">
          <PostChatPanel
            conversation={conversation}
            myProfile={myProfile}
            otherUser={otherUser}
            onShareContact={() => setShowContactExchange(true)}
            onEndConnection={handleEndConnection}
          />
        </div>
      ) : (
        <div className="glass-strong px-4 py-3 safe-bottom">
          <MessageCounter sentCount={sentCount} max={MAX_MESSAGES} />
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0">
              <Image className="w-5 h-5 text-white/40" />
            </button>
            <div className="flex-1 glass rounded-xl flex items-center px-3 py-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message..."
                className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30"
              />
              <button className="ml-2">
                <Smile className="w-5 h-5 text-white/20" />
              </button>
            </div>
            {newMessage.trim() ? (
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-white/40" />
              </button>
            )}
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