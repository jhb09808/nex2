import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuraAvatar from "@/components/nex/aura/AuraAvatar";
import AuraPickerSheet from "@/components/nex/aura/AuraPickerSheet";
import PhoneShell from "@/components/nex/PhoneShell";
import { useRadarSweepColor, RADAR_SWEEP_COLORS } from "@/hooks/useRadarSweepColor";
import SettingsDesktop from "@/pages/SettingsDesktop";
import useIsDesktop from "@/hooks/useIsDesktop";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

const CHEVRON = (
  <svg width="8" height="13" viewBox="0 0 9 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 1.4L7 7l-5.6 5.6" stroke="#5f89b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICON_PIN = (
  <svg width="15" height="17" viewBox="0 0 16 18" fill="none" aria-hidden="true">
    <path d="M8 16.8S14.4 11 14.4 6.8A6.4 6.4 0 0 0 1.6 6.8C1.6 11 8 16.8 8 16.8z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="6.7" r="2.1" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const ICON_EYE = (
  <svg width="17" height="13" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <path d="M1 7s3-5.2 8-5.2S17 7 17 7s-3 5.2-8 5.2S1 7 1 7z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const ICON_BELL = (
  <svg width="16" height="17" viewBox="0 0 17 18" fill="none" aria-hidden="true">
    <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ICON_RADAR = (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="2.4" fill="currentColor" />
    <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ICON_CARD = (
  <svg width="17" height="13" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <rect x=".9" y=".9" width="16.2" height="12.2" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 5h16" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const ICON_BAN = (
  <svg width="17" height="17" viewBox="0 0 19 19" fill="none" aria-hidden="true">
    <circle cx="9.5" cy="9.5" r="8.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.7 3.7l11.6 11.6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const PLAN_LABEL = { free: "Free", plus: "Plus", pro: "Pro", platinum: "Platinum" };
const META = { fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, lineHeight: 1, color: "#7fa9d4" };

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [showAura, setShowAura] = useState(false);
  const isDesktop = useIsDesktop(1200);

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
    try {
      await base44.entities.UserProfile.update(profile.id, { [key]: value });
      setProfile((p) => ({ ...p, [key]: value }));
    } catch (e) {
      console.error(e);
    }
  };

  const blockedCount = profile?.blocked_users?.length || 0;
  const activeSwatch = RADAR_SWEEP_COLORS.find((c) => c.value === radarColor);

  if (isDesktop && profile) {
    return (
      <SettingsDesktop
        profile={profile}
        toggleSetting={toggleSetting}
        radarColor={radarColor}
        changeColor={changeColor}
        blockedCount={blockedCount}
      />
    );
  }

  const Toggle = ({ on, onChange, label }) => (
    <button className="tog" {...(on ? { "data-on": "" } : {})} aria-pressed={!!on} aria-label={label} onClick={() => onChange(!on)}>
      <i />
    </button>
  );

  return (
    <PhoneShell title="Settings" back>
      <div
        className="scrollbar-hide"
        style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 1, overflowY: "auto", marginTop: 18, padding: "0 16px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 20 }}
      >
        <section>
          <span className="col-head">Profile picture</span>
          <div className="grp">
            <button
              onClick={() => setShowAura(true)}
              className="set-row"
              style={{ clipPath: NOTCH, width: "100%", textAlign: "left", cursor: "pointer" }}
            >
              <span style={{ flex: "none", width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(120,200,255,.34)", boxSizing: "border-box" }}>
                <AuraAvatar profile={profile} animated={false} />
              </span>
              <span className="set-label">Your Aura</span>
              <span style={META}>Preview · Refresh</span>
              {CHEVRON}
            </button>
          </div>
        </section>

        <section>
          <span className="col-head">Privacy</span>
          <div className="grp">
            <div className="set-row" style={{ clipPath: NOTCH }}>
              <span className="set-ico">{ICON_PIN}</span>
              <span className="set-label">Location Sharing</span>
              <Toggle on={profile?.location_sharing !== false} label="Location Sharing" onChange={(v) => toggleSetting("location_sharing", v)} />
            </div>
            <div className="set-row" style={{ clipPath: NOTCH }}>
              <span className="set-ico">{ICON_EYE}</span>
              <span className="set-label">Invisible Mode</span>
              <Toggle on={!!profile?.invisible_mode} label="Invisible Mode" onChange={(v) => toggleSetting("invisible_mode", v)} />
            </div>
          </div>
        </section>

        <section>
          <span className="col-head">Notifications</span>
          <div className="grp">
            <div className="set-row" style={{ clipPath: NOTCH }}>
              <span className="set-ico">{ICON_BELL}</span>
              <span className="set-label">Push Notifications</span>
              <Toggle on={profile?.push_notifications !== false} label="Push Notifications" onChange={(v) => toggleSetting("push_notifications", v)} />
            </div>
          </div>
        </section>

        <section>
          <span className="col-head">Radar</span>
          <div className="grp">
            <div className="set-row" style={{ clipPath: NOTCH, flexDirection: "column", alignItems: "stretch", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span className="set-ico">{ICON_RADAR}</span>
                <span className="set-label">Sweep Color</span>
                <span style={{ ...META, flex: "none" }}>{activeSwatch?.name || ""}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(105,190,255,.14)" }}>
                {RADAR_SWEEP_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className="sw"
                    aria-label={c.name}
                    title={c.name}
                    {...(c.value === radarColor ? { "data-on": "" } : {})}
                    style={{ background: c.value, color: c.value }}
                    onClick={() => changeColor(c.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <span className="col-head">Account</span>
          <div className="grp">
            <Link to="/premium" className="set-row" style={{ clipPath: NOTCH }}>
              <span className="set-ico">{ICON_CARD}</span>
              <span className="set-label">Subscription</span>
              <span style={META}>{PLAN_LABEL[profile?.plan] || "Free"}</span>
              {CHEVRON}
            </Link>
            <div className="set-row" style={{ clipPath: NOTCH }}>
              <span className="set-ico">{ICON_BAN}</span>
              <span className="set-label">Blocked Users</span>
              <span style={META}>{blockedCount}</span>
              {CHEVRON}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showAura && profile && (
          <AuraPickerSheet
            profile={profile}
            onClose={() => setShowAura(false)}
            onSave={(variant) => toggleSetting("aura_variant", variant)}
          />
        )}
      </AnimatePresence>
    </PhoneShell>
  );
}