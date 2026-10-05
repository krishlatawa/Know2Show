"use client";

import React from "react";
import AppNavbar from "./AppNavbar";

export function AppShell({ children, hideNavbar = false, className = "" }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#211A16] flex flex-col selection:bg-[#211A16] selection:text-[#F7F5F0]">
      {!hideNavbar && <AppNavbar />}
      <main className={`flex-1 w-full ${className}`}>{children}</main>
    </div>
  );
}

export default AppShell;
