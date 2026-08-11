import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Crown, Flame, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/nex/UserAvatar";
import { getUserDisplayName } from "@/components/nex/userDisplay";

const PODIUM_STYLES = [
  { bar: "from-yellow-400/60 to-amber-600/20", glow: "shadow-[0_0_24px_rgba(250,204,21,0.25)]", rank: "text-yellow-400", ring: "ring-yellow-400/30", height: "h-20" },
  { bar: "from-white/40 to-white/10", glow: "shadow-[0_0_16px_rgba(255,255,255,0.12)]", rank: "text-white/70", ring: "ring-white/20", height: "h-14" },
  { bar: "from-amber-700/50 to-orange-900/15", glow: "shadow-[0_0_16px_rgba(180,83,9,0.15)]", rank: "text-amber-500/70", ring: "ring-amber-600/20", height: "h-10" },
];

export default function Leaderboard() {
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
      <div className="h-full overflow-y-auto pb-24 pt-20 px-4">
        <div className="shimmer rounded-2xl h-40 mb-4" />
        <div className="shimmer rounded-2xl h-64 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer rounded-xl h-14" />
          ))}
        </div>
      </div>
    );
  }

  const leaderboard = data?.leaderboard || [];
  const myRank = data?.myRank || 1;
  const myCount = data?.myCount || 0;
  const totalUsers = data?.totalUsers || 0;
  const totalConnections = data?.totalConnections || 0;
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const hasPodium = podium.length >= 3;
  const podiumOrder = hasPodium ? [1, 0, 2] : podium.map((_, i) => i);

  return (
    <div className="h-full pb-24 pt-6 px-4 relative flex flex-col overflow-y-auto">
      {/* Background glow */}
      <div className="absolute -right-20 top-0 w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/8 to-orange-600/4 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 top-40 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/8 to-violet-600/4 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center border border-amber-500/10">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Leaderboard
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">Live</span>
          </h1>
          <p className="text-white/30 text-xs">
            {totalConnections} connections across {totalUsers} networkers
          </p>
        </div>
      </motion.div>

      {/* Your rank card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="ai-card rounded-2xl p-4 mb-5 flex items-center gap-4"
      >
        <div className="flex flex-col items-center min-w-[4rem]">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">Your Rank</span>
          <span className="text-3xl font-bold gradient-text leading-none mt-0.5">#{myRank}</span>
        </div>
        <div className="w-px h-12 bg-white/5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <p className="text-white text-lg font-bold">{myCount}</p>
            <p className="text-white/40 text-xs">connections</p>
          </div>
          <p className="text-white/30 text-[11px] mt-0.5">
            {myRank === 1 ? "You're #1! Defend your throne." : "Keep networking to climb the ranks"}
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-emerald-400/60" />
      </motion.div>

      {leaderboard.length === 0 ? (
        <div className="py-16 text-center">
          <Crown className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No networkers ranked yet. Be the first!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {hasPodium && (
            <div className="ai-card rounded-2xl p-5 mb-4 relative overflow-hidden">
              <div className="flex items-end justify-center gap-3">
                {podiumOrder.map((idx) => {
                  const entry = podium[idx];
                  if (!entry) return null;
                  const style = PODIUM_STYLES[idx];
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center flex-1 max-w-[5.5rem]"
                    >
                      <Link to={`/user/${entry.user_id}`} className="relative mb-2 block">
                        {idx === 0 && (
                          <Crown className="w-4 h-4 text-yellow-400 absolute -top-4 left-1/2 -translate-x-1/2 flame-flicker" />
                        )}
                        <div className={`rounded-full ring-2 ${style.ring} ${style.glow}`}>
                          <UserAvatar name={entry.username} size="md" plan={entry.plan} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${style.bar} flex items-center justify-center text-[10px] font-bold border-2 border-[hsl(0,0%,4%)] ${style.rank}`}>
                          {idx + 1}
                        </div>
                      </Link>
                      <p className="text-white/70 text-[11px] font-medium truncate max-w-full mb-1">{entry.username}</p>
                      <div className={`text-sm font-bold ${style.rank} mb-1.5`}>{entry.connections}</div>
                      <div className={`w-full ${style.height} rounded-t-lg bg-gradient-to-t ${style.bar} opacity-50`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full ranking list */}
          <div className="ai-card rounded-2xl p-2 space-y-0.5">
            {rest.map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.03 }}
              >
                <Link
                  to={`/user/${entry.user_id}`}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white/[0.04] transition-colors active:scale-[0.99]"
                >
                  <span className="text-white/30 text-sm font-mono w-7 text-center">{i + 4}</span>
                  <UserAvatar name={entry.username} size="sm" plan={entry.plan} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{entry.username}</p>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400/40" />
                      <span className="text-white/30 text-[11px]">{entry.connections} connections</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/15" />
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}