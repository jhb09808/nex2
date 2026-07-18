import React, { useState } from "react";
import { Loader2, ArrowRight, Mail, CheckCircle2, MapPin, Globe, Check, ArrowLeft } from "lucide-react";
import { appParams } from "@/lib/app-params";
import GlobalCounters from "@/components/nex/GlobalCounters";

const SESSION_KEY = "nex_access_granted";
const LOGO_URL = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/81104c4b7_29CEE08A-B9AB-4759-8C30-4B99BC19A018.png";

export function hasAccess() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export default function PasswordGate() {
  const [mode, setMode] = useState("landing"); // "landing" | "password" | "waitlist" | "check"
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Waitlist state
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const [internationalLocation, setInternationalLocation] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  // ZIP area check (landing page)
  const [zipCheck, setZipCheck] = useState("");
  const [zipResult, setZipResult] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);

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
    if (isInternational) {
      if (!internationalLocation.trim()) return;
    } else {
      if (!zipCode.trim()) return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = { email: email.trim(), is_international: isInternational };
      if (isInternational) {
        payload.international_location = internationalLocation.trim();
      } else {
        payload.zip_code = zipCode.trim();
      }
      const response = await fetch(`/api/apps/${appParams.appId}/functions/joinWaitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      } else if (data.status === "waitlisted" || data.status === "pending") {
        setError("You're on the list, but not approved yet. Check back soon!");
      } else if (data.status === "rejected") {
        setError("Your waitlist entry was not approved. Contact support if you think this is an error.");
      } else {
        setError("We couldn't find that email. Make sure it matches what you signed up with.");
      }
    } catch (err) {
      setError(`[FETCH ERROR] ${err?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleZipCheck = async (e) => {
    e.preventDefault();
    if (!zipCheck.trim()) return;
    setZipLoading(true);
    setZipResult(null);
    try {
      const response = await fetch(`/api/apps/${appParams.appId}/functions/getAreaCounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: zipCheck.trim() }),
      });
      const data = await response.json();
      setZipResult(data);
    } catch (err) {
      setZipResult({ error: "Couldn't check that ZIP. Try again." });
    } finally {
      setZipLoading(false);
    }
  };

  const Logo = () => (
    <div className="relative inline-block mb-5">
      <img src={LOGO_URL} alt="nex2" className="h-14 sm:h-16 object-contain relative z-10" />
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5), transparent 70%)" }} />
      </div>
    </div>
  );

  const BackButton = () => (
    <button
      onClick={() => { setMode("landing"); setError(""); }}
      className="flex items-center gap-1 text-white/40 text-sm hover:text-white/70 transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center px-6 bg-[hsl(0,0%,4%)] overflow-y-auto py-10">
      <div className="w-full max-w-sm">
        {/* ===== LANDING MODE ===== */}
        {mode === "landing" && (
          <div className="text-center">
            <Logo />
            <p className="text-white/50 text-sm max-w-xs mx-auto mb-7">
              Discover people nearby who share your interests. No followers needed.
            </p>

            {/* Community counters */}
            <div className="mb-6">
              <GlobalCounters />
            </div>

            {/* ZIP area check */}
            <form onSubmit={handleZipCheck} className="mb-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    value={zipCheck}
                    onChange={(e) => setZipCheck(e.target.value)}
                    placeholder="Your ZIP code"
                    inputMode="numeric"
                    maxLength={5}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={zipLoading || !zipCheck.trim()}
                  className="px-6 py-3.5 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-1 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {zipLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check"}
                </button>
              </div>
              {zipResult && !zipResult.error && (
                <p className="text-white/60 text-xs mt-2.5 text-center">
                  {zipResult.active_count > 0
                    ? `${zipResult.active_count} active member${zipResult.active_count === 1 ? "" : "s"} near you! 🎉`
                    : zipResult.waitlist_count > 0
                    ? `${zipResult.waitlist_count} on the waitlist in your area — join now!`
                    : "NEX2 isn't in your area yet. Join the waitlist to be first!"}
                </p>
              )}
              {zipResult?.error && <p className="text-red-400 text-xs mt-2.5 text-center">{zipResult.error}</p>}
              <p className="text-white/25 text-[11px] mt-2 text-center">
                NEX2 works best in dense areas — we're starting in NYC and expanding city by city.
              </p>
            </form>

            {/* Primary actions */}
            <div className="space-y-3">
              <button
                onClick={() => { setMode("waitlist"); setError(""); }}
                className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setMode("password"); setError(""); }}
                className="w-full py-4 rounded-xl bg-white/[0.06] border border-white/10 text-white font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                I already have an account
              </button>
            </div>
          </div>
        )}

        {/* ===== ACCESS CODE MODE ===== */}
        {mode === "password" && (
          <>
            <BackButton />
            <div className="text-center mb-8">
              <Logo />
              <h1 className="text-2xl font-bold text-white mb-2">Enter to continue</h1>
              <p className="text-white/40 text-sm">Enter your access code to explore.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access code"
                autoFocus
                className="w-full px-4 py-4 rounded-xl glass text-white placeholder:text-white/30 text-center text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Unlock <ArrowRight className="w-4 h-4" /></>}
              </button>
              <button
                type="button"
                onClick={() => { setMode("check"); setError(""); setEmail(""); }}
                className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors pt-1"
              >
                Already on the waitlist? <span className="text-blue-400 font-medium">Check your status</span>
              </button>
            </form>
          </>
        )}

        {/* ===== STATUS CHECK MODE ===== */}
        {mode === "check" && (
          <>
            <BackButton />
            <div className="text-center mb-8">
              <Logo />
              <h1 className="text-2xl font-bold text-white mb-2">Check your status</h1>
              <p className="text-white/40 text-sm">Enter the email you used to join the waitlist.</p>
            </div>
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Check status <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </>
        )}

        {/* ===== WAITLIST MODE ===== */}
        {mode === "waitlist" && (
          <>
            <BackButton />
            <div className="text-center mb-8">
              <Logo />
              <h1 className="text-2xl font-bold text-white mb-2">Join the waitlist</h1>
              <p className="text-white/40 text-sm">We're launching neighborhood by neighborhood. Enter your email and ZIP code to get notified.</p>
            </div>
            {waitlistDone ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white text-sm">You're on the list! When you're approved, come back to check your status.</p>
                <button
                  type="button"
                  onClick={() => { setMode("check"); setWaitlistDone(false); setEmail(""); }}
                  className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Check your status
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
                <button
                  type="button"
                  onClick={() => setIsInternational(!isInternational)}
                  className="w-full flex items-center gap-3 py-1 group"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${isInternational ? "gradient-blue border-transparent" : "border-white/20 bg-white/[0.04] group-hover:border-white/30"}`}>
                    {isInternational && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-white/60 text-sm">I live outside the US</span>
                </button>
                {isInternational && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        value={internationalLocation}
                        onChange={(e) => setInternationalLocation(e.target.value)}
                        placeholder="e.g. Lahore, Pakistan"
                        autoFocus
                        className="w-full pl-12 pr-4 py-4 rounded-xl glass text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                    <p className="text-white/30 text-xs pl-1">We'll notify you when we expand there 🌍</p>
                  </div>
                )}
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim() || (isInternational ? !internationalLocation.trim() : !zipCode.trim())}
                  className="w-full py-4 rounded-xl gradient-blue text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join waitlist <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("check"); setError(""); setEmail(""); }}
                  className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors pt-1"
                >
                  Already on the waitlist? <span className="text-blue-400 font-medium">Check your status</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}