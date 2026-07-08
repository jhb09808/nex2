import React, { useState } from "react";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SESSION_KEY = "nex_access_granted";

export function hasAccess() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("checkAccessPassword", { password });
      if (res.data?.valid) {
        sessionStorage.setItem(SESSION_KEY, "true");
        window.location.reload();
      } else {
        setError("Incorrect password. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-6 bg-[hsl(0,0%,4%)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mx-auto mb-5 glow-blue">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Enter to continue</h1>
          <p className="text-white/40 text-sm">This site is invite-only. Enter the access code to explore.</p>
        </div>

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
        </form>
      </div>
    </div>
  );
}