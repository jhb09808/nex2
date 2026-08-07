import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Briefcase, ChevronDown, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import InterestPicker from "@/components/nex/radar/InterestPicker";
import OpportunityTypeBar from "@/components/nex/opportunity/OpportunityTypeBar";
import { I_AM_OPTIONS, AVAILABLE_FOR_OPTIONS } from "@/components/nex/opportunity/opportunityCategories";

export default function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [provides, setProvides] = useState([]);
  const [accountType, setAccountType] = useState("individual");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [iAm, setIAm] = useState("");
  const [availableFor, setAvailableFor] = useState([]);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
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
      setLookingFor(p.looking_for || []);
      setProvides(p.provides || []);
      setAccountType(p.account_type || "individual");
      setCompanyName(p.company_name || "");
      setIndustry(p.industry || "");
      setIAm(p.i_am || "");
      setAvailableFor(p.available_for || []);
    }
  };

  const isPremium = profile?.plan === "pro" || profile?.plan === "platinum";

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
      const updates = {
        username, bio, interests, looking_for: lookingFor, provides,
        account_type: accountType, company_name: companyName, industry,
        i_am: iAm, available_for: availableFor,
      };
      await base44.entities.UserProfile.update(profile.id, updates);
      toast({ title: "Profile saved" });
      navigate("/profile");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
          {usernameError && <p className="text-red-400 text-xs mt-1.5">{usernameError}</p>}
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
            <InterestPicker selected={interests} onChange={setInterests} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">I Am</label>
          <select
            value={iAm}
            onChange={(e) => setIAm(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl glass text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          >
            <option value="">Select your role...</option>
            {I_AM_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-zinc-900">{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-cyber font-medium text-white/40 uppercase tracking-wider mb-3 block">Looking For & I Provide</label>
          <OpportunityTypeBar
            lookingFor={lookingFor}
            provides={provides}
            onChange={({ looking_for, provides }) => {
              setLookingFor(looking_for);
              setProvides(provides);
            }}
          />
        </div>

        {/* Advanced section */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass text-white/60 text-sm font-medium transition-all hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Advanced
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-4">
              <div>
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Account Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAccountType("individual")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${accountType === "individual" ? "neon-btn text-white" : "glass text-white/40"}`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setAccountType("business")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${accountType === "business" ? "neon-btn text-white" : "glass text-white/40"}`}
                  >
                    <Briefcase size={12} /> Business
                  </button>
                </div>
              </div>

              {accountType === "business" && (
                <div className="space-y-4 p-4 rounded-xl glass border border-white/5">
                  <div>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Company Name</label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company name"
                      className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Industry</label>
                    <input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Construction, Technology, Finance"
                      className="w-full px-4 py-3.5 rounded-xl glass text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Available For</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FOR_OPTIONS.map((opt) => {
                    const selected = availableFor.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setAvailableFor((prev) => selected ? prev.filter((x) => x !== opt.id) : [...prev, opt.id])}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${selected ? "bg-blue-500/20 border border-blue-400/40 text-blue-300" : "bg-white/[0.03] border border-white/5 text-white/40"}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}