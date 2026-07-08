import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Briefcase, Zap } from "lucide-react";
import UserAvatar from "@/components/nex/UserAvatar";

const PROFESSIONS = ["Product Designer", "Software Engineer", "Startup Founder", "Photographer", "Marketing Lead", "Data Scientist", "Investor", "Content Creator"];

function compatibility(myInterests, theirInterests, seed) {
  if (!theirInterests || theirInterests.length === 0) return 42 + (seed * 13 % 25);
  const shared = (myInterests || []).filter((i) => theirInterests.includes(i));
  const total = new Set([...(myInterests || []), ...theirInterests]).size;
  return Math.min(98, Math.floor((shared.length / Math.max(total, 1)) * 100) + 35 + shared.length * 4);
}

export default function ProfileCard({ user, myInterests, index = 0 }) {
  const navigate = useNavigate();
  const score = compatibility(myInterests, user.interests, index);
  const profession = PROFESSIONS[index % PROFESSIONS.length];
  const distance = ((index * 7 + 3) % 50 / 10).toFixed(1);
  const gradId = `compat-grad-${index}`;
  const circumference = 2 * Math.PI * 22;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="neon-card rounded-[1.75rem] p-5 w-[270px] flex-shrink-0 relative"
    >
      {/* Top row: avatar + compatibility ring */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 blur-md" />
          <UserAvatar src={user.profile_photo} size="lg" isOnline={user.is_online} className="relative" />
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
            <circle
              cx="28" cy="28" r="22" fill="none"
              stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - score / 100)}
            />
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
      <div className="flex items-center gap-1.5 text-white/40 text-xs mt-1 mb-3">
        <Briefcase className="w-3 h-3" />
        <span className="truncate">{profession}</span>
        <span className="mx-0.5">·</span>
        <MapPin className="w-3 h-3" />
        <span className="font-mono text-blue-400/60">{distance} mi</span>
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