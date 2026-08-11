import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import Logo from "@/components/nex/Logo";

const BG_IMAGE = "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/6b451b6af_login_bg.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // loginViaEmailPassword resolves a returnTo query param (falling back to "/")
      // for its post-login hard redirect — set it before calling so we land on /map
      const url = new URL(window.location.href);
      if (!url.searchParams.has("returnTo")) {
        url.searchParams.set("returnTo", "/map");
        window.history.replaceState({}, "", url.toString());
      }
      await base44.auth.loginViaEmailPassword(email, password);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/map");
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      {/* Top bar — logo */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
        <Link to="/welcome">
          <Logo size="sm" />
        </Link>
        <Link
          to="/register"
          className="font-cyber text-[10px] tracking-[0.18em] uppercase text-blue-200/60 hover:text-blue-200 transition-colors"
        >
          Sign Up →
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-cyber text-2xl font-bold text-white tracking-wide neon-text">
            WELCOME BACK
          </h1>
          <p className="text-blue-200/50 text-sm font-cyber tracking-wider mt-1">
            Log in to continue
          </p>
        </div>

        {/* Glass form card */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          >
            <GoogleIcon className="w-4 h-4" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-black/40 px-3 text-white/30 font-cyber tracking-wider">or</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-blue-200/50 text-[10px] font-cyber tracking-[0.15em] uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-blue-200/50 text-[10px] font-cyber tracking-[0.15em] uppercase">
                  Password
                </label>
                <Link to="/forgot-password" className="text-blue-400/70 text-[10px] font-cyber tracking-wider hover:text-blue-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  LOG IN <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center text-white/40 text-xs mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 font-medium hover:underline">
            Create one
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-white/20 text-[9px] font-cyber tracking-[0.1em] mt-4">
          © 2026 NEX2, Inc. All Rights Reserved.
        </p>
      </main>
    </div>
  );
}