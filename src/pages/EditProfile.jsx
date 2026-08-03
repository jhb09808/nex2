import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import InterestPicker from "@/components/nex/radar/InterestPicker";
import { MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";

export default function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const me = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      setUsername(p.username || "");
      setBio(p.bio || "");
      setInterests(p.interests || []);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const usernameChanged = username !== (profile.username || "");
      if (isPremium && usernameChanged && username.trim().length >= 3) {
        const existing = await base44.entities.UserProfile.filter({ username: username.trim() });
        if (existing.length > 0) {
          setUsernameError("Username taken — try another");
          setSaving(false);
          return;
        }
      }
      setUsernameError("");
      const updates = { username, bio, interests };
      await base44.entities.UserProfile.update(profile.id, updates);
      toast({ title: "Profile saved" });
      navigate("/profile");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (newInterests) => {
    setInterests(newInterests);
  };

  const isPremium = profile?.plan === "pro" || profile?.plan === "platinum";

  return (
    <div className="px-4 pt-4 safe-top pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl gradient-blue text-white text-sm font-semibold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Username</label>
          {isPremium ? (
            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
              className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm"
            />
          ) : (
            <div className="w-full px-4 py-3.5 rounded-xl glass text-white/30 text-sm flex items-center gap-2">
              <span className="text-white/50">{username}</span>
              <span className="text-white/20 text-xs">— Custom usernames are a Pro feature</span>
            </div>
          )}
          {usernameError && (
            <p className="text-red-400 text-xs mt-1.5">{usernameError}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 block">Interests</label>
          <div className="h-[50vh]">
            <InterestPicker
              selected={interests}
              onChange={toggleInterest}
            />
          </div>
        </div>
      </div>
    </div>
  );
}