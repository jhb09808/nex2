import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title="RESET PASSWORD"
      subtitle="We'll send you a link to reset it"
      showBack
      footer={
        <Link to="/login" className="text-blue-400 font-medium hover:underline inline-flex items-center gap-1">
          ← Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center mx-auto"
            style={{ boxShadow: "0 0 20px rgba(0,122,255,0.15)" }}
          >
            <CheckCircle2 className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-blue-200/60 text-sm">
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-blue-200/60 text-xs font-cyber tracking-wider">EMAIL ADDRESS</label>
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
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>SEND RESET LINK <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}