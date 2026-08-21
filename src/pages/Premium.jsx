import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PhoneShell from "@/components/nex/PhoneShell";
import PremiumDesktop from "@/pages/PremiumDesktop";
import useIsDesktop from "@/hooks/useIsDesktop";
import useSubscribe from "@/hooks/useSubscribe";

const NOTCH = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";
const NOTCH_9 = "polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)";

// Each tier carries its own accent and glyph so the phone and desktop cards
// stay in step from one source.
export const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tone: "#8fb9e2",
    glyph: <path d="M10.4 1.4L3.6 10.4h4.2l-1 6.2 6.8-9h-4.2l1-6.2z" fill="currentColor" />,
    features: [
      { label: "1 mile radius", included: true },
      { label: "3 chats per day", included: true },
      { label: "Basic filters", included: true },
      { label: "Invisible mode", included: false },
      { label: "Analytics dashboard", included: false },
      { label: "Profile photo", included: false },
    ],
  },
  {
    name: "Plus",
    price: "$9.99",
    period: "/month",
    tone: "#5cb2ff",
    popular: true,
    glyph: (
      <>
        <path d="M9 1.4l6.4 2.4v5.4c0 4-2.7 6.6-6.4 7.4-3.7-.8-6.4-3.4-6.4-7.4V3.8L9 1.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="9" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      </>
    ),
    features: [
      { label: "10 mile radius", included: true },
      { label: "Unlimited chats", included: true },
      { label: "Advanced filters", included: true },
      { label: "Invisible mode", included: true },
      { label: "Priority placement", included: false },
      { label: "Analytics dashboard", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/month",
    tone: "#ffc46b",
    glyph: <path d="M1.6 4.6l3.8 3.2L9 2.2l3.6 5.6 3.8-3.2-1.6 9.2H3.2L1.6 4.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
    features: [
      { label: "Everything in Plus", included: true },
      { label: "20 mile radius", included: true },
      { label: "Priority placement in discovery", included: true },
      { label: "Daily profile boost", included: true },
      { label: "Analytics dashboard", included: true },
      { label: "Verified photo badge", included: false },
    ],
  },
  {
    name: "Platinum",
    price: "$1,000",
    period: "/month",
    tone: "#a98cff",
    exclusive: true,
    glyph: <path d="M9 1.6l6.4 7.4L9 16.4 2.6 9 9 1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Global radius — no limits", included: true },
      { label: "Verified photo badge", included: true },
      { label: "Platinum-only visibility mode", included: true },
      { label: "Global leaderboard access", included: true },
      { label: "Dedicated concierge support", included: true },
    ],
  },
];

export const TICK = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.2" fill="#2d7dff" />
    <path d="M4.8 8.2l2.2 2.2 4.2-4.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const CROSS = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7.2" fill="rgba(120,160,200,.16)" />
    <path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" stroke="#4a6785" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
export const SPARK = (
  <svg width="8" height="8" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M1.6 4.6l3.8 3.2L9 2.2l3.6 5.6 3.8-3.2-1.6 9.2H3.2L1.6 4.6z" fill="currentColor" />
  </svg>
);

export default function Premium() {
  const [selected, setSelected] = useState(1);
  const [currentTier, setCurrentTier] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const isDesktop = useIsDesktop(1200);
  const { subscribe, busy, error, notice } = useSubscribe({ onActivated: (plan) => setCurrentTier(plan) });

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getSubscriptionCapabilities", {});
        if (res.data?.tier) setCurrentTier(res.data.tier);
        const me = await base44.auth.me();
        const mine = await base44.entities.UserProfile.filter({ created_by_id: me.id });
        if (mine[0]) setMyProfile(mine[0]);
      } catch {}
    })();
  }, []);

  if (isDesktop) {
    return (
      <PremiumDesktop
        currentTier={currentTier || "free"}
        myProfile={myProfile}
        onSubscribe={(plan) => subscribe(plan.name)}
        busy={busy}
        error={error}
        notice={notice}
      />
    );
  }

  const plan = PLANS[selected];
  const isCurrent = currentTier === plan.name.toLowerCase();
  const payable = selected > 0 && !isCurrent;
  const ctaLabel = busy ? "Opening checkout…" : isCurrent ? "Current plan" : selected === 0 ? "Free plan" : `Subscribe to ${plan.name}`;

  const footer = (
    <div
      style={{
        position: "relative",
        flex: "none",
        zIndex: 3,
        padding: "12px 16px calc(16px + env(safe-area-inset-bottom, 0px))",
        borderTop: "1px solid rgba(105,190,255,.14)",
        background: "rgba(2,10,24,.82)",
        backdropFilter: "blur(12px)",
      }}
    >
      <button className="cta cta-plan" style={{ clipPath: NOTCH }} disabled={!payable || !!busy} onClick={() => subscribe(plan.name)}>
        <span
          aria-hidden="true"
          style={{ position: "absolute", top: -1, left: "50%", width: 70, height: 2, marginLeft: -35, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(200,225,255,.95), rgba(255,255,255,0))", filter: "blur(.5px)" }}
        />
        {payable && !busy && <span className="sheen" aria-hidden="true" />}
        <span style={{ position: "relative" }}>{ctaLabel}</span>
      </button>
      {(error || notice) && (
        <p style={{ margin: "10px 0 0", textAlign: "center", fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 11.5, lineHeight: 1.4, color: error ? "#ff8a80" : "#7de0b0" }}>
          {error || notice}
        </p>
      )}
    </div>
  );

  return (
    <PhoneShell title="Premium" back footer={footer}>
      <div
        className="scrollbar-hide"
        style={{ position: "relative", flex: 1, minHeight: 0, zIndex: 1, overflowY: "auto", marginTop: 18, padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ flex: "none", textAlign: "center", padding: "0 4px 6px" }}>
          <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 20, lineHeight: 1.2, letterSpacing: "0.02em", color: "#eaf6ff", textShadow: "0 0 20px rgba(90,180,255,.5)" }}>
            Unlock NEX2
          </div>
          <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.4, color: "#7fa9d4" }}>
            More reach, more features, more connections
          </div>
        </div>

        <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 14 }}>
          {PLANS.map((p, i) => {
            const current = currentTier === p.name.toLowerCase();
            const badged = (p.popular || p.exclusive) && !current;
            const flags = {
              ...(current ? { "data-current": "" } : {}),
              ...(p.popular ? { "data-popular": "" } : {}),
              ...(p.exclusive ? { "data-exclusive": "" } : {}),
              ...(selected === i ? { "data-sel": "" } : {}),
            };
            return (
              <button
                key={p.name}
                type="button"
                className="plan"
                aria-pressed={selected === i}
                style={{ clipPath: NOTCH_LG, textAlign: "left", cursor: "pointer" }}
                onClick={() => setSelected(i)}
                {...flags}
              >
                {p.popular && !current && (
                  <span className="plan-tag" style={{ background: "rgba(45,125,255,.9)", color: "#fff" }}>Most popular</span>
                )}
                {p.exclusive && !current && (
                  <span className="plan-tag" style={{ background: "rgba(169,140,255,.9)", color: "#160f2e" }}>{SPARK}Exclusive</span>
                )}
                {current && (
                  <span style={{ position: "absolute", top: 12, right: 12, padding: "3px 7px", border: "1px solid rgba(77,255,176,.45)", background: "rgba(20,72,52,.6)", fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 8, lineHeight: 1, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7de0b0" }}>
                    Current
                  </span>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: badged ? 8 : 0 }}>
                  <span style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, border: `1px solid ${p.tone}55`, background: `${p.tone}1f`, color: p.tone, clipPath: NOTCH_9 }}>
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">{p.glyph}</svg>
                  </span>
                  <span style={{ flex: 1, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 15, lineHeight: 1, letterSpacing: "0.03em", color: "#eaf6ff" }}>{p.name}</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 20, lineHeight: 1, color: p.tone }}>{p.price}</span>
                    <span style={{ fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 9.5, lineHeight: 1, color: "#7fa9d4" }}>{p.period}</span>
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(105,190,255,.14)" }}>
                  {p.features.map((f) => (
                    <span key={f.label} className="feat" {...(f.included ? {} : { "data-off": "" })}>
                      {f.included ? TICK : CROSS}
                      {f.label}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PhoneShell>
  );
}
