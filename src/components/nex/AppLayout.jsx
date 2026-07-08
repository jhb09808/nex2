import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavMenu from "@/components/nex/NavMenu";
import ProximityMatchNudge from "@/components/nex/ProximityMatchNudge";
import VerificationGate from "@/components/nex/safety/VerificationGate";
import { base44 } from "@/api/base44Client";

export default function AppLayout() {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkVerification();
  }, []);

  const checkVerification = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0 && profiles[0].is_adult && !profiles[0].requires_reverification) {
        setVerified(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,4%)] flex items-center justify-center max-w-lg mx-auto">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-lg mx-auto">
        <VerificationGate onComplete={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] max-w-lg mx-auto relative overflow-hidden">
      <ProximityMatchNudge />
      <Outlet />
      <NavMenu />
    </div>
  );
}