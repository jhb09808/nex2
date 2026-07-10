import React, { useState } from "react";
import { Lock, Loader2, ArrowRight, Mail, CheckCircle2, MapPin } from "lucide-react";
import { appParams } from "@/lib/app-params";

const SESSION_KEY = "nex_access_granted";

export function hasAccess() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export default function PasswordGate() {
  const [mode, setMode] = useState("password"); // "password" | "waitlist" | "check"
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Waitlist state
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/apps/${appParams.appId}/functions/checkAccessPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (data.valid) {
        sessionStorage.setItem(SESSION_KEY, "true");
        window.location.reload();
      } else {
        setError(data.error ? `[${response.status}] ${data.error}` : "Incorrect password. Try again.");
      }
    } catch (err) {
      setError(`[FETCH ERROR] ${err?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!zipCode.trim()) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/apps/${appParams.appId}/functions/joinWaitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), zip_code: zipCode.trim() }),
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (response.ok && data?.success) {
        setWaitlistDone(true);
      } else {
        setError(data?.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(`[FETCH ERROR] ${err?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckApproval = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/apps/${appParams.appId}/functions/checkWaitlistApproval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (data.approved) {
        sessionStorage.setItem(SESSION_KEY, "true");
        window.location.reload();
      } else if (data.status === "pending") {
        setError("You're on the list, but not approved yet. Check back soon!");
      } else {
        setError("We couldn't find that email. Make sure it matches what you signed up with.");
      }
    } catch (err) {
      setError(`[FETCH ERROR] ${err?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-6 bg-[hsl(0,0%,4%)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-8">
            <img
              src="https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/f4c72f83e_EDDD7796-9A98-4FF7-996F-D8D601E854B6.png"
              alt="nexa"
              className="h-28 sm:h-32 object-contain relative z-10"
            />
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)" }} />
            </div>
          </div>
          {mode === "password" ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Enter to continue</h1>
              <p className="text-white/40 text-sm">This site is invite-only. Enter the access code to explore.</p>
            </>
          ) : mode === "check" ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Check your status</h1>
              <p className="text-white/40 text-sm">Enter the email you used to join the waitlist to see if you've been approved.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Join the waitlist</h1>
              <p className="text-white/40 text-sm">We're launching neighborhood by neighborhood. Enter your email and ZIP code so we can notify you when NEX2 goes live in your area.</p>
            </>
          )}
        </div>

        {mode === "password" ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access code"
                autoFocus
                className="w-full px-4 py-4 rounded-xl glass text-white placeholder:text-white/30 text-center text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Unlock <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode("waitlist"); setError(""); }}
              className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors pt-1"
            >
              Don't have a code? <span className="text-blue-400 font-medium">Join the waitlist</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("check"); setError(""); setEmail(""); }}
              className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              Already on the waitlist? <span className="text-blue-400 font-medium">Check your status</span>
            </button>
          </form>
        ) : mode === "check" ? (
          <form onSubmit={handleCheckApproval} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoFocus
                className="w-full pl-12 pr-4 py-4 rounded-xl glass text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {error && <p className="text-amber-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Check status <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode("password"); setError(""); setEmail(""); }}
              className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors pt-1"
            >
              Have a code? <span className="text-blue-400 font-medium">Enter access code</span>
            </button>
          </form>
        ) : waitlistDone ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-white text-sm">You're on the list! When you're approved, come back here to check your status.</p>
            <button
              type="button"
              onClick={() => { setMode("check"); setWaitlistDone(false); setEmail(""); }}
              className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Check your status
            </button>
            <button
              type="button"
              onClick={() => { setMode("password"); setWaitlistDone(false); setEmail(""); setZipCode(""); }}
              className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              Have a code? <span className="text-blue-400 font-medium">Enter access code</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleWaitlist} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoFocus
                className="w-full pl-12 pr-4 py-4 rounded-xl glass text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="ZIP code"
                inputMode="numeric"
                maxLength={5}
                className="w-full pl-12 pr-4 py-4 rounded-xl glass text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email.trim() || !zipCode.trim()}
              className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Join waitlist <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode("password"); setError(""); }}
              className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors pt-1"
            >
              Have a code? <span className="text-blue-400 font-medium">Enter access code</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("check"); setError(""); setEmail(""); }}
              className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              Already on the waitlist? <span className="text-blue-400 font-medium">Check your status</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}