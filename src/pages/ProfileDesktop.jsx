import React from "react";
import { Link } from "react-router-dom";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { ACHIEVEMENTS } from "@/components/nex/AchievementGrid";
import useOpportunityInsight from "@/hooks/useOpportunityInsight";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";
import { getUserDisplayName, getUserNumber } from "@/components/nex/userDisplay";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";
const NOTCH_9 = "polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)";

const CHEVRON = (
  <svg width="8" height="13" viewBox="0 0 9 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 1.4L7 7l-5.6 5.6" stroke="#5f89b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLAN_LABEL = { free: "Free", plus: "Plus", pro: "Pro", platinum: "Platinum" };

export default function ProfileDesktop({ profile, connectionCount }) {
  const { insight } = useOpportunityInsight(profile);
  const name = getUserDisplayName(profile);
  const interests = profile?.interests || [];
  const focusAreas = (profile?.provides?.length || 0) + (profile?.looking_for?.length || 0);
  const earned = ACHIEVEMENTS.filter((a) => a.check(connectionCount, profile));

  return (
    <DesktopShell myProfile={profile}>
      <main style={{ position: "relative", zIndex: 5, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "26px 30px 24px" }}>
        <header style={{ flex: "none", display: "flex", alignItems: "center", gap: 20 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,.5)" }}>Profile</h1>
        </header>

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 26, marginTop: 22 }}>
          {/* Identity column */}
          <section style={{ flex: "none", width: 360, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
            <div style={{ flex: "none", padding: "26px 22px", textAlign: "center", clipPath: NOTCH_LG, background: "linear-gradient(170deg, rgba(16,44,86,.62), rgba(6,20,42,.62))", border: "1px solid rgba(105,190,255,.22)", animation: "nxrise .38s cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ position: "relative", width: 112, height: 112, margin: "0 auto" }}>
                <div style={{ width: "100%", height: "100%", border: "2px solid rgba(255,255,255,.2)", boxShadow: "0 0 26px rgba(90,180,255,.28)", borderRadius: "50%", overflow: "hidden", boxSizing: "border-box" }}>
                  <GenerativeAvatar seed={name || "unknown"} gender={profile?.gender} isVerified={profile?.is_verified} />
                </div>
                {profile?.is_online && (
                  <span style={{ position: "absolute", right: 2, bottom: 2, width: 20, height: 20, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 10px rgba(96,165,250,.8)", border: "3px solid #050810" }} />
                )}
              </div>

              <div style={{ marginTop: 16, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 24, lineHeight: 1, letterSpacing: "0.01em", color: "#eaf6ff" }}>{name}</div>
              <div style={{ marginTop: 9, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11.5, lineHeight: 1, letterSpacing: "0.06em", color: "#7fa9d4" }}>{getUserNumber(profile)}</div>
              {profile?.bio && (
                <div style={{ marginTop: 12, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13.5, lineHeight: 1.5, color: "#a6cbec" }}>{profile.bio}</div>
              )}

              {interests.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, marginTop: 18 }}>
                  {interests.slice(0, 8).map((id) => (
                    <span key={id} className="chip-pr">{getSubInterestName(id)}</span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(105,190,255,.16)" }}>
                <div style={{ flex: 1 }}><div className="stat-n">{interests.length}</div><div className="stat-l">Interests</div></div>
                <div style={{ width: 1, background: "rgba(105,190,255,.16)" }} />
                <div style={{ flex: 1 }}><div className="stat-n">{focusAreas}</div><div className="stat-l">Focus areas</div></div>
                <div style={{ width: 1, background: "rgba(105,190,255,.16)" }} />
                <div style={{ flex: 1 }}><div className="stat-n">{earned.length}</div><div className="stat-l">Badges</div></div>
              </div>
            </div>

            <Link to="/edit-profile" className="row-link" style={{ clipPath: NOTCH }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, border: "1px solid rgba(120,200,255,.34)", background: "rgba(16,44,86,.5)", borderRadius: "50%", color: "#7fc8ff", flex: "none" }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M11.2 1.6l3.2 3.2L5.6 13.6H2.4v-3.2L11.2 1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ flex: 1, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, letterSpacing: "0.04em" }}>Edit Profile</span>
              {CHEVRON}
            </Link>

            <Link to="/premium" className="row-link" style={{ clipPath: NOTCH }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, border: "1px solid rgba(255,196,107,.4)", background: "rgba(64,44,12,.5)", borderRadius: "50%", color: "#ffc46b", flex: "none" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M1.6 4.6l3.8 3.2L9 2.2l3.6 5.6 3.8-3.2-1.6 9.2H3.2L1.6 4.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ flex: 1, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, letterSpacing: "0.04em" }}>Premium Plans</span>
              <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#7fa9d4" }}>{PLAN_LABEL[profile?.plan] || "Free"}</span>
              {CHEVRON}
            </Link>
          </section>

          {/* Opportunities + achievements */}
          <section className="scrollbar-hide" style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18, paddingRight: 2 }}>
            {insight && (
              <div style={{ flex: "none", padding: "20px 22px", clipPath: NOTCH_LG, background: "linear-gradient(150deg, rgba(30,22,72,.6), rgba(8,20,44,.6))", border: "1px solid rgba(169,140,255,.28)", animation: "nxrise .42s cubic-bezier(.16,1,.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, border: "1px solid rgba(169,140,255,.45)", background: "rgba(48,32,88,.6)", color: "#c7b3ff", clipPath: NOTCH_9, flex: "none" }}>
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M9 1.4l1.7 4.4L15.1 7.5l-4.4 1.7L9 13.6 7.3 9.2 2.9 7.5l4.4-1.7L9 1.4z" fill="currentColor" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 14, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: "#eaf6ff" }}>Opportunities</div>
                    <div style={{ marginTop: 7, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a98cff" }}>AI-powered discovery</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
                  <div style={{ padding: "14px 16px", clipPath: NOTCH, background: "rgba(6,20,42,.72)", border: "1px solid rgba(105,190,255,.2)" }}>
                    <div className="col-head" style={{ color: "#8fd0ff" }}>I offer</div>
                    <p style={{ margin: "10px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.55, color: "#c3d8ee" }}>{insight.offer_summary}</p>
                  </div>
                  <div style={{ padding: "14px 16px", clipPath: NOTCH, background: "rgba(6,20,42,.72)", border: "1px solid rgba(105,190,255,.2)" }}>
                    <div className="col-head" style={{ color: "#a98cff" }}>I want</div>
                    <p style={{ margin: "10px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.55, color: "#c3d8ee" }}>{insight.need_summary}</p>
                  </div>
                </div>

                {insight.connection_pitch && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 12, padding: "14px 16px", clipPath: NOTCH, background: "rgba(24,18,58,.6)", border: "1px solid rgba(169,140,255,.24)" }}>
                    <svg width="17" height="14" viewBox="0 0 18 15" fill="none" aria-hidden="true" style={{ flex: "none", marginTop: 2 }}>
                      <path d="M1 7.5h14.4M10.6 2.3l5.2 5.2-5.2 5.2" stroke="#a98cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.55, color: "#c7b3ff" }}>{insight.connection_pitch}</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ flex: "none" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                <span className="col-head">Achievements</span>
                <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#5f89b2" }}>{earned.length}/{ACHIEVEMENTS.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }}>
                {ACHIEVEMENTS.map((a) => {
                  const on = a.check(connectionCount, profile);
                  const Icon = a.icon;
                  return (
                    <div key={a.id} className="ach" style={{ clipPath: NOTCH }} {...(on ? { "data-on": "" } : {})}>
                      {on && (
                        <svg width="14" height="11" viewBox="0 0 16 13" fill="none" aria-hidden="true" style={{ position: "absolute", top: 11, right: 11 }}>
                          <path d="M1 6.6l4.4 4.4L15 1.4" stroke="#4dffb0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <Icon className="w-[22px] h-[22px]" strokeWidth={1.4} style={{ margin: "0 auto", color: on ? "#4dffb0" : "#3f5f80" }} />
                      <div className="ach-n">{a.label}</div>
                      <div className="ach-s">{a.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </DesktopShell>
  );
}
