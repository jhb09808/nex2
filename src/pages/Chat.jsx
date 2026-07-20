import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Image, Mic, Smile, Shield, Snowflake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import ChatWingman from "@/components/nex/ai/ChatWingman";
import IcebreakerModal from "@/components/nex/IcebreakerModal";
import BlockReportSheet from "@/components/nex/safety/BlockReportSheet";
import NotificationListener from "@/components/nex/NotificationListener";
import moment from "moment";
import { getUserDisplayName } from "@/components/nex/userDisplay";
import { generateMockProfiles } from "@/components/nex/mapMockProfiles";

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
  const [sending, setSending] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [showIcebreaker, setShowIcebreaker] = useState(false);
  const messagesEnd = useRef(null);

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

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        if (event.type === "create") {
          setMessages((prev) => [...prev, event.data]);
        }
      }
    });
    return unsub;
  }, [conversationId]);

  const loadChat = async () => {
    try {
      const user = await base44.auth.me();
      setMe(user);
      const myProfiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      if (myProfiles[0]) setMyProfile(myProfiles[0]);
      const convo = await base44.entities.Conversation.get(conversationId);
      const otherId = convo.participants?.find((id) => id !== user.id);
      const msgs = await base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100);
      setMessages(msgs);

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
          // Reconstruct bot profile from mock profiles generator
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
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const msgText = newMessage.trim();
    try {
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_id: me.id,
        content: msgText,
        type: "text",
      });
      await base44.entities.Conversation.update(conversationId, {
        last_message: msgText,
        last_message_at: new Date().toISOString(),
      });
      setNewMessage("");

      // If chatting with a bot, generate an AI reply
      if (isBotChat()) {
        const botId = otherUser?.id || chatUser?.id;
        const botProfile = otherUser || chatUser;
        try {
          const res = await base44.functions.invoke("generateBotReply", {
            conversation_id: conversationId,
            bot_user_id: botId,
            bot_profile: botProfile,
            recent_messages: [...messages, { sender_id: me.id, content: msgText }],
          });
          // Real-time subscription will pick up the new message, but add as fallback
          if (res.data?.reply && !res.data?.reply?.error) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.content === res.data.reply && m.sender_id === botId);
              if (exists) return prev;
              return [...prev, {
                id: `bot-reply-${Date.now()}`,
                conversation_id: conversationId,
                sender_id: botId,
                content: res.data.reply,
                type: "text",
                created_date: new Date().toISOString(),
              }];
            });
          }
        } catch (botErr) {
          console.error("Bot reply failed:", botErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(0,0%,4%)] max-w-lg mx-auto">
      <NotificationListener />
      {/* Header */}
      <div className="glass-strong px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate("/messages")} className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <UserAvatar name={getUserDisplayName(otherUser)} size="sm" isOnline={otherUser?.is_online} plan={otherUser?.plan} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{getUserDisplayName(otherUser)}</p>
          <p className="text-white/30 text-[10px]">{otherUser?.is_online ? "Online" : "Away"}</p>
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === me?.id;
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

      {/* Input */}
      <div className="glass-strong px-4 py-3 safe-bottom">
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
    </div>
  );
}