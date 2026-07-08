import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Flame, Globe, TrendingUp, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";

const PODIUM_STYLES = [
  { bar: "from-yellow-400/60 to-amber-600/20", glow: "shadow-[0_0_24px_rgba(250,204,21,0.25)]", rank: "text-yellow-400", ring: "ring-yellow-400/30", height: "h-24" },
  { bar: "from-white/40 to-white/10", glow: "shadow-[0_0_16px_rgba(255,255,255,0.12)]", rank: "text-white/70", ring: "ring-white/20", height: "h-16" },
  { bar: "from-amber-700/50 to-orange-900/15", glow: "shadow-[0_0_16px_rgba(180,83,9,0.15)]", rank: "text-amber-500/70", ring: "ring-amber-600/20", height: "h-10" },
];

export default function GlobalLeaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await base44.functions.invoke("getNetworkLeaderboard", {});
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-card rounded-[1.5rem] p-5">
        <div className="shimmer rounded-xl h-48" />
      </div>
    );
  }

  const leaderboard = data?.leaderboard || [];
  const myRank = data?.myRank || data?.totalUsers + 1 || 1;
  const myCount = data?.myCount || 0;
  const totalUsers = data?.totalUsers || 0;
  const totalConnections = data?.totalConnections || 0;
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);
  const hasPodium = podium.length >= 3;
  const podiumOrder = hasPodium ? [1, 0, 2] : podium.map((_, i) => i);

  return (
    <div className="ai-card rounded-[1.5rem] p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/8 to-orange-600/4 blur-2xl" />
      <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/8 to-violet-600/4 blur-2xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center border border-amber-500/10">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
              Global Leaderboard
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">Live</span>
            </h3>
            <p className="text-white/30 text-[10px]">{totalConnections} connections across {totalUsers} networkers</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/5">
          <Globe className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 text-[10px] font-medium">Worldwide</span>
        </div>
      </div>

      {/* Your rank bar */}
      <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-500/8 via-violet-500/5 to-transparent border border-blue-500/10 mb-5">
        <div className="flex flex-col items-center min-w-[3rem]">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">Your Rank</span>
          <span className="text-2xl font-bold gradient-text leading-none">#{myRank}</span>
        </div>
        <div className="w-px h-10 bg-white/5" />
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">{myCount} people known</p>
          <p className="text-white/30 text-[10px]">Keep networking to climb the ranks</p>
        </div>
        <TrendingUp className="w-5 h-5 text-emerald-400/60" />
      </div>

      {leaderboard.length === 0 ? (
        <div className="py-8 text-center">
          <Crown className="w-8 h-8 text-white/15 mx-auto mb-2" />
          <p className="text-white/30 text-xs">No networkers ranked yet. Be the first!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {hasPodium && (
            <div className="relative flex items-end justify-center gap-2 mb-5">
              {podiumOrder.map((idx) => {
                const entry = podium[idx];
                if (!entry) return null;
                const style = PODIUM_STYLES[idx];
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center flex-1 max-w-[5rem]"
                  >
                    <div className="relative mb-2">
                      {idx === 0 && (
                        <Crown className="w-4 h-4 text-yellow-400 absolute -top-4 left-1/2 -translate-x-1/2 flame-flicker" />
                      )}
                      <div className={`rounded-full ring-2 ${style.ring} ${style.glow}`}>
                        <UserAvatar src={entry.profile_photo} size="sm" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${style.bar} flex items-center justify-center text-[10px] font-bold border-2 border-[hsl(0,0%,8%)] ${style.rank}`}>
                        {idx + 1}
                      </div>
                    </div>
                    <p className="text-white/70 text-[10px] font-medium truncate max-w-full">{entry.username}</p>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      <span className={`text-xs font-bold ${style.rank}`}>{entry.connections}</span>
                    </div>
                    <div className={`w-full ${style.height} rounded-t-lg bg-gradient-to-t ${style.bar} opacity-50`} />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="relative space-y-0.5">
              {rest.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-white/30 text-xs font-mono w-5 text-center">{i + 4}</span>
                  <UserAvatar src={entry.profile_photo} size="xs" />
                  <span className="text-white/70 text-sm font-medium flex-1 truncate">{entry.username}</span>
                  <span className="text-blue-400 text-sm font-bold">{entry.connections}</span>
                  <Flame className="w-3 h-3 text-amber-500/30" />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}