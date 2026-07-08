import React from "react";
import { Outlet } from "react-router-dom";
import NavMenu from "@/components/nex/NavMenu";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] max-w-lg mx-auto relative overflow-hidden">
      <Outlet />
      <NavMenu />
    </div>
  );
}