import type { Metadata } from "next";
import { WelcomeSection } from "@/features/dashboard/components/welcome-section";
import { StatsGrid } from "@/features/dashboard/components/stats-grid";
import { RecentDocuments } from "@/features/dashboard/components/recent-documents";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { EmergencyShortcut } from "@/features/dashboard/components/emergency-shortcut";
import {
  mockRecentDocuments,
  mockStats,
  mockUser,
} from "@/features/dashboard/data/mock-dashboard";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeSection
        firstName={mockUser.firstName}
        profileCompletion={mockUser.profileCompletion}
      />
      <StatsGrid stats={mockStats} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentDocuments documents={mockRecentDocuments} />
        </div>
        <div className="space-y-6">
          <EmergencyShortcut />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
