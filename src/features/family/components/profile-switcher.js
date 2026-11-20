"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { RELATIONSHIP_LABELS } from "../schema";
import { useActiveProfile } from "../context/active-profile-context";
import { AddFamilyMemberDialog } from "./add-family-member-dialog";

export function ProfileSwitcher() {
  const { profiles, activeProfile, selectProfile, loading } = useActiveProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e) {
      if (!containerRef.current?.contains(e.target)) setMenuOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (loading || !activeProfile) {
    return <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={`Viewing ${activeProfile.name}. Switch profile`}
        className="flex min-h-11 items-center gap-2 rounded-xl px-2 hover:bg-slate-100"
      >
        <Avatar name={activeProfile.name} className="size-8" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">{activeProfile.name}</span>
          <span className="block text-xs text-muted">
            {RELATIONSHIP_LABELS[activeProfile.relationship]}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted" aria-hidden="true" />
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-card border border-border bg-surface p-2 shadow-lg">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted">
            Switch profile
          </p>
          <ul>
            {profiles.map((p) => {
              const active = p.id === activeProfile.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      selectProfile(p.id);
                      setMenuOpen(false);
                    }}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50",
                      active && "bg-primary-soft"
                    )}
                  >
                    <Avatar name={p.name} className="size-8" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-muted">
                        {RELATIONSHIP_LABELS[p.relationship]}
                      </span>
                    </span>
                    {active && <Check className="size-4 text-primary" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setDialogOpen(true);
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary-soft"
            >
              <UserPlus className="size-4" aria-hidden="true" /> Add family member
            </button>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Users className="size-4" aria-hidden="true" /> Manage family
            </Link>
          </div>
        </div>
      )}

      <AddFamilyMemberDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
