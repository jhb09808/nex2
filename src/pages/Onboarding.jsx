import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, User, Eye, EyeOff, Shield, Zap, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InterestPicker from "@/components/nex/radar/InterestPicker";
import { MIN_INTEREST_SELECTIONS, MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";

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
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const checkUsernameTaken = async (value) => {
    if (!value || value.length < 3) return false;
    const existing = await base44.entities.UserProfile.filter({ username: value });
    return existing.length > 0;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError("");
  };

  const toggleInterest = (newInterests) => {
    setInterests(newInterests);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const taken = await checkUsernameTaken(username);
      if (taken) {
        setUsernameError("Username taken — try another");
        setSaving(false);
        setStep(0);
        return;
      }
      const allUsers = await base44.entities.UserProfile.list("created_date", 500);
      const realUserCount = allUsers.filter(u => !String(u.created_by_id).startsWith("service_")).length;
      const nextNumber = realUserCount + 1;
      await base44.entities.UserProfile.create({
        username,
        user_number: nextNumber,
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
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
        verification_method: "self_attested",
      });
      navigate("/map");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return username.length >= 3 && parseInt(age) >= 18;
    if (step === 1) return interests.length >= MIN_INTEREST_SELECTIONS;
    return true;
  };

  const steps = [
    // Step 0: Profile
    <motion.div key="profile" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
      <div>
        <h2 className="font-cyber text-xl font-bold tracking-wider text-white neon-text mb-1">CREATE YOUR PROFILE</h2>
        <p className="text-blue-200/50 text-xs tracking-wide">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-cyber font-medium text-blue-200/40 uppercase tracking-widest mb-2 block">Username</label>
          <input
            value={username}
            onChange={handleUsernameChange}
            placeholder="Choose a unique username"
            className="w-full px-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 focus:outline-none text-sm"
          />
          {usernameError && (
            <p className="text-red-400 text-xs mt-1.5">{usernameError}</p>
          )}
        </div>
        <div>
          <label className="text-[10px] font-cyber font-medium text-blue-200/40 uppercase tracking-widest mb-2 block">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Must be 18+"
            className="w-full px-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 focus:outline-none text-sm"
          />
          {age && parseInt(age) < 18 && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <Shield className="w-3 h-3" /> You must be 18 or older
            </p>
          )}
        </div>
        <div>
          <label className="text-[10px] font-cyber font-medium text-blue-200/40 uppercase tracking-widest mb-2 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short intro about you..."
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 focus:outline-none text-sm resize-none"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Interests
    <motion.div key="interests" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4">
      <div>
        <h2 className="font-cyber text-xl font-bold tracking-wider text-white neon-text mb-1">PICK YOUR INTERESTS</h2>
        <p className="text-blue-200/50 text-xs tracking-wide">Choose what you're into</p>
      </div>
      <div className="h-[55vh]">
        <InterestPicker
          selected={interests}
          onChange={toggleInterest}
        />
      </div>
    </motion.div>,

    // Step 2: Visibility
    <motion.div key="visibility" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
      <div>
        <h2 className="font-cyber text-xl font-bold tracking-wider text-white neon-text mb-1">CHOOSE YOUR VISIBILITY</h2>
        <p className="text-blue-200/50 text-xs tracking-wide">Control how others see you</p>
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
                selected ? "neon-card-active" : "neon-card"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selected ? "neon-btn" : "bg-white/5"}`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-blue-200/40"}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium text-sm ${selected ? "text-white" : "text-blue-200/60"}`}>{opt.label}</p>
                <p className="text-blue-200/30 text-xs">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>,

    // Step 3: Location
    <motion.div key="location" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full cyber-frame flex items-center justify-center">
          <MapPin className="w-10 h-10 text-cyan-400" />
        </div>
      </div>
      <div>
        <h2 className="font-cyber text-xl font-bold tracking-wider text-white neon-text mb-2">ENABLE LOCATION</h2>
        <p className="text-blue-200/50 text-xs leading-relaxed max-w-xs mx-auto tracking-wide">
          NEX2 uses your location to find people nearby. Your exact location is never shared — only your approximate distance.
        </p>
      </div>
    </motion.div>,

    // Step 4: Launch
    <motion.div key="launch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center flex flex-col items-center justify-center flex-1">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
        <button
          onClick={handleComplete}
          disabled={saving}
          className="relative w-40 h-40 rounded-full neon-btn flex flex-col items-center justify-center active:scale-95 transition-transform group"
        >
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: "3s" }} />
          {saving ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <>
              <Zap className="w-8 h-8 text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="text-white font-cyber font-bold text-2xl mt-1">NEX2</span>
              <span className="text-white/60 text-[10px] font-cyber uppercase tracking-widest mt-0.5">Tap to enter</span>
            </>
          )}
        </button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-cyber text-xl font-bold tracking-wider text-white neon-text mb-2">YOU'RE ALL SET</h2>
        <p className="text-blue-200/50 text-xs leading-relaxed max-w-xs tracking-wide">
          Your radar is live. Tap NEX2 to discover people nearby.
        </p>
      </motion.div>
    </motion.div>,
  ];

  return (
    <div className="cyber-bg px-6 py-8 safe-top safe-bottom flex flex-col overflow-hidden" style={{ position: "fixed", inset: 0, height: "100dvh", minHeight: 0, width: "100%", maxWidth: 440, margin: "0 auto" }}>
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
            <motion.div
              className="h-full neon-btn rounded-full"
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
        {step > 0 && step < 4 && (
          <button onClick={() => setStep(step - 1)} className="w-14 h-14 rounded-2xl cyber-frame flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-blue-200/60" />
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
            className="flex-1 py-4 rounded-2xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 3 ? (
              <>ENABLE & CONTINUE <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>CONTINUE <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        )}
        {step === 4 && (
          <button onClick={() => setStep(3)} className="w-14 h-14 rounded-2xl cyber-frame flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-blue-200/60" />
          </button>
        )}
      </div>
    </div>
  );
}