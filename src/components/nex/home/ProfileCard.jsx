import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Briefcase, Zap, Sparkles, Send, Shield, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";

const PROFESSIONS = ["Product Designer", "Software Engineer", "Startup Founder", "Photographer", "Marketing Lead", "Data Scientist", "Investor", "Content Creator"];

function calcCompat(myInterests, theirInterests, seed) {
  if (!theirInterests || theirInterests.length === 0) return 42 + (seed * 13 % 25);
  const shared = (myInterests || []).filter(i => theirInterests.includes(i));
  const total = new Set([...(myInterests || []), ...theirInterests]).size;
  return Math.min(98, Math.floor((shared.length / Math.max(total, 1)) * 100) + 35 + shared.length * 4);
}

function calcDimensions(myInterests, theirInterests, seed) {
  const mine = myInterests || [];
  const theirs = theirInterests || [];
  const shared = mine.filter(i => theirs.includes(i));
  const base = 40 + shared.length * 12;
  return {
    friend: Math.min(98, base + (seed * 7 % 20)),
    business: Math.min(98, base + (seed * 13 % 25) - 5),
    client: Math.min(95, base - 10 + (seed * 11 % 20)),
    collaboration: Math.min(98, base + 5 + (seed * 17 % 15)),
  };
}

const DIMS = [
  { key: "friend", label: "Friend", color: "from-blue-500 to-blue-400" },
  { key: "business", label: "Business", color: "from-violet-500 to-violet-400" },
  { key: "client", label: "Client", color: "from-amber-500 to-amber-400" },
  { key: "collaboration", label: "Collab", color: "from-emerald-500 to-emerald-400" },
];

export default function ProfileCard({ user, myInterests, index = 0 }) {
  const navigate = useNavigate();
  const [icebreaker, setIcebreaker] = useState(null);
  const [iceLoading, setIceLoading] = useState(false);

  const score = calcCompat(myInterests, user.interests, index);
  const dims = calcDimensions(myInterests, user.interests, index);
  const profession = PROFESSIONS[index % PROFESSIONS.length];
  const distance = ((index * 7 + 3) % 50 / 10).toFixed(1);
  const trustScore = 70 + (index * 11 % 25);
  const gradId = `compat-grad-${index}`;
  const circumference = 2 * Math.PI * 22;

  const generateIcebreaker = async () => {
    setIceLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a personalized icebreaker message from ${"the user"} to ${user.username}.

Their interests: ${(user.interests || []).join(", ")}
Their bio: ${user.bio || "No bio"}

Find a specific, natural common ground. Make it feel authentic, not generic. Reference something specific about their profile. Keep it under 2 sentences.`,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            context: { type: "string" }
          }
        }
      });
      setIcebreaker(res);
    } catch (err) {
      console.error(err);
      const shared = (myInterests || []).filter(i => (user.interests || []).includes(i));
      setIcebreaker({
        message: `Hey ${user.username}! I noticed we both love ${shared[0] || user.interests?.[0] || "networking"}. Would love to connect and learn more about what you do!`,
        context: "Based on shared interests"
      });
    } finally {
      setIceLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="ai-card rounded-[1.75rem] p-5 w-[280px] flex-shrink-0 relative"
    >
      {/* Top: avatar + compatibility ring */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 blur-md" />
          <UserAvatar name={user.username} size="lg" isOnline={user.is_online} className="relative" />
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
            <circle cx="28" cy="28" r="22" fill="none" stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-sm font-bold leading-none">{score}%</span>
            <span className="text-white/30 text-[7px] uppercase tracking-wider mt-0.5">match</span>
          </div>
        </div>
      </div>

      {/* Name + profession */}
      <h3 className="text-white font-semibold text-lg leading-tight">{user.username}</h3>
      <div className="flex items-center gap-1.5 text-white/40 text-xs mt-1 mb-3 flex-wrap">
        <Briefcase className="w-3 h-3" />
        <span className="truncate">{profession}</span>
        <span className="mx-0.5">·</span>
        <MapPin className="w-3 h-3" />
        <span className="font-mono text-blue-400/60">{distance} mi</span>
        <span className="mx-0.5">·</span>
        <Shield className="w-3 h-3 text-emerald-400/50" />
        <span className="font-mono text-emerald-400/50">{trustScore}</span>
      </div>

      {/* Multi-dimensional compatibility */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {DIMS.map((dim) => {
          const val = dims[dim.key];
          return (
            <div key={dim.key} className="text-center">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-1">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${dim.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ delay: 0.2 + index * 0.07, duration: 0.5 }}
                />
              </div>
              <p className="text-white/30 text-[8px] uppercase tracking-wider">{dim.label}</p>
              <p className="text-white/50 text-[10px] font-mono">{val}%</p>
            </div>
          );
        })}
      </div>

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {user.interests.slice(0, 3).map((interest) => (
            <span key={interest} className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/50 text-[10px] font-medium border border-white/5">
              {interest}
            </span>
          ))}
        </div>
      )}

      {/* AI Icebreaker */}
      <AnimatePresence mode="wait">
        {icebreaker ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">AI Icebreaker</span>
              </div>
              <p className="text-white/70 text-xs italic leading-relaxed mb-2">"{icebreaker.message}"</p>
              <button
                onClick={() => navigate(`/user/${user.id}`)}
                className="flex items-center gap-1.5 text-blue-400 text-xs font-medium"
              >
                <Send className="w-3 h-3" /> Send & Connect
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={generateIcebreaker}
            disabled={iceLoading}
            className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] text-white/60 text-xs font-medium flex items-center justify-center gap-2 mb-2 border border-white/5 transition-colors"
          >
            {iceLoading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating icebreaker...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Icebreaker</>
            )}
          </button>
        )}
      </AnimatePresence>

      {/* Connect button */}
      <button
        onClick={() => navigate(`/user/${user.id}`)}
        className="w-full py-3 rounded-xl gradient-blue text-white text-sm font-semibold flex items-center justify-center gap-2 glow-blue-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        <Zap className="w-4 h-4" />
        Connect
      </button>
    </motion.div>
  );
}