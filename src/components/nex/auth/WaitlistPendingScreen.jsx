import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Clock, XCircle, CheckCircle2 } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/37125597e_NEX2.png";

const STATUS_COPY = {
  approved: { icon: CheckCircle2, tone: "#4dffb0", title: "You're approved", body: "Log out and sign back in to enter NEX2." },
  active: { icon: CheckCircle2, tone: "#4dffb0", title: "You're approved", body: "Log out and sign back in to enter NEX2." },
  waitlisted: { icon: Clock, tone: "#7fc8ff", title: "You're on the waitlist", body: "You'll get an email the moment you're approved." },
  pending: { icon: Clock, tone: "#ffb454", title: "Pending review", body: "Your request is being reviewed. Hang tight." },
  rejected: { icon: XCircle, tone: "#ff7a7a", title: "Not approved", body: "This email wasn't approved for access." },
  not_found: { icon: XCircle, tone: "#ff7a7a", title: "Not on the waitlist", body: "Join the waitlist from the home page to request access." },
};

export default function WaitlistPendingScreen({ email, message, onLogout }) {
  const [checkEmail, setCheckEmail] = useState(email || "");
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    setStatus(null);
    try {
      const res = await base44.functions.invoke("checkWaitlistApproval", { email: checkEmail.trim() });
      setStatus(res.data.status || "not_found");
    } catch {
      setStatus("not_found");
    } finally {
      setChecking(false);
    }
  };

  const info = status ? STATUS_COPY[status] || STATUS_COPY.not_found : null;

  return (
    <div className="fixed inset-0 cyber-bg flex items-center justify-center px-5 overflow-y-auto">
      <div className="w-full max-w-sm py-10 text-center">
        <img src={LOGO_URL} alt="NEX2" className="mx-auto w-24 mb-8" style={{ filter: "drop-shadow(0 0 8px rgba(90,180,255,.75))" }} />

        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(255,180,84,.12)", border: "1px solid rgba(255,180,84,.35)" }}>
          <Clock className="w-6 h-6" style={{ color: "#ffb454" }} />
        </div>

        <h1 className="font-cyber text-xl font-bold tracking-wider text-white neon-text">
          ACCOUNT NOT APPROVED
        </h1>
        <p className="mt-3 text-blue-200/60 text-sm leading-relaxed">
          {message || "Your account hasn't been approved yet. Check your waitlist status below."}
        </p>

        <div className="mt-7 text-left">
          <label className="font-chakra text-[9.5px] tracking-[0.2em] uppercase text-blue-300/70">Check your status</label>
          <div className="mt-2 flex gap-2">
            <input
              type="email"
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 h-12 px-3 rounded-xl cyber-input text-white text-[15px] outline-none"
            />
            <button
              onClick={check}
              disabled={checking || !checkEmail.trim()}
              className="h-12 px-4 rounded-xl neon-btn text-white font-cyber font-bold text-xs tracking-wider disabled:opacity-40"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "CHECK"}
            </button>
          </div>
        </div>

        {info && (
          <div className="mt-5 p-4 rounded-xl text-left" style={{ background: "rgba(8,26,54,.72)", border: `1px solid ${info.tone}40` }}>
            <div className="flex items-center gap-2">
              <info.icon className="w-4 h-4" style={{ color: info.tone }} />
              <p className="font-cyber text-sm font-bold tracking-wider" style={{ color: info.tone }}>{info.title}</p>
            </div>
            <p className="mt-2 text-blue-200/60 text-xs leading-relaxed">{info.body}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onLogout}
            className="h-12 rounded-xl text-white/80 font-cyber font-bold text-xs tracking-wider"
            style={{ background: "rgba(8,26,54,.72)", border: "1px solid rgba(105,190,255,.28)" }}
          >
            LOG OUT
          </button>
          <a href="/welcome" className="font-chakra text-[10px] tracking-[0.15em] uppercase text-blue-300/60">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}