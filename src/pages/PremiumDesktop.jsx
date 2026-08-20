import React from "react";
import { useNavigate } from "react-router-dom";
import DesktopShell from "@/components/nex/desktop/DesktopShell";
import { PLANS } from "@/pages/Premium";

const NOTCH_SM = "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";
const NOTCH_10 = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

// The design gives each tier its own accent.
const TONE = { Free: "#8fb9e2", Plus: "#5cb2ff", Pro: "#ffc46b", Platinum: "#a98cff" };

const TICK = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.2" fill="#2d7dff" />
    <path d="M4.8 8.2l2.2 2.2 4.2-4.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CROSS = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.2" fill="rgba(120,160,200,.16)" />
    <path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" stroke="#4a6785" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const SPARK = (
  <svg width="9" height="9" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M1.6 4.6l3.8 3.2L9 2.2l3.6 5.6 3.8-3.2-1.6 9.2H3.2L1.6 4.6z" fill="currentColor" />
  </svg>
);

export default function PremiumDesktop({ currentTier = "free", myProfile, onSubscribe }) {
  const navigate = useNavigate();

  return (
    <DesktopShell myProfile={myProfile}>
      <main style={{ position: "relative", zIndex: 5, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "26px 30px 24px" }}>
        <header style={{ flex: "none", display: "flex", alignItems: "center", gap: 14 }}>
          <button className="circ" aria-label="Back" onClick={() => navigate(-1)}>
            <svg width="15" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
              <path d="M15 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 30, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase", textShadow: "0 0 20px rgba(90,180,255,.5)" }}>Unlock NEX2</h1>
            <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 13, lineHeight: 1.4, color: "#7fa9d4" }}>More reach, more features, more connections</div>
          </div>
        </header>

        <div className="scrollbar-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 26, alignContent: "start", alignItems: "stretch" }}>
          {PLANS.map((plan) => {
            const tone = TONE[plan.name] || "#8fb9e2";
            const isCurrent = currentTier === plan.name.toLowerCase();
            const Icon = plan.icon;
            const flags = {
              ...(isCurrent ? { "data-current": "" } : {}),
              ...(plan.popular ? { "data-popular": "" } : {}),
              ...(plan.exclusive ? { "data-exclusive": "" } : {}),
            };
            return (
              <div key={plan.name} className="plan" style={{ clipPath: NOTCH_LG, animation: "nxrise .38s cubic-bezier(.16,1,.3,1)" }} {...flags}>
                {plan.popular && !isCurrent && (
                  <span className="plan-tag" style={{ background: "rgba(45,125,255,.9)", color: "#fff" }}>Most popular</span>
                )}
                {plan.exclusive && !isCurrent && (
                  <span className="plan-tag" style={{ background: "rgba(169,140,255,.9)", color: "#160f2e" }}>{SPARK}Exclusive</span>
                )}
                {isCurrent && (
                  <span style={{ position: "absolute", top: 14, right: 14, padding: "4px 8px", border: "1px solid rgba(77,255,176,.45)", background: "rgba(20,72,52,.6)", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 8.5, lineHeight: 1, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7de0b0" }}>Current</span>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: (plan.popular || plan.exclusive) && !isCurrent ? 10 : 0 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, border: `1px solid ${tone}55`, background: `${tone}1f`, color: tone, clipPath: NOTCH_10, flex: "none" }}>
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.4} />
                  </span>
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 16, lineHeight: 1, letterSpacing: "0.03em", color: "#eaf6ff" }}>{plan.name}</span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 16 }}>
                  <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 27, lineHeight: 1, letterSpacing: "-0.01em", color: tone }}>{plan.price}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, lineHeight: 1, color: "#7fa9d4" }}>{plan.period}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(105,190,255,.14)" }}>
                  {plan.features.map((f) => (
                    <span key={f.label} className="feat" {...(f.included ? {} : { "data-off": "" })}>
                      {f.included ? TICK : CROSS}
                      {f.label}
                    </span>
                  ))}
                </div>

                <div style={{ flex: 1 }} />

                {isCurrent ? (
                  <button className="pbtn" style={{ clipPath: NOTCH_SM }} disabled>Current plan</button>
                ) : (
                  <button
                    className="pbtn"
                    style={{ clipPath: NOTCH_SM }}
                    {...(plan.popular ? {} : { "data-flat": "" })}
                    onClick={() => onSubscribe?.(plan)}
                  >
                    Subscribe to {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </DesktopShell>
  );
}
