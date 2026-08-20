import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Crown, Award, Zap, X, Diamond, Globe, Trophy, EyeOff, BarChart3, Rocket, ShieldCheck, Headphones } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import PremiumDesktop from "@/pages/PremiumDesktop";
import useIsDesktop from "@/hooks/useIsDesktop";

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Zap,
    color: "text-white/50",
    features: [
      { label: "1 mile radius", included: true },
      { label: "3 chats per day", included: true },
      { label: "Basic filters", included: true },
      { label: "Invisible mode", included: false },
      { label: "Analytics dashboard", included: false },
      { label: "Profile photo", included: false },
    ],
  },
  {
    name: "Plus",
    price: "$9.99",
    period: "/month",
    icon: Award,
    color: "text-blue-400",
    popular: true,
    features: [
      { label: "10 mile radius", included: true },
      { label: "Unlimited chats", included: true },
      { label: "Advanced filters", included: true },
      { label: "Invisible mode", included: true },
      { label: "Priority placement", included: false },
      { label: "Analytics dashboard", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/month",
    icon: Crown,
    color: "text-yellow-400",
    features: [
      { label: "Everything in Plus", included: true },
      { label: "20 mile radius", included: true },
      { label: "Priority placement in discovery", included: true },
      { label: "Daily profile boost", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Verified photo badge", included: false },
    ],
  },
  {
    name: "Platinum",
    price: "$1,000",
    period: "/month",
    icon: Diamond,
    color: "text-cyan-300",
    exclusive: true,
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Global radius — no limits", included: true },
      { label: "Verified photo badge", included: true },
      { label: "Platinum-only visibility mode", included: true },
      { label: "Global leaderboard access", included: true },
      { label: "Dedicated concierge support", included: true },
    ],
  },
];

export default function Premium() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(1);
  const [currentTier, setCurrentTier] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const isDesktop = useIsDesktop(1200);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getSubscriptionCapabilities", {});
        if (res.data?.tier) setCurrentTier(res.data.tier);
        const me = await base44.auth.me();
        const mine = await base44.entities.UserProfile.filter({ created_by_id: me.id });
        if (mine[0]) setMyProfile(mine[0]);
      } catch {}
    })();
  }, []);

  if (isDesktop) {
    return <PremiumDesktop currentTier={currentTier || "free"} myProfile={myProfile} />;
  }

  return (
    <div className="px-4 pt-4 safe-top pb-8 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <h1 className="text-xl font-bold text-white">Premium</h1>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Unlock NEX2</h2>
        <p className="text-white/40 text-sm">More reach, more features, more connections</p>
      </div>

      {selected === 3 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 border border-cyan-500/15"
        >
          <Globe className="w-5 h-5 text-cyan-300 flex-shrink-0" />
          <p className="text-cyan-200/80 text-xs leading-relaxed">
            Platinum sells <span className="font-semibold">status and exclusivity</span> — global reach, a verified badge, and a network of members who mean business.
          </p>
        </motion.div>
      )}

      <div className="space-y-4">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isSelected = selected === i;
          const isCurrent = currentTier === plan.name.toLowerCase();
          return (
            <motion.div key={plan.name} whileTap={{ scale: 0.98 }}>
              <GlassCard
                strong={isSelected}
                className={`relative ${isSelected ? (plan.exclusive ? "ring-1 ring-cyan-400/40" : "ring-1 ring-blue-500/40") : ""} ${plan.exclusive ? "border-cyan-500/10" : ""}`}
                onClick={() => setSelected(i)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-blue text-[10px] font-semibold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {plan.exclusive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-[10px] font-semibold text-white uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" />
                    Exclusive
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-medium text-green-400">
                    Current
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "gradient-blue" : "bg-white/5"}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : plan.color}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{plan.name}</p>
                    <p className="text-white/40 text-xs">
                      <span className="text-white text-lg font-bold">{plan.price}</span>
                      <span className="text-white/30">{plan.period}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-white/20" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? "text-white/70" : "text-white/20"}`}>
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {selected > 0 && currentTier !== PLANS[selected].name.toLowerCase() && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <button
            className={`w-full py-4 rounded-2xl text-white font-semibold text-base active:scale-[0.98] transition-transform ${
              PLANS[selected].exclusive
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_24px_rgba(34,211,238,0.25),0_0_60px_rgba(59,130,246,0.12)]"
                : "gradient-blue glow-blue"
            }`}
          >
            Subscribe to {PLANS[selected].name}
          </button>
        </motion.div>
      )}
    </div>
  );
}