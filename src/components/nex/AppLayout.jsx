import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "@/components/nex/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] max-w-lg mx-auto relative">
      <div className="pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}