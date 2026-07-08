import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Image, Mic, Smile } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import ChatWingman from "@/components/nex/ai/ChatWingman";
import moment from "moment";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const chatUser = location.state?.chatUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [me, setMe] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [sending, setSending] = useState(false);
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
      const msgs = await base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100);
      setMessages(msgs);

      const convo = await base44.entities.Conversation.get(conversationId);
      const otherId = convo.participants?.find((id) => id !== user.id);
      if (otherId) {
        const profiles = await base44.entities.UserProfile.filter({ created_by_id: otherId });
        if (profiles.length > 0) setOtherUser(profiles[0]);
      }
      // Fallback to user info passed from the approval flow (e.g. mock profiles)
      if (!otherUser) setOtherUser(chatUser || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_id: me.id,
        content: newMessage.trim(),
        type: "text",
      });
      await base44.entities.Conversation.update(conversationId, {
        last_message: newMessage.trim(),
        last_message_at: new Date().toISOString(),
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(0,0%,4%)] max-w-lg mx-auto">
      {/* Header */}
      <div className="glass-strong px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate("/messages")} className="w-9 h-9 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <UserAvatar src={otherUser?.profile_photo} size="sm" isOnline={otherUser?.is_online} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{otherUser?.username || "User"}</p>
          <p className="text-white/30 text-[10px]">{otherUser?.is_online ? "Online" : "Away"}</p>
        </div>
        <ChatWingman otherUser={otherUser} recentMessages={messages.map((m) => ({ ...m, sender_id: m.sender_id === me?.id ? "me" : m.sender_id }))} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === me?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
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