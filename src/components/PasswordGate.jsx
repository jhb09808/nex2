import React, { useState } from "react";
import { Loader2, ArrowRight, ArrowLeft, Mail, CheckCircle2, MapPin, Globe, Check, Lock, Building2 } from "lucide-react";
import { appParams } from "@/lib/app-params";
import GlobalCounters from "@/components/nex/GlobalCounters";
import CyberRadar from "@/components/nex/CyberRadar";
import { base44 } from "@/api/base44Client";
import GoogleIcon from "@/components/GoogleIcon";
import Logo from "@/components/nex/Logo";

const SESSION_KEY = "nex_access_granted";

export function hasAccess() {
  return localStorage.getItem(SESSION_KEY) === "true";
}

export default function PasswordGate() {
  const [mode, setMode] = useState("landing");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const [internationalLocation, setInternationalLocation] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  const [zipCheck, setZipCheck] = useState("");
  const [zipResult, setZipResult] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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
        localStorage.setItem(SESSION_KEY, "true");
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
        localStorage.setItem(SESSION_KEY, "true");
        window.location.href = `/approved?has_account=${data.has_account}`;
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(loginEmail, loginPassword);
      localStorage.setItem(SESSION_KEY, "true");
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    localStorage.setItem(SESSION_KEY, "true");
    base44.auth.loginWithProvider("google", "/");
  };

  const CyberHeader = () => (
    <div className="flex items-center justify-between">
      <Logo size="md" />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 ai-dot" />
        <span className="text-[10px] font-cyber font-semibold text-green-400 tracking-widest">EARLY ACCESS</span>
      </div>
    </div>
  );

  const BackButton = () => (
    <button
      onClick={() => { setMode("landing"); setError(""); }}
      className="flex items-center gap-1 text-blue-200/40 text-xs hover:text-blue-200/70 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> BACK
    </button>
  );

  return (
    <div className="fixed inset-0 cyber-bg flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md cyber-frame cyber-corners relative rounded-2xl p-6 sm:p-8">
        {/* ===== LANDING MODE ===== */}
        {mode === "landing" && (
          <div className="space-y-5">
            <CyberHeader />

            <CyberRadar />

            <div className="text-center space-y-1.5">
              <h1 className="font-cyber text-xl sm:text-2xl font-bold tracking-wider text-white neon-text">
                DISCOVER PEOPLE NEARBY
              </h1>
              <p className="text-[11px] sm:text-xs text-blue-200/60 tracking-wide">
                WHO SHARE YOUR INTERESTS. NO FOLLOWERS. NO PRESSURE.
              </p>
            </div>

            <GlobalCounters />

            {/* ZIP check */}
            <form onSubmit={handleZipCheck}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                  <input
                    type="text"
                    value={zipCheck}
                    onChange={(e) => setZipCheck(e.target.value)}
                    placeholder="Your ZIP code"
                    inputMode="numeric"
                    maxLength={5}
                    className="w-full pl-11 pr-4 py-3 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={zipLoading || !zipCheck.trim()}
                  className="px-5 py-3 rounded-xl neon-btn text-white font-cyber font-semibold text-xs tracking-wider flex items-center justify-center gap-1 transition-transform disabled:opacity-40"
                >
                  {zipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>CHECK <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
              {zipResult && !zipResult.error && (
                <p className="text-blue-200/60 text-xs mt-2.5 text-center">
                  {zipResult.active_count > 0
                    ? `${zipResult.active_count} active member${zipResult.active_count === 1 ? "" : "s"} near you!`
                    : zipResult.waitlist_count > 0
                    ? `${zipResult.waitlist_count} on the waitlist in your area — join now!`
                    : "NEX2 isn't in your area yet. Join the waitlist to be first!"}
                </p>
              )}
              {zipResult?.error && <p className="text-red-400 text-xs mt-2.5 text-center">{zipResult.error}</p>}
            </form>

            {/* Subtext with NYC pill */}
            <p className="text-center text-[10px] text-blue-200/40 tracking-wide leading-relaxed">
              NEX2 WORKS BEST IN DENSE AREAS — WE'RE STARTING IN{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 font-cyber text-[9px] tracking-wider">NYC</span>
              {" "}AND EXPANDING CITY BY CITY.
            </p>

            {/* Primary + secondary buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => { setMode("waitlist"); setError(""); }}
                className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform"
              >
                GET STARTED <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setMode("password"); setError(""); }}
                className="w-full py-3.5 rounded-xl bg-transparent border border-blue-400/20 text-white font-cyber font-semibold text-sm tracking-wider transition-transform hover:border-blue-400/40"
              >
                I ALREADY HAVE AN ACCOUNT →
              </button>
              <a
                href="/company"
                className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/5 text-blue-300/70 font-cyber font-medium text-xs tracking-wider transition-all hover:border-blue-400/20 hover:text-blue-300 flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" /> LEARN ABOUT NEX2 →
              </a>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center pt-3 border-t border-blue-500/10">
              <span className="text-blue-200/40 text-[10px] tracking-wide">© 2026 NEX2, Inc. All Rights Reserved.</span>
            </div>
          </div>
        )}

        {/* ===== ACCESS CODE + LOGIN MODE ===== */}
        {mode === "password" && (
          <div className="space-y-5">
            <CyberHeader />
            <BackButton />
            <div className="text-center space-y-1.5">
              <h1 className="font-cyber text-xl font-bold tracking-wider text-white neon-text">ENTER TO CONTINUE</h1>
              <p className="text-blue-200/50 text-xs">Enter your access code or log in to your account.</p>
            </div>

            {/* Access code form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ACCESS CODE"
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-center text-lg tracking-widest font-cyber focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>UNLOCK <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-500/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-black px-3 text-blue-200/40 font-cyber tracking-wider">or log in</span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !loginEmail.trim() || !loginPassword.trim()}
                className="w-full py-3.5 rounded-xl bg-transparent border border-blue-400/20 text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform hover:border-blue-400/40 disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>LOG IN <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3.5 rounded-xl bg-transparent border border-blue-400/20 text-white font-cyber font-semibold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform hover:border-blue-400/40"
            >
              <GoogleIcon className="w-4 h-4" />
              CONTINUE WITH GOOGLE
            </button>

            <button
              type="button"
              onClick={() => { setMode("check"); setError(""); setEmail(""); }}
              className="w-full text-center text-blue-200/40 text-xs hover:text-blue-200/70 transition-colors pt-1"
            >
              Already on the waitlist? <span className="text-blue-400 font-medium">Check your status</span>
            </button>
          </div>
        )}

        {/* ===== STATUS CHECK MODE ===== */}
        {mode === "check" && (
          <div className="space-y-5">
            <CyberHeader />
            <BackButton />
            <div className="text-center space-y-1.5">
              <h1 className="font-cyber text-xl font-bold tracking-wider text-white neon-text">CHECK YOUR STATUS</h1>
              <p className="text-blue-200/50 text-xs">Enter the email you used to join the waitlist.</p>
            </div>
            <form onSubmit={handleCheckApproval} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 focus:outline-none"
                />
              </div>
              {error && <p className="text-amber-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CHECK STATUS <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ===== WAITLIST MODE ===== */}
        {mode === "waitlist" && (
          <div className="space-y-5">
            <CyberHeader />
            <BackButton />
            <div className="text-center space-y-1.5">
              <h1 className="font-cyber text-xl font-bold tracking-wider text-white neon-text">JOIN THE WAITLIST</h1>
              <p className="text-blue-200/50 text-xs">We're launching neighborhood by neighborhood. Enter your email and ZIP code to get notified.</p>
            </div>
            {waitlistDone ? (
              <div className="text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center mx-auto"
                  style={{ boxShadow: "0 0 20px rgba(0,122,255,0.15)" }}
                >
                  <CheckCircle2 className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white text-sm">You're on the list! When you're approved, come back to check your status.</p>
                <button
                  type="button"
                  onClick={() => { setMode("check"); setWaitlistDone(false); setEmail(""); }}
                  className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform"
                >
                  CHECK YOUR STATUS
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="space-y-3">
                {/* Google sign-up */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full py-3.5 rounded-xl bg-transparent border border-blue-400/20 text-white font-cyber font-semibold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform hover:border-blue-400/40"
                >
                  <GoogleIcon className="w-4 h-4" />
                  CONTINUE WITH GOOGLE
                </button>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-500/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-black px-3 text-blue-200/40 font-cyber tracking-wider">or join with email</span>
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsInternational(!isInternational)}
                  className="w-full flex items-center gap-3 py-1 group"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${isInternational ? "neon-btn border-transparent" : "border-blue-400/20 bg-blue-500/5 group-hover:border-blue-400/30"}`}>
                    {isInternational && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-blue-200/60 text-sm">I live outside the US</span>
                </button>
                {isInternational ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                      <input
                        type="text"
                        value={internationalLocation}
                        onChange={(e) => setInternationalLocation(e.target.value)}
                        placeholder="e.g. Lahore, Pakistan"
                        autoFocus
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
                      />
                    </div>
                    <p className="text-blue-200/30 text-xs pl-1">We'll notify you when we expand there 🌍</p>
                  </div>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="ZIP code"
                      inputMode="numeric"
                      maxLength={5}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
                    />
                  </div>
                )}
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim() || (isInternational ? !internationalLocation.trim() : !zipCode.trim())}
                  className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>JOIN WAITLIST <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("check"); setError(""); setEmail(""); }}
                  className="w-full text-center text-blue-200/40 text-xs hover:text-blue-200/70 transition-colors pt-1"
                >
                  Already on the waitlist? <span className="text-blue-400 font-medium">Check your status</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}