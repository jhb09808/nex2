import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <AuthLayout
      title="WELCOME BACK"
      subtitle="Log in to your account"
      showBack
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <button
        onClick={handleGoogle}
        className="w-full py-3.5 rounded-xl bg-transparent border border-blue-400/20 text-white font-cyber font-semibold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform hover:border-blue-400/40"
      >
        <GoogleIcon className="w-4 h-4" />
        CONTINUE WITH GOOGLE
      </button>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blue-500/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-black px-3 text-blue-200/40 font-cyber tracking-wider">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-blue-200/60 text-xs font-cyber tracking-wider">EMAIL</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" aria-hidden="true" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-blue-200/60 text-xs font-cyber tracking-wider">PASSWORD</label>
            <Link to="/forgot-password" className="text-blue-400 text-xs hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" aria-hidden="true" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>LOG IN <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}