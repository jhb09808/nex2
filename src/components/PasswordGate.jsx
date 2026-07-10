import React, { useState } from "react";
import { Lock, Loader2, ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { appParams } from "@/lib/app-params";

const SESSION_KEY = "nex_access_granted";

export function hasAccess() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export default function PasswordGate() {
  const [mode, setMode] = useState("password"); // "password" | "waitlist"
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Waitlist state
  const [email, setEmail] = useState("");
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
        setError("Incorrect password. Try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/apps/${appParams.appId}/functions/joinWaitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setWaitlistDone(true);
      } else {
        setError(data.error || "Something went wrong. Try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Try again.");
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
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Join the waitlist</h1>
              <p className="text-white/40 text-sm">Don't have a code? Enter your email and we'll let you in soon.</p>
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
          </form>
        ) : waitlistDone ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-white text-sm">You're on the list! We'll reach out soon.</p>
            <button
              type="button"
              onClick={() => { setMode("password"); setWaitlistDone(false); setEmail(""); }}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Back to access code
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

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email.trim()}
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
          </form>
        )}
      </div>
    </div>
  );
}