import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, User, Eye, EyeOff, Shield, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InterestTag from "@/components/nex/InterestTag";

const ALL_INTERESTS = [
  "Technology", "Fitness", "Business", "Cars", "Nightlife", "Photography",
  "Travel", "Food", "Creators", "Startups", "Sports", "Music",
  "Art", "Gaming", "Fashion", "Movies", "Reading", "Hiking",
  "Yoga", "Cooking", "Design", "Crypto", "Science", "Pets"
];

const VISIBILITY_OPTIONS = [
  { value: "anonymous", icon: EyeOff, label: "Anonymous", desc: "Hide your identity completely" },
  { value: "first_name", icon: Eye, label: "First Name Only", desc: "Show only your first name" },
  { value: "full_profile", icon: User, label: "Full Profile", desc: "Show your complete profile" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [visibility, setVisibility] = useState("full_profile");
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.create({
        username,
        age: parseInt(age),
        bio,
        interests,
        visibility,
        onboarding_complete: true,
        radar_onboarding_complete: true,
        radar_filter_interests: interests,
        is_online: true,
        badges: [],
        blocked_users: [],
        is_adult: false,
        verification_method: "none",
      });
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return username.length >= 3 && parseInt(age) >= 18;
    if (step === 1) return interests.length >= 3;
    return true;
  };

  const steps = [
    // Step 0: Profile
    <motion.div key="profile" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Create your profile</h2>
        <p className="text-white/40 text-sm">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a unique username"
            className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Must be 18+"
            className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm"
          />
          {age && parseInt(age) < 18 && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <Shield className="w-3 h-3" /> You must be 18 or older
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short intro about you..."
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm resize-none"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Interests
    <motion.div key="interests" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Pick your interests</h2>
        <p className="text-white/40 text-sm">Select at least 3 to help us find your people</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_INTERESTS.map((interest) => (
          <InterestTag
            key={interest}
            label={interest}
            selected={interests.includes(interest)}
            onClick={() => toggleInterest(interest)}
          />
        ))}
      </div>
      <p className="text-white/30 text-xs text-center">{interests.length} selected</p>
    </motion.div>,

    // Step 2: Visibility
    <motion.div key="visibility" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Choose your visibility</h2>
        <p className="text-white/40 text-sm">Control how others see you</p>
      </div>
      <div className="space-y-3">
        {VISIBILITY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = visibility === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                selected ? "glass-strong ring-1 ring-blue-500/50" : "glass"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "gradient-blue" : "bg-white/5"}`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-white/40"}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium text-sm ${selected ? "text-white" : "text-white/60"}`}>{opt.label}</p>
                <p className="text-white/30 text-xs">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>,

    // Step 3: Location
    <motion.div key="location" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full glass-strong flex items-center justify-center">
          <MapPin className="w-10 h-10 text-blue-400" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Enable Location</h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
          NEX2 uses your location to find people nearby. Your exact location is never shared — only your approximate distance.
        </p>
      </div>
    </motion.div>,

    // Step 4: Launch
    <motion.div key="launch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center flex flex-col items-center justify-center flex-1">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
        <button
          onClick={handleComplete}
          disabled={saving}
          className="relative w-40 h-40 rounded-full gradient-blue glow-blue flex flex-col items-center justify-center active:scale-95 transition-transform group"
        >
          <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" style={{ animationDuration: "3s" }} />
          {saving ? (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-8 h-8 text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="text-white font-bold text-2xl mt-1">NEX2</span>
              <span className="text-white/60 text-[10px] uppercase tracking-widest mt-0.5">Tap to enter</span>
            </>
          )}
        </button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">You're all set</h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-xs">
          Your radar is live. Tap NEX2 to discover people nearby.
        </p>
      </motion.div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] px-6 py-8 safe-top safe-bottom max-w-lg mx-auto flex flex-col">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full gradient-blue"
              initial={{ width: 0 }}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-14 h-14 rounded-2xl glass flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
        )}
        {step < 4 && (
          <button
            onClick={() => {
              if (step === 3) {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(() => {});
                }
                setStep(4);
              } else {
                setStep(step + 1);
              }
            }}
            disabled={!canProceed() || saving}
            className="flex-1 py-4 rounded-2xl gradient-blue text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step === 3 ? (
              <>Enable & Continue <ArrowRight className="w-5 h-5" /></>
            ) : (
              <>Continue <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}