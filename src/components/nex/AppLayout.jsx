import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import NavMenu from "@/components/nex/NavMenu";
import ProximityMatchNudge from "@/components/nex/ProximityMatchNudge";
import VerificationGate from "@/components/nex/safety/VerificationGate";
import NotificationListener from "@/components/nex/NotificationListener";
import { base44 } from "@/api/base44Client";
import ScaleToFit from "@/components/nex/ScaleToFit";

export default function AppLayout() {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    checkVerification();
  }, []);

  const checkVerification = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length === 0) {
        setHasProfile(false);
      } else {
        setProfile(profiles[0]);
        if (profiles[0].is_adult && !profiles[0].requires_reverification) {
          setVerified(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <ScaleToFit><div className="h-full w-full bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div></ScaleToFit>
    );
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!verified) {
    return (
      <ScaleToFit>
        <div className="h-full w-full overflow-hidden">
          <VerificationGate profile={profile} onComplete={() => window.location.reload()} />
        </div>
      </ScaleToFit>
    );
  }

  return (
    <ScaleToFit>
      <div className="h-full w-full bg-black relative overflow-hidden flex flex-col">
        <NotificationListener />
        <ProximityMatchNudge />
        <Outlet />
        <NavMenu />
      </div>
    </ScaleToFit>
  );
}