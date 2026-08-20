import React from "react";
import { Link, useNavigate } from "react-router-dom";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import { RADAR_SWEEP_COLORS } from "@/hooks/useRadarSweepColor";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

const CHEVRON = (
  <svg width="8" height="13" viewBox="0 0 9 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 1.4L7 7l-5.6 5.6" stroke="#5f89b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICON_PIN = (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
    <path d="M8 16.8S14.4 11 14.4 6.8A6.4 6.4 0 0 0 1.6 6.8C1.6 11 8 16.8 8 16.8z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="6.7" r="2.1" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const ICON_EYE = (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <path d="M1 7s3-5.2 8-5.2S17 7 17 7s-3 5.2-8 5.2S1 7 1 7z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const ICON_BELL = (
  <svg width="17" height="18" viewBox="0 0 17 18" fill="none" aria-hidden="true">
    <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ICON_RADAR = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="2.4" fill="currentColor" />
    <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ICON_CARD = (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <rect x=".9" y=".9" width="16.2" height="12.2" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 5h16" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const ICON_BAN = (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
    <circle cx="9.5" cy="9.5" r="8.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.7 3.7l11.6 11.6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const PLAN_LABEL = { free: "Free", plus: "Plus", pro: "Pro", platinum: "Platinum" };

function Toggle({ on, onChange, label }) {
  return (
    <button className="tog" {...(on ? { "data-on": "" } : {})} aria-pressed={!!on} aria-label={label} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

function Row({ icon, label, children }) {
  return (
    <div className="set-row" style={{ clipPath: NOTCH }}>
      <span className="set-ico">{icon}</span>
      <span className="set-label">{label}</span>
      {children}
    </div>
  );
}

export default function SettingsDesktop({ profile, toggleSetting, radarColor, changeColor, blockedCount = 0 }) {
  const navigate = useNavigate();
  const activeSwatch = RADAR_SWEEP_COLORS.find((c) => c.value === radarColor);

  return (
    <DesktopShell myProfile={profile}>
      <main style={{ position: "relative", zIndex: 5, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "26px 30px 24px" }}>
        <header style={{ flex: "none", display: "flex", alignItems: "center", gap: 14 }}>
          <button className="circ" aria-label="Back" onClick={() => navigate(-1)}>
            <svg width="15" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
              <path d="M15 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,.5)" }}>Settings</h1>
        </header>

        <div className="scrollbar-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, marginTop: 24, alignContent: "start" }}>
          <section>
            <span className="col-head">Privacy</span>
            <div className="grp">
              <Row icon={ICON_PIN} label="Location Sharing">
                <Toggle on={profile?.location_sharing !== false} label="Location Sharing" onChange={(v) => toggleSetting("location_sharing", v)} />
              </Row>
              <Row icon={ICON_EYE} label="Invisible Mode">
                <Toggle on={!!profile?.invisible_mode} label="Invisible Mode" onChange={(v) => toggleSetting("invisible_mode", v)} />
              </Row>
            </div>
          </section>

          <section>
            <span className="col-head">Notifications</span>
            <div className="grp">
              <Row icon={ICON_BELL} label="Push Notifications">
                <Toggle on={profile?.push_notifications !== false} label="Push Notifications" onChange={(v) => toggleSetting("push_notifications", v)} />
              </Row>
            </div>
          </section>

          <section>
            <span className="col-head">Radar</span>
            <div className="grp">
              <div className="set-row" style={{ clipPath: NOTCH, flexDirection: "column", alignItems: "stretch", gap: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className="set-ico">{ICON_RADAR}</span>
                  <span className="set-label">Sweep Color</span>
                  <span style={{ flex: "none", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>
                    {activeSwatch?.name || ""}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(105,190,255,.14)" }}>
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
                <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>{PLAN_LABEL[profile?.plan] || "Free"}</span>
                {CHEVRON}
              </Link>
              <div className="set-row" style={{ clipPath: NOTCH }}>
                <span className="set-ico">{ICON_BAN}</span>
                <span className="set-label">Blocked Users</span>
                <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>{blockedCount}</span>
                {CHEVRON}
              </div>
            </div>
          </section>
        </div>
      </main>
    </DesktopShell>
  );
}
