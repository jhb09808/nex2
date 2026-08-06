import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Briefcase, ToggleLeft, ToggleRight, ChevronDown, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import InterestPicker from "@/components/nex/radar/InterestPicker";
import OpportunityTypeBar from "@/components/nex/opportunity/OpportunityTypeBar";
import { I_AM_OPTIONS, AVAILABLE_FOR_OPTIONS, HIRING_EMPLOYMENT_TYPES, HIRING_WORK_MODES } from "@/components/nex/opportunity/opportunityCategories";
import { MAX_INTEREST_SELECTIONS } from "@/components/nex/radar/constants";

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
  const [hiringModeEnabled, setHiringModeEnabled] = useState(false);
  const [hiringOpenPositions, setHiringOpenPositions] = useState("");
  const [hiringEmploymentType, setHiringEmploymentType] = useState("full_time");
  const [hiringWorkMode, setHiringWorkMode] = useState("on_site");
  const [hiringDesiredSkills, setHiringDesiredSkills] = useState("");
  const [hiringCompensationMin, setHiringCompensationMin] = useState("");
  const [hiringCompensationMax, setHiringCompensationMax] = useState("");
  const [hiringImmediateStart, setHiringImmediateStart] = useState(false);
  const [fundingModeEnabled, setFundingModeEnabled] = useState(false);
  const [fundingAmountRequested, setFundingAmountRequested] = useState("");
  const [fundingPurpose, setFundingPurpose] = useState("");
  const [fundingTimeline, setFundingTimeline] = useState("");
  const [fundingProjectDescription, setFundingProjectDescription] = useState("");
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
      setHiringModeEnabled(p.hiring_mode_enabled || false);
      setHiringOpenPositions(p.hiring_open_positions || "");
      setHiringEmploymentType(p.hiring_employment_type || "full_time");
      setHiringWorkMode(p.hiring_work_mode || "on_site");
      setHiringDesiredSkills((p.hiring_desired_skills || []).join(", "));
      setHiringCompensationMin(p.hiring_compensation_min || "");
      setHiringCompensationMax(p.hiring_compensation_max || "");
      setHiringImmediateStart(p.hiring_immediate_start || false);
      setFundingModeEnabled(p.funding_mode_enabled || false);
      setFundingAmountRequested(p.funding_amount_requested || "");
      setFundingPurpose(p.funding_purpose || "");
      setFundingTimeline(p.funding_timeline || "");
      setFundingProjectDescription(p.funding_project_description || "");
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
      const updates = {
        username, bio, interests, looking_for: lookingFor, provides,
        account_type: accountType, company_name: companyName, industry,
        i_am: iAm, available_for: availableFor,
        hiring_mode_enabled: hiringModeEnabled,
        hiring_open_positions: hiringOpenPositions,
        hiring_employment_type: hiringEmploymentType,
        hiring_work_mode: hiringWorkMode,
        hiring_desired_skills: hiringDesiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        hiring_compensation_min: hiringCompensationMin ? Number(hiringCompensationMin) : null,
        hiring_compensation_max: hiringCompensationMax ? Number(hiringCompensationMax) : null,
        hiring_immediate_start: hiringImmediateStart,
        funding_mode_enabled: fundingModeEnabled,
        funding_amount_requested: fundingAmountRequested ? Number(fundingAmountRequested.replace(/[^0-9]/g, "")) : null,
        funding_purpose: fundingPurpose,
        funding_timeline: fundingTimeline,
        funding_project_description: fundingProjectDescription,
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

        {/* I AM */}
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

        {/* Looking For / I Provide */}
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
              {/* Account Type */}
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

              {/* Business fields (shown when business) */}
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

              {/* AVAILABLE FOR */}
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

        {/* Hiring Mode */}
        <div className="rounded-xl glass border border-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Hiring Mode</p>
              <p className="text-[10px] text-white/40">Let candidates discover your open positions</p>
            </div>
            <button onClick={() => setHiringModeEnabled(!hiringModeEnabled)}>
              {hiringModeEnabled
                ? <ToggleRight size={32} className="text-blue-400" />
                : <ToggleLeft size={32} className="text-white/30" />}
            </button>
          </div>
          {hiringModeEnabled && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Open Positions</label>
                <input value={hiringOpenPositions} onChange={(e) => setHiringOpenPositions(e.target.value)} placeholder="e.g. Sales Representative" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Employment Type</label>
                  <select value={hiringEmploymentType} onChange={(e) => setHiringEmploymentType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 focus:border-blue-400/40 focus:outline-none">
                    {HIRING_EMPLOYMENT_TYPES.map((t) => <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Work Mode</label>
                  <select value={hiringWorkMode} onChange={(e) => setHiringWorkMode(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 focus:border-blue-400/40 focus:outline-none">
                    {HIRING_WORK_MODES.map((t) => <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Desired Skills (comma-separated)</label>
                <input value={hiringDesiredSkills} onChange={(e) => setHiringDesiredSkills(e.target.value)} placeholder="e.g. B2B Sales, Cold Calling" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Comp Min ($)</label>
                  <input value={hiringCompensationMin} onChange={(e) => setHiringCompensationMin(e.target.value)} placeholder="50000" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Comp Max ($)</label>
                  <input value={hiringCompensationMax} onChange={(e) => setHiringCompensationMax(e.target.value)} placeholder="80000" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hiringImmediateStart} onChange={(e) => setHiringImmediateStart(e.target.checked)} className="rounded" />
                <span className="text-[11px] text-white/60">Immediate start available</span>
              </label>
            </div>
          )}
        </div>

        {/* Funding Mode */}
        <div className="rounded-xl glass border border-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Funding Mode</p>
              <p className="text-[10px] text-white/40">Post a funding request for lenders to discover</p>
            </div>
            <button onClick={() => setFundingModeEnabled(!fundingModeEnabled)}>
              {fundingModeEnabled
                ? <ToggleRight size={32} className="text-blue-400" />
                : <ToggleLeft size={32} className="text-white/30" />}
            </button>
          </div>
          {fundingModeEnabled && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Amount Requested ($)</label>
                <input value={fundingAmountRequested} onChange={(e) => setFundingAmountRequested(e.target.value)} placeholder="100000000" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Purpose</label>
                <input value={fundingPurpose} onChange={(e) => setFundingPurpose(e.target.value)} placeholder="e.g. Construction Loan" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Timeline</label>
                <input value={fundingTimeline} onChange={(e) => setFundingTimeline(e.target.value)} placeholder="e.g. Within 60 days" className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-cyber uppercase tracking-wider text-white/40 mb-1.5 block">Project Description</label>
                <textarea value={fundingProjectDescription} onChange={(e) => setFundingProjectDescription(e.target.value)} rows={2} placeholder="Describe your project..." className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none resize-none" />
              </div>
            </div>
          )}
        </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}