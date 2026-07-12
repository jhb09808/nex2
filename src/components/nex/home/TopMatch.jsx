import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Zap, Send, BadgeCheck, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";

function computeScore(myInterests, theirInterests, seed) {
  const shared = (myInterests || []).filter((i) => (theirInterests || []).includes(i));
  const base = 45 + shared.length * 11;
  const bonus = (seed * 7) % 18;
  return Math.min(98, base + bonus);
}

export default function TopMatch({ nearbyUsers = [], myInterests = [], profile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [insight, setInsight] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (nearbyUsers.length > 0) findTopMatch();
    else setLoading(false);
  }, [nearbyUsers.length]);

  const findTopMatch = async () => {
    try {
      const ranked = [...nearbyUsers]
        .map((u, i) => ({
          user: u,
          shared: (myInterests || []).filter((x) => (u.interests || []).includes(x)).length,
          score: computeScore(myInterests, u.interests, i + 1),
        }))
        .sort((a, b) => b.shared - a.shared || b.score - a.score);

      if (ranked.length === 0) { setLoading(false); return; }
      const top = ranked[0];
      setMatch(top);

      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are NEX AI. A user (${profile?.username || "User"}, interests: ${(myInterests || []).join(", ")}) wants to connect with ${top.user.username} (bio: ${(top.user.bio || "").substring(0, 100)}, interests: ${(top.user.interests || []).join(", ")}).

Generate:
1. A one-sentence reason WHY they should connect (specific, referencing shared interests).
2. A natural, personalized icebreaker message (1-2 sentences, conversational, not cheesy).
3. Their likely profession/role (short, 2-3 words).`,
          response_json_schema: {
            type: "object",
            properties: {
              reason: { type: "string" },
              icebreaker: { type: "string" },
              profession: { type: "string" },
            },
          },
        });
        setInsight(res);
      } catch (err) {
        console.error(err);
        setInsight({
          reason: `Shares ${top.shared} interests with you${top.user.bio ? ` — "${top.user.bio.substring(0, 60)}"` : ""}.`,
          icebreaker: `Hey ${top.user.username}! I noticed we both love ${(top.user.interests || [])[0] || "networking"}. Would love to connect!`,
          profession: "Professional",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendIntroduction = async () => {
    if (!match || sending) return;
    setSending(true);
    try {
      const me = await base44.auth.me();
      const otherId = match.user.created_by_id || match.user.id;
      const existing = await base44.entities.Conversation.filter({ participants: me.id }, "-updated_date", 50);
      const found = existing.find((c) => c.participants?.includes(otherId));
      let convoId;
      if (found) {
        convoId = found.id;
      } else {
        const convo = await base44.entities.Conversation.create({
          participants: [me.id, otherId],
          last_message: "",
          is_active: true,
        });
        convoId = convo.id;
      }
      navigate(`/chat/${convoId}`, { state: { chatUser: match.user } });
    } catch (err) {
      console.error(err);
      navigate("/messages");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-card rounded-[1.5rem] p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded shimmer" />
            <div className="h-3 w-20 rounded shimmer" />
          </div>
        </div>
        <div className="h-2 w-full rounded shimmer mt-4" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="ai-card rounded-[1.5rem] py-8 px-4 text-center">
        <Sparkles className="w-6 h-6 text-white/10 mx-auto mb-2" />
        <p className="text-white/30 text-sm">No matches nearby yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ai-card ai-border rounded-[1.5rem] p-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-violet-600/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-1.5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">Top Match For You</span>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 blur" />
            <UserAvatar name={match.user.username} size="lg" isOnline={match.user.is_online} className="relative" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-bold text-lg truncate">{match.user.username}</h3>
              {match.user.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
              {match.user.is_premium && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
            </div>
            <p className="text-white/40 text-xs mb-2">{insight?.profession || "Professional"}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 ai-dot" />
              <span className="text-blue-400 text-xs font-bold font-mono">{match.score}% match</span>
            </div>
          </div>
        </div>

        {insight?.reason && (
          <div className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/60 text-xs leading-relaxed">{insight.reason}</p>
          </div>
        )}

        {insight?.icebreaker && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">AI Icebreaker</span>
            </div>
            <p className="text-white/70 text-xs italic leading-relaxed">"{insight.icebreaker}"</p>
          </div>
        )}

        <button
          onClick={handleSendIntroduction}
          disabled={sending}
          className="w-full py-3 rounded-xl gradient-blue text-white text-sm font-semibold flex items-center justify-center gap-2 glow-blue-sm hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? "Connecting..." : "Send Introduction"}
        </button>
      </div>
    </motion.div>
  );
}