"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, X } from "lucide-react";
import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for the mobile/tablet drawer */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">MediVault</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="border-t border-border px-5 py-4 text-xs text-muted">
          MediVault organizes records. It does not provide medical advice.
        </p>
      </aside>
    </>
  );
}
