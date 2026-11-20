"use client";

import { useCallback, useEffect, useState } from "react";
import { BriefcaseMedical, IdCard, Loader2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveProfile } from "@/features/family/context/active-profile-context";
import {
  addIdentityDocument,
  addInsurancePolicy,
  deleteIdentityDocument,
  deleteInsurancePolicy,
  listIdentityDocuments,
  listInsurancePolicies,
} from "../services/id-insurance-service";
import { identityTitle } from "../utils";
import { IdentityDocumentCard } from "./identity-document-card";
import { InsurancePolicyCard } from "./insurance-policy-card";
import { AddIdentityDocumentDialog } from "./add-identity-document-dialog";
import { AddInsuranceDialog } from "./add-insurance-dialog";
import { HospitalKitDialog } from "./hospital-kit-dialog";

export function IdInsuranceView() {
  const { activeProfile } = useActiveProfile();
  if (!activeProfile) return <Loading />;
  // key: switching profile remounts with that person's documents.
  return <ProfileIdInsurance key={activeProfile.id} member={activeProfile} />;
}

function Loading() {
  return (
    <div className="flex min-h-64 items-center justify-center text-muted" role="status">
      <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> Loading…
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
      <Icon className="size-8 text-slate-300" aria-hidden="true" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      <Button variant="secondary" className="mt-4" onClick={onAction}>
        <Plus className="size-4" aria-hidden="true" /> {actionLabel}
      </Button>
    </div>
  );
}

async function fetchProfileData(profileId) {
  const [identityDocs, policies] = await Promise.all([
    listIdentityDocuments(profileId),
    listInsurancePolicies(profileId),
  ]);
  return { identityDocs, policies };
}

function ProfileIdInsurance({ member }) {
  const { profiles } = useActiveProfile();
  const [data, setData] = useState(null); // { identityDocs, policies }
  const [dialog, setDialog] = useState(null); // "identity" | "insurance" | "kit" | null

  const load = useCallback(() => fetchProfileData(member.id).then(setData), [member.id]);

  useEffect(() => {
    let cancelled = false;
    fetchProfileData(member.id).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [member.id]);

  async function handleAddIdentity(input) {
    await addIdentityDocument(member.id, input);
    await load();
    setDialog(null);
  }

  async function handleAddInsurance(input) {
    await addInsurancePolicy(input);
    await load();
    setDialog(null);
  }

  async function handleDeleteIdentity(doc) {
    if (!window.confirm(`Delete ${identityTitle(doc)} and its files?`)) return;
    await deleteIdentityDocument(doc.id);
    await load();
  }

  async function handleDeletePolicy(policy) {
    const others = policy.coveredProfileIds.length - 1;
    const warning = others > 0 ? ` It also covers ${others} other family member(s) and will be removed for them too.` : "";
    if (!window.confirm(`Delete the ${policy.insurer} policy?${warning}`)) return;
    await deleteInsurancePolicy(policy.id);
    await load();
  }

  if (!data) return <Loading />;
  const { identityDocs, policies } = data;

  return (
    <div className="space-y-8">
      {/* Hospital Kit call-to-action */}
      <div className="flex flex-col gap-4 rounded-card border border-teal-200 bg-primary-soft p-5 sm:flex-row sm:items-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <BriefcaseMedical className="size-6" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-teal-900">Hospital Kit</p>
          <p className="text-sm text-teal-800">
            Share ID and insurance documents with a hospital in one step.
          </p>
        </div>
        <Button onClick={() => setDialog("kit")}>Prepare Hospital Kit</Button>
      </div>

      {/* Insurance */}
      <section aria-labelledby="insurance-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="insurance-heading" className="text-lg font-semibold">
            Insurance
          </h2>
          {policies.length > 0 && (
            <Button variant="secondary" onClick={() => setDialog("insurance")}>
              <Plus className="size-4" aria-hidden="true" /> Add policy
            </Button>
          )}
        </div>
        {policies.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No insurance policies"
            text="Add the policy number and TPA helpline so they're ready for a cashless admission."
            actionLabel="Add insurance policy"
            onAction={() => setDialog("insurance")}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {policies.map((policy) => (
              <InsurancePolicyCard
                key={policy.id}
                policy={policy}
                profiles={profiles}
                onDelete={handleDeletePolicy}
              />
            ))}
          </div>
        )}
      </section>

      {/* Identity */}
      <section aria-labelledby="identity-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="identity-heading" className="text-lg font-semibold">
            Identity documents
          </h2>
          {identityDocs.length > 0 && (
            <Button variant="secondary" onClick={() => setDialog("identity")}>
              <Plus className="size-4" aria-hidden="true" /> Add ID
            </Button>
          )}
        </div>
        {identityDocs.length === 0 ? (
          <EmptyState
            icon={IdCard}
            title="No ID documents"
            text="Add a masked Aadhaar, PAN, passport or other photo ID that hospitals ask for."
            actionLabel="Add ID document"
            onAction={() => setDialog("identity")}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {identityDocs.map((doc) => (
              <IdentityDocumentCard key={doc.id} doc={doc} onDelete={handleDeleteIdentity} />
            ))}
          </div>
        )}
      </section>

      <AddIdentityDocumentDialog
        open={dialog === "identity"}
        onClose={() => setDialog(null)}
        onSubmit={handleAddIdentity}
        profileName={member.name}
      />
      <AddInsuranceDialog
        open={dialog === "insurance"}
        onClose={() => setDialog(null)}
        onSubmit={handleAddInsurance}
        profiles={profiles}
        activeProfileId={member.id}
      />
      <HospitalKitDialog
        open={dialog === "kit"}
        onClose={() => setDialog(null)}
        profileName={member.name}
        identityDocs={identityDocs}
        policies={policies}
      />
    </div>
  );
}
