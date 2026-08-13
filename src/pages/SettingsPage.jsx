import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Eye, Bell, Ban, CreditCard, ChevronRight, Radar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/nex/GlassCard";
import { useRadarSweepColor, RADAR_SWEEP_COLORS } from "@/hooks/useRadarSweepColor";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const me = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
    if (profiles.length > 0) setProfile(profiles[0]);
  };

  const { color: radarColor, changeColor } = useRadarSweepColor();

  const toggleSetting = async (key, value) => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { [key]: value });
      setProfile((p) => ({ ...p, [key]: value }));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onToggle }) => (
    <button
      onClick={() => onToggle(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? "gradient-blue" : "bg-white/10"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="px-4 pt-4 safe-top pb-8 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Privacy */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">Privacy</p>
          <div className="space-y-1">
            <GlassCard className="flex items-center justify-between !p-3.5">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/40" />
                <span className="text-white/70 text-sm">Location Sharing</span>
              </div>
              <Toggle value={!profile?.invisible_mode} onToggle={(v) => toggleSetting("invisible_mode", !v)} />
            </GlassCard>
            <GlassCard className="flex items-center justify-between !p-3.5">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-white/40" />
                <span className="text-white/70 text-sm">Invisible Mode</span>
              </div>
              <Toggle value={profile?.invisible_mode} onToggle={(v) => toggleSetting("invisible_mode", v)} />
            </GlassCard>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">Notifications</p>
          <div className="space-y-1">
            <GlassCard className="flex items-center justify-between !p-3.5">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/40" />
                <span className="text-white/70 text-sm">Push Notifications</span>
              </div>
              <Toggle value={true} onToggle={() => {}} />
            </GlassCard>
          </div>
        </div>

        {/* Radar */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">Radar</p>
          <GlassCard className="!p-3.5">
            <div className="flex items-center gap-3 mb-4">
              <Radar className="w-5 h-5 text-white/40" />
              <span className="text-white/70 text-sm">Sweep Color</span>
              <div className="ml-auto w-4 h-4 rounded-full" style={{ background: radarColor, boxShadow: `0 0 8px ${radarColor}88` }} />
            </div>
            <div className="flex flex-wrap gap-2.5">
              {RADAR_SWEEP_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => changeColor(c.value)}
                  title={c.label}
                  className={`w-9 h-9 rounded-full transition-all active:scale-90 ${radarColor === c.value ? "ring-2 ring-white/60 ring-offset-2 ring-offset-[hsl(0,0%,8%)]" : "ring-1 ring-white/10"}`}
                  style={{ background: c.value, boxShadow: radarColor === c.value ? `0 0 12px ${c.value}88` : "none" }}
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">Account</p>
          <div className="space-y-1">
            <GlassCard className="flex items-center gap-3 !p-3.5" onClick={() => navigate("/premium")}>
              <CreditCard className="w-5 h-5 text-white/40" />
              <span className="text-white/70 text-sm flex-1">Subscription</span>
              <span className="text-white/30 text-xs capitalize">{profile?.plan || "Free"}</span>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </GlassCard>
            <GlassCard className="flex items-center gap-3 !p-3.5">
              <Ban className="w-5 h-5 text-white/40" />
              <span className="text-white/70 text-sm flex-1">Blocked Users</span>
              <span className="text-white/30 text-xs">{profile?.blocked_users?.length || 0}</span>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}