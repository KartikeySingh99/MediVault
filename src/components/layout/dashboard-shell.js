"use client";

import { useState } from "react";
import { ActiveProfileProvider } from "@/features/family/context/active-profile-context";
import { ActiveProfileBanner } from "@/features/family/components/active-profile-banner";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ActiveProfileProvider>
      <div className="min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <ActiveProfileBanner />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ActiveProfileProvider>
  );
}
