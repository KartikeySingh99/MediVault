"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { RELATIONSHIP_LABELS } from "../schema";
import { useActiveProfile } from "../context/active-profile-context";
import { AddFamilyMemberDialog } from "./add-family-member-dialog";

export function FamilyMembersSettings() {
  const { profiles, loading, removeProfile } = useActiveProfile();
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleRemove(profile) {
    const confirmed = window.confirm(
      `Remove ${profile.name}? Their health profile and records stored in MediVault will be deleted.`
    );
    if (confirmed) await removeProfile(profile.id);
  }

  return (
    <Card>
      <CardHeader
        title="Family members"
        description="Profiles you manage from this account. Each has its own records and emergency card."
        action={
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            <UserPlus className="size-4" aria-hidden="true" /> Add
          </Button>
        }
      />

      {loading ? (
        <p className="py-6 text-center text-sm text-muted">Loading…</p>
      ) : (
        <ul className="divide-y divide-border">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <Avatar name={p.name} />
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{RELATIONSHIP_LABELS[p.relationship]}</p>
              </div>
              {p.relationship !== "self" && (
                <Button
                  variant="ghost"
                  className="px-3 hover:text-danger"
                  onClick={() => handleRemove(p)}
                  aria-label={`Remove ${p.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <AddFamilyMemberDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Card>
  );
}
