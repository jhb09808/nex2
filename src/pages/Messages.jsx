import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Edit3, Hand, Check, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import UserAvatar from "@/components/nex/UserAvatar";
import moment from "moment";
import { getUserDisplayName } from "@/components/nex/userDisplay";

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [waves, setWaves] = useState([]);
  const [waveProfiles, setWaveProfiles] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();

      // Load conversations
      const convos = await base44.entities.Conversation.list("-updated_date", 30);
      const myConvos = convos.filter((c) => c.participants?.includes(me.id));
      setConversations(myConvos);

      // Load incoming pending waves
      const myWaves = await base44.entities.Wave.filter({ receiver_id: me.id }, "-created_date", 20);
      const pendingWaves = myWaves.filter((w) => w.status === "pending");
      setWaves(pendingWaves);

      // Collect all profile IDs from conversations + waves
      const convoIds = myConvos.flatMap((c) => c.participants || []).filter((id) => id !== me.id);
      const waveSenderIds = pendingWaves.map((w) => w.sender_id);
      const allIds = [...new Set([...convoIds, ...waveSenderIds])];

      const profileMap = {};
      for (const id of allIds.slice(0, 30)) {
        try {
          const p = await base44.entities.UserProfile.filter({ created_by_id: id });
          if (p.length > 0) profileMap[id] = p[0];
        } catch (e) {}
      }
      setProfiles(profileMap);
      setWaveProfiles(profileMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWave = async (waveId) => {
    setActionLoading((prev) => ({ ...prev, [waveId]: "accepting" }));
    try {
      const res = await base44.functions.invoke("acceptWave", { wave_id: waveId });
      const conversationId = res.data?.conversation_id;
      // Remove the wave from the list
      setWaves((prev) => prev.filter((w) => w.id !== waveId));
      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      } else {
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [waveId]: null }));
    }
  };

  const handleDeclineWave = async (waveId) => {
    setActionLoading((prev) => ({ ...prev, [waveId]: "declining" }));
    try {
      await base44.entities.Wave.update(waveId, { status: "declined" });
      setWaves((prev) => prev.filter((w) => w.id !== waveId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [waveId]: null }));
    }
  };

  const getOtherParticipant = (convo) => {
    const meId = convo.participants?.find((id) => id !== convo.created_by_id);
    return profiles[meId] || profiles[convo.participants?.find((id) => id !== convo.created_by_id)] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 safe-top h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pr-12 flex-none">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </div>

      {/* Incoming Chat Requests */}
      {waves.length > 0 && (
        <div className="mb-4 flex-none">
          <div className="flex items-center gap-2 mb-3">
            <Hand className="w-4 h-4 text-blue-400" />
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Chat Requests</h2>
            <span className="ml-auto text-blue-400 text-xs font-medium">{waves.length}</span>
          </div>
          <div className="space-y-2">
            {waves.map((wave, i) => {
              const sender = waveProfiles[wave.sender_id];
              const isLoading = actionLoading[wave.id];
              return (
                <motion.div
                  key={wave.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <GlassCard className="!p-3" strong>
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar name={getUserDisplayName(sender)} size="md" isOnline={sender?.is_online} plan={sender?.plan} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{getUserDisplayName(sender)}</p>
                        <p className="text-white/40 text-xs truncate">
                          {wave.message || "Wants to connect with you"}
                        </p>
                        <p className="text-white/20 text-[10px] mt-0.5">{moment(wave.created_date).fromNow()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptWave(wave.id)}
                        disabled={!!isLoading}
                        className="flex-1 py-2.5 rounded-xl gradient-blue text-white font-medium text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-50"
                      >
                        {isLoading === "accepting" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeclineWave(wave.id)}
                        disabled={!!isLoading}
                        className="flex-1 py-2.5 rounded-xl glass text-white/60 font-medium text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-50"
                      >
                        {isLoading === "declining" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4" /> Decline
                          </>
                        )}
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="glass rounded-xl flex items-center gap-3 px-3 py-2.5 mb-4 flex-none">
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
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pb-24">
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
                  <UserAvatar name={getUserDisplayName(other)} size="md" isOnline={other?.is_online} plan={other?.plan} />
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
      ) : waves.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4">
            <Edit3 className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-1">No messages yet</p>
          <p className="text-white/20 text-xs">Start by connecting with nearby people</p>
        </div>
      ) : null}
    </div>
  );
}