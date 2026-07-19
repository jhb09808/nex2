import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Lock, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        title="INVALID RESET LINK"
        subtitle="This password reset link is missing or invalid"
        showBack
        footer={
          <Link to="/forgot-password" className="text-blue-400 font-medium hover:underline">
            Request a new link
          </Link>
        }
      >
        <p className="text-blue-200/60 text-sm text-center">
          The link you used appears to be incomplete. Please request a new password reset email.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="NEW PASSWORD"
      subtitle="Enter your new password below"
    >
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-blue-200/60 text-xs font-cyber tracking-wider">NEW PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" aria-hidden="true" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-blue-200/60 text-xs font-cyber tracking-wider">CONFIRM PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" aria-hidden="true" />
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-blue-200/30 text-sm focus:outline-none"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
          className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>RESET PASSWORD <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}