"use client";

import { Users } from "lucide-react";
import { RELATIONSHIP_LABELS } from "../schema";
import { useActiveProfile } from "../context/active-profile-context";

/** Persistent reminder when viewing someone else's records, to avoid entering data for the wrong person. */
export function ActiveProfileBanner() {
  const { activeProfile, profiles, selectProfile } = useActiveProfile();
  if (!activeProfile || activeProfile.relationship === "self") return null;

  const self = profiles.find((p) => p.relationship === "self");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 sm:px-6">
      <p className="flex items-center gap-2">
        <Users className="size-4 shrink-0" aria-hidden="true" />
        You are managing records for{" "}
        <strong>
          {activeProfile.name} ({RELATIONSHIP_LABELS[activeProfile.relationship]})
        </strong>
      </p>
      {self && (
        <button
          type="button"
          onClick={() => selectProfile(self.id)}
          className="font-medium underline underline-offset-2 hover:text-amber-700"
        >
          Switch to my profile
        </button>
      )}
    </div>
  );
}
