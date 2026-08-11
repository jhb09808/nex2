import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";

const CLIP_CTA = "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)";

const LINK = {
  color: "#7fc8ff",
  background: "none",
  border: "none",
  cursor: "pointer",
  borderBottom: "1px solid rgba(127,200,255,.4)",
  paddingBottom: 2,
  fontFamily: "inherit",
  fontSize: "inherit",
  letterSpacing: "inherit",
  textTransform: "inherit",
};

export default function VerifyEmailPanel({ email, onCancel }) {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = "/map";
    } catch (err) {
      setError(err.message || "Invalid verification code");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const disabled = loading || otpCode.length < 6;

  return (
    <div style={{ marginTop: 22 }}>
      <p style={{ margin: 0, fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8fb9e2" }}>
        Verification code
      </p>
      <p style={{ margin: "8px 0 0", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6f9dc8" }}>
        Enter the 6-digit code sent to {email}
      </p>

      {error && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(120,20,20,.3)", border: "1px solid rgba(255,80,80,.3)", borderRadius: 8, color: "#ff8a80", fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 12, textAlign: "center" }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={disabled}
        style={{
          width: "100%",
          height: 58,
          marginTop: 22,
          border: "1.5px solid transparent",
          borderRadius: 2,
          background: "linear-gradient(180deg, #0a1c3e, #071228) padding-box, linear-gradient(100deg, #3b6bff, #9b4dff 48%, #2fd4d4) border-box",
          color: "#fff",
          fontFamily: "var(--font-chakra)",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: "0 0 22px rgba(80,110,255,.45), inset 0 0 22px rgba(70,120,255,.28)",
          clipPath: CLIP_CTA,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify &amp; log in <ArrowRight className="w-4 h-4" /></>}
        </span>
      </button>

      <p style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8fb9e2" }}>
        Didn't receive the code?{" "}
        <button type="button" onClick={handleResend} style={LINK}>
          Resend
        </button>
      </p>

      <p style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--font-chakra)", fontWeight: 500, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6f9dc8" }}>
        <button type="button" onClick={onCancel} style={{ ...LINK, color: "inherit", borderBottom: "none" }}>
          Back to log in
        </button>
      </p>
    </div>
  );
}