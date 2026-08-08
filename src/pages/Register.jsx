import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Check waitlist approval FIRST — no account creation without it
      const approvalRes = await base44.functions.invoke("checkWaitlistApproval", { email });
      if (!approvalRes.data.approved) {
        const status = approvalRes.data.status;
        if (status === "not_found") {
          setError("You're not on the waitlist yet. Join the waitlist to get early access.");
        } else if (status === "waitlisted" || status === "pending") {
          setError("Your waitlist application is still pending approval. Check back soon!");
        } else {
          setError("Your account hasn't been approved yet. Please wait for approval.");
        }
        return;
      }
      // If already has an account, redirect to login instead of creating a duplicate
      if (approvalRes.data.has_account) {
        setError("An account already exists for this email. Please log in instead.");
        return;
      }

      // 2. Then check device rate limit
      const limitRes = await base44.functions.invoke("checkRegistrationLimit", {});
      if (!limitRes.data.allowed) {
        setError(limitRes.data.error || "Too many accounts from this device. Try again later.");
        return;
      }

      // 3. Only now create the account
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      base44.analytics.track({ eventName: "signup_completed" });
      window.location.href = "/map";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = async () => {
    setError("");
    if (!email.trim()) {
      setError("Enter your email first so we can check your waitlist approval.");
      return;
    }
    setLoading(true);
    try {
      const approvalRes = await base44.functions.invoke("checkWaitlistApproval", { email });
      if (!approvalRes.data.approved) {
        const status = approvalRes.data.status;
        if (status === "not_found") {
          setError("You're not on the waitlist yet. Join the waitlist to get early access.");
        } else {
          setError("Your account hasn't been approved yet. Please wait for approval.");
        }
        return;
      }
      base44.analytics.track({ eventName: "google_signup_click" });
      base44.auth.loginWithProvider("google", "/");
    } catch (err) {
      setError(err.message || "Approval check failed");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        title="VERIFY YOUR EMAIL"
        subtitle={`We sent a code to ${email}`}
        showBack
      >
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-5">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <button
          className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform disabled:opacity-40"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>VERIFY <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-blue-200/40 text-xs mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-blue-400 font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="CREATE YOUR ACCOUNT"
      subtitle="Sign up to get started"
      showBack
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 font-medium hover:underline">
            Log in
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
          <label htmlFor="password" className="text-blue-200/60 text-xs font-cyber tracking-wider">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/40" aria-hidden="true" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CREATE ACCOUNT <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}