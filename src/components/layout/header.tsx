import Link from "next/link";
import { Menu, ShieldPlus } from "lucide-react";
import { ProfileSwitcher } from "@/features/family/components/profile-switcher";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <ProfileSwitcher />

      <div className="flex-1" />

      {/* Emergency access is always one tap away, on every screen size */}
      <Link
        href="/emergency"
        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-danger px-3 text-sm font-medium text-white hover:bg-red-700"
      >
        <ShieldPlus className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Emergency</span>
      </Link>
    </header>
  );
}
