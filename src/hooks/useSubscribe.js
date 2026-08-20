import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Subscribing: send the user to Stripe Checkout, then activate the plan when
 * they come back. Shared by the phone and desktop premium screens.
 *
 * The plan is only ever set server-side from the paid Stripe session — the
 * client can ask to start a checkout, never to grant itself a tier.
 */
export default function useSubscribe({ onActivated } = {}) {
  const [busy, setBusy] = useState(null);      // plan slug currently being started
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Coming back from Checkout — finish the job.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("checkout");
    const sessionId = params.get("session_id");
    if (!outcome) return;

    const clean = () => window.history.replaceState({}, "", window.location.pathname);

    if (outcome === "cancelled") {
      setNotice("Checkout cancelled — nothing was charged.");
      clean();
      return;
    }
    if (outcome !== "success" || !sessionId) return;

    (async () => {
      setBusy("activating");
      try {
        const res = await base44.functions.invoke("activateSubscription", { session_id: sessionId });
        if (res.data?.success) {
          setNotice(`You're on ${res.data.plan} — welcome in.`);
          onActivated?.(res.data.plan);
        } else {
          setError(res.data?.error || "We couldn't confirm that payment.");
        }
      } catch (err) {
        console.error(err);
        setError("We couldn't confirm that payment. If you were charged, contact support.");
      } finally {
        setBusy(null);
        clean();
      }
    })();
  }, []);

  const subscribe = useCallback(async (planName) => {
    const plan = String(planName || "").toLowerCase();
    if (!plan || plan === "free" || busy) return;
    setError("");
    setNotice("");
    setBusy(plan);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", {
        plan,
        origin: window.location.origin,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setError(
        res.data?.payments_not_configured
          ? "Payments aren't switched on yet — no card can be charged."
          : res.data?.error || "Couldn't start checkout."
      );
    } catch (err) {
      console.error(err);
      const notConfigured = err?.response?.data?.payments_not_configured || err?.status === 503;
      setError(
        notConfigured
          ? "Payments aren't switched on yet — no card can be charged."
          : "Couldn't start checkout. Try again in a moment."
      );
    } finally {
      setBusy(null);
    }
  }, [busy]);

  return { subscribe, busy, error, notice, setError, setNotice };
}
