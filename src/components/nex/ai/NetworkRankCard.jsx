import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Trophy, TrendingUp, Crown, Zap, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";

const TIERS = [
  { name: "Rookie", min: 0, icon: Zap, color: "text-white/50", gradient: "from-white/10 to-white/5", ring: "ring-white/10" },
  { name: "Connector", min: 5, icon: TrendingUp, color: "text-blue-400", gradient: "from-blue-500/20 to-blue-600/5", ring: "ring-blue-500/20" },
  { name: "Networker", min: 15, icon: Globe, color: "text-cyan-400", gradient: "from-cyan-500/20 to-blue-600/5", ring: "ring-cyan-500/20" },
  { name: "Social Hub", min: 50, icon: Trophy, color: "text-violet-400", gradient: "from-violet-500/20 to-purple-600/5", ring: "ring-violet-500/20" },
  { name: "Maverick", min: 100, icon: Crown, color: "text-amber-400", gradient: "from-amber-500/20 to-orange-600/5", ring: "ring-amber-500/20" },
  { name: "Legend", min: 250, icon: Crown, color: "text-yellow-400", gradient: "from-yellow-500/25 to-amber-600/10", ring: "ring-yellow-500/30" },
];

function getTier(count) {
  let tier = TIERS[0];
  for (const t of TIERS) if (count >= t.min) tier = t;
  return tier;
}
function getNextTier(count) {
  for (const t of TIERS) if (count < t.min) return t;
  return null;
}

export default function NetworkRankCard() {
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
        <div className="shimmer rounded-xl h-40" />
      </div>
    );
  }

  const myCount = data?.myCount || 0;
  const myRank = data?.myRank || data?.totalUsers + 1 || 1;
  const totalUsers = data?.totalUsers || 0;
  const tier = getTier(myCount);
  const nextTier = getNextTier(myCount);
  const TierIcon = tier.icon;
  const progressPct = nextTier ? Math.min((myCount / nextTier.min) * 100, 100) : 100;

  const podiumColors = ["from-yellow-500/30 to-amber-600/10 text-yellow-400", "from-white/15 to-white/5 text-white/80", "from-amber-700/25 to-orange-800/5 text-amber-500/80"];
  const podiumHeights = ["h-20", "h-14", "h-10"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Hero Rank Banner */}
      <div className={`ai-card rounded-[1.5rem] p-5 relative overflow-hidden ring-1 ${tier.ring}`}>
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${tier.gradient} blur-2xl`} />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl" />

        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium">Global Rank</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-4xl font-bold text-white">#{myRank}</span>
              <span className="text-white/30 text-xs">/ {totalUsers}</span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">in the world</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${tier.gradient} border border-white/5`}>
            <TierIcon className={`w-3.5 h-3.5 ${tier.color}`} />
            <span className={`text-xs font-bold ${tier.color}`}>{tier.name}</span>
          </div>
        </div>

        {/* People Known — hero metric */}
        <div className="relative flex items-center justify-between py-3 border-y border-white/5">
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-wider">People Known</p>
            <p className="text-2xl font-bold gradient-text">{myCount}</p>
          </div>
          <Globe className="w-8 h-8 text-blue-500/20" />
        </div>

        {/* Progress to next tier */}
        {nextTier ? (
          <div className="relative mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/40 text-[11px] font-medium">Next: <span className={nextTier.color}>{nextTier.name}</span></span>
              <span className="text-white/30 text-[10px] font-mono">{myCount}/{nextTier.min}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            <p className="text-white/30 text-[10px] mt-1.5">Know {nextTier.min - myCount} more to rank up</p>
          </div>
        ) : (
          <div className="relative mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <Crown className="w-4 h-4 text-yellow-400 flame-flicker" />
            <span className="text-yellow-400/90 text-xs font-medium">Max tier reached — you're a Legend!</span>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {data?.leaderboard?.length > 0 && (
        <div className="ai-card rounded-[1.5rem] p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-white font-bold text-sm">Top Networkers</h3>
            <span className="text-white/30 text-[10px] ml-auto">{data.totalConnections} total connections</span>
          </div>

          {/* Podium — top 3 */}
          {data.leaderboard.length >= 3 && (
            <div className="flex items-end justify-center gap-2 mb-5">
              {[1, 0, 2].map((idx) => {
                const entry = data.leaderboard[idx];
                if (!entry) return null;
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="relative mb-2">
                      <UserAvatar src={entry.profile_photo} size="sm" />
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${podiumColors[idx]} flex items-center justify-center text-[10px] font-bold border border-[hsl(0,0%,8%)]`}>
                        {idx + 1}
                      </div>
                    </div>
                    <p className="text-white/80 text-[11px] font-medium truncate max-w-full">{entry.username}</p>
                    <p className={`text-xs font-bold ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-white/70" : "text-amber-500/70"}`}>{entry.connections}</p>
                    <div className={`mt-1.5 w-full ${podiumHeights[idx]} rounded-t-lg bg-gradient-to-t ${podiumColors[idx]} opacity-40`} />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-1">
            {data.leaderboard.slice(3, 10).map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-white/30 text-xs font-mono w-5 text-center">{i + 4}</span>
                <UserAvatar src={entry.profile_photo} size="xs" />
                <span className="text-white/70 text-sm font-medium flex-1 truncate">{entry.username}</span>
                <span className="text-blue-400 text-sm font-bold">{entry.connections}</span>
                <Flame className="w-3 h-3 text-amber-500/40" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}