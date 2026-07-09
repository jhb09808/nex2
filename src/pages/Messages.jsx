import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import moment from "moment";
import { getUserDisplayName } from "@/components/nex/userDisplay";

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const me = await base44.auth.me();
      const convos = await base44.entities.Conversation.list("-updated_date", 30);
      const myConvos = convos.filter((c) => c.participants?.includes(me.id));
      setConversations(myConvos);

      // Load participant profiles
      const allIds = [...new Set(myConvos.flatMap((c) => c.participants || []).filter((id) => id !== me.id))];
      const profileMap = {};
      for (const id of allIds.slice(0, 20)) {
        try {
          const p = await base44.entities.UserProfile.filter({ created_by_id: id });
          if (p.length > 0) profileMap[id] = p[0];
        } catch (e) {}
      }
      setProfiles(profileMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (convo) => {
    return profiles[convo.participants?.find((id) => id !== convo.created_by_id)] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pr-12">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </div>

      {/* Search */}
      <div className="glass rounded-xl flex items-center gap-3 px-3 py-2.5 mb-6">
        <Search className="w-5 h-5 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations"
          className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30"
        />
      </div>

      {/* Conversation List */}
      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((convo, i) => {
            const other = getOtherParticipant(convo);
            return (
              <motion.div
                key={convo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  className="flex items-center gap-3 !p-3"
                  onClick={() => navigate(`/chat/${convo.id}`)}
                >
                  <UserAvatar src={other?.profile_photo} size="md" isOnline={other?.is_online} plan={other?.plan} showProfilePhoto={other?.show_profile_photo} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white font-medium text-sm truncate">{getUserDisplayName(other)}</p>
                      <span className="text-white/30 text-[10px]">
                        {convo.last_message_at ? moment(convo.last_message_at).fromNow() : ""}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs truncate">{convo.last_message || "Start a conversation"}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4">
            <Edit3 className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">No messages yet</p>
          <p className="text-white/20 text-xs">Start by connecting with nearby people</p>
        </div>
      )}
    </div>
  );
}