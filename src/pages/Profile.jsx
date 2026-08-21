import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PhoneShell from "@/components/nex/PhoneShell";
import GenerativeAvatar from "@/components/nex/GenerativeAvatar";
import { ACHIEVEMENTS } from "@/components/nex/AchievementGrid";
import useOpportunityInsight from "@/hooks/useOpportunityInsight";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";
import { getUserDisplayName, getUserNumber } from "@/components/nex/userDisplay";
import ProfileDesktop from "@/pages/ProfileDesktop";
import useIsDesktop from "@/hooks/useIsDesktop";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";
const NOTCH_9 = "polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)";

const CHEVRON = (
  <svg width="8" height="13" viewBox="0 0 9 14" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M1.4 1.4L7 7l-5.6 5.6" stroke="#5f89b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const isDesktop = useIsDesktop(1200);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      // Connections are the accepted conversations; keep the stored count in
      // step so other people see the same number.
      const conversations = await base44.entities.Conversation.filter({ participants: me.id });
      setConnectionCount(conversations.length);
      if (profiles[0] && profiles[0].connections_count !== conversations.length) {
        await base44.entities.UserProfile.update(profiles[0].id, { connections_count: conversations.length });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { insight } = useOpportunityInsight(profile);

  if (isDesktop && !loading && profile) {
    return <ProfileDesktop profile={profile} connectionCount={connectionCount} />;
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const name = getUserDisplayName(profile);
  const interests = profile?.interests || [];
  const focusAreas = (profile?.provides?.length || 0) + (profile?.looking_for?.length || 0);
  const earned = ACHIEVEMENTS.filter((a) => a.check(connectionCount, profile));

  return (
    <PhoneShell title="Profile">
      <div
        className="scrollbar-hide"
        style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 1, overflowY: "auto", marginTop: 16, padding: "0 16px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* Identity */}
        <div style={{ flex: "none", padding: "22px 18px", textAlign: "center", clipPath: NOTCH_LG, background: "linear-gradient(170deg, rgba(16,44,86,.62), rgba(6,20,42,.62))", border: "1px solid rgba(105,190,255,.22)" }}>
          <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto" }}>
            <div style={{ width: "100%", height: "100%", border: "2px solid rgba(255,255,255,.2)", boxShadow: "0 0 24px rgba(90,180,255,.28)", borderRadius: "50%", overflow: "hidden", boxSizing: "border-box" }}>
              <GenerativeAvatar seed={name || "unknown"} gender={profile?.gender} isVerified={profile?.is_verified} />
            </div>
            {profile?.is_online && (
              <span style={{ position: "absolute", right: 1, bottom: 1, width: 18, height: 18, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 10px rgba(96,165,250,.8)", border: "3px solid #050810" }} />
            )}
          </div>

          <div style={{ marginTop: 14, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 21, lineHeight: 1, color: "#eaf6ff" }}>{name}</div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, letterSpacing: "0.06em", color: "#7fa9d4" }}>{getUserNumber(profile)}</div>
          {profile?.bio && (
            <div style={{ marginTop: 11, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: "#a6cbec" }}>{profile.bio}</div>
          )}

          {interests.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 16 }}>
              {interests.slice(0, 8).map((id) => (
                <span key={id} className="chip-pr">{getSubInterestName(id)}</span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(105,190,255,.16)" }}>
            <div style={{ flex: 1 }}><div className="stat-n">{interests.length}</div><div className="stat-l">Interests</div></div>
            <div style={{ width: 1, background: "rgba(105,190,255,.16)" }} />
            <div style={{ flex: 1 }}><div className="stat-n">{focusAreas}</div><div className="stat-l">Focus Areas</div></div>
            <div style={{ width: 1, background: "rgba(105,190,255,.16)" }} />
            <div style={{ flex: 1 }}><div className="stat-n">{earned.length}</div><div className="stat-l">Badges</div></div>
          </div>
        </div>

        {/* Opportunities */}
        {insight && (
          <div style={{ flex: "none", padding: 18, clipPath: NOTCH_LG, background: "linear-gradient(150deg, rgba(30,22,72,.6), rgba(8,20,44,.6))", border: "1px solid rgba(169,140,255,.28)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: "1px solid rgba(169,140,255,.45)", background: "rgba(48,32,88,.6)", color: "#c7b3ff", clipPath: NOTCH_9, flex: "none" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 1.4l1.7 4.4L15.1 7.5l-4.4 1.7L9 13.6 7.3 9.2 2.9 7.5l4.4-1.7L9 1.4z" fill="currentColor" />
                </svg>
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 13, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: "#eaf6ff" }}>Opportunities</div>
                <div style={{ marginTop: 6, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 9, lineHeight: 1, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a98cff" }}>AI-powered discovery</div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: "13px 15px", clipPath: NOTCH, background: "rgba(6,20,42,.72)", border: "1px solid rgba(105,190,255,.2)" }}>
              <div className="col-head" style={{ color: "#8fd0ff" }}>I offer</div>
              <p style={{ margin: "9px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.55, color: "#c3d8ee" }}>{insight.offer_summary}</p>
            </div>
            <div style={{ marginTop: 10, padding: "13px 15px", clipPath: NOTCH, background: "rgba(6,20,42,.72)", border: "1px solid rgba(105,190,255,.2)" }}>
              <div className="col-head" style={{ color: "#a98cff" }}>I want</div>
              <p style={{ margin: "9px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.55, color: "#c3d8ee" }}>{insight.need_summary}</p>
            </div>
            {insight.connection_pitch && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 10, padding: "13px 15px", clipPath: NOTCH, background: "rgba(24,18,58,.6)", border: "1px solid rgba(169,140,255,.24)" }}>
                <svg width="16" height="13" viewBox="0 0 18 15" fill="none" aria-hidden="true" style={{ flex: "none", marginTop: 2 }}>
                  <path d="M1 7.5h14.4M10.6 2.3l5.2 5.2-5.2 5.2" stroke="#a98cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.55, color: "#c7b3ff" }}>{insight.connection_pitch}</p>
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        <div style={{ flex: "none" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
            <span className="col-head">Achievements</span>
            <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 11, lineHeight: 1, color: "#5f89b2" }}>{earned.length}/{ACHIEVEMENTS.length}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9, marginTop: 12 }}>
            {ACHIEVEMENTS.map((a) => {
              const on = a.check(connectionCount, profile);
              const Icon = a.icon;
              return (
                <div key={a.id} className="ach" style={{ clipPath: NOTCH }} {...(on ? { "data-on": "" } : {})}>
                  {on && (
                    <svg width="12" height="10" viewBox="0 0 16 13" fill="none" aria-hidden="true" style={{ position: "absolute", top: 9, right: 9 }}>
                      <path d="M1 6.6l4.4 4.4L15 1.4" stroke="#4dffb0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <Icon className="w-[20px] h-[20px]" strokeWidth={1.4} style={{ margin: "0 auto", color: on ? "#4dffb0" : "#3f5f80" }} />
                  <div className="ach-n">{a.label}</div>
                  <div className="ach-s">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Link to="/edit-profile" className="row-link" style={{ clipPath: NOTCH }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: "1px solid rgba(120,200,255,.34)", background: "rgba(16,44,86,.5)", borderRadius: "50%", color: "#7fc8ff", flex: "none" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M11.2 1.6l3.2 3.2L5.6 13.6H2.4v-3.2L11.2 1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ flex: 1, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, letterSpacing: "0.04em" }}>Edit Profile</span>
          {CHEVRON}
        </Link>

        <Link to="/premium" className="row-link" style={{ clipPath: NOTCH }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, border: "1px solid rgba(255,196,107,.4)", background: "rgba(64,44,12,.5)", borderRadius: "50%", color: "#ffc46b", flex: "none" }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M1.6 4.6l3.8 3.2L9 2.2l3.6 5.6 3.8-3.2-1.6 9.2H3.2L1.6 4.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ flex: 1, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 14, lineHeight: 1, letterSpacing: "0.04em" }}>Premium Plans</span>
          {CHEVRON}
        </Link>
      </div>
    </PhoneShell>
  );
}
