import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { FamilyMembersSettings } from "@/features/family/components/family-members-settings";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Family profiles, account and privacy preferences." />
      <div className="max-w-2xl">
        <FamilyMembersSettings />
      </div>
    </>
  );
}
