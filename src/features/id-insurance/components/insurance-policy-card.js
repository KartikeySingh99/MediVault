import { Phone, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { COVER_TYPES } from "../schema";
import { daysUntil, formatRupees } from "../utils";
import { StoredFilePreview } from "./stored-file-preview";

function ExpiryBadge({ validUntil }) {
  const days = daysUntil(validUntil);
  if (days === null) return null;
  if (days < 0)
    return <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Expired</span>;
  if (days <= 30)
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        Expires in {days} {days === 1 ? "day" : "days"}
      </span>
    );
  return null;
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function InsurancePolicyCard({ policy, profiles, onDelete }) {
  const covered = profiles.filter((p) => policy.coveredProfileIds.includes(p.id));

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{policy.insurer}</p>
          <p className="text-sm text-muted">
            {[policy.planName, COVER_TYPES[policy.coverType]].filter(Boolean).join(" · ")}
          </p>
        </div>
        <ExpiryBadge validUntil={policy.validUntil} />
        <Button
          variant="ghost"
          className="px-2 hover:text-danger"
          onClick={() => onDelete(policy)}
          aria-label={`Delete ${policy.insurer} policy`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Detail label="Policy number" value={policy.policyNumber} />
        <Detail label="Member ID" value={policy.memberId} />
        <Detail label="Sum insured" value={formatRupees(policy.sumInsured)} />
        <Detail label="Valid until" value={policy.validUntil && formatDate(policy.validUntil)} />
      </dl>

      {(policy.tpaName || policy.tpaHelpline) && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <div>
            <p className="text-xs text-muted">TPA</p>
            <p className="text-sm font-medium">{policy.tpaName || "Helpline"}</p>
          </div>
          {policy.tpaHelpline && (
            <a
              href={`tel:${policy.tpaHelpline.replace(/[\s-]/g, "")}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Phone className="size-4" aria-hidden="true" /> Call {policy.tpaHelpline}
            </a>
          )}
        </div>
      )}

      {covered.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Covers</span>
          <div className="flex -space-x-2">
            {covered.map((p) => (
              <span key={p.id} title={p.name}>
                <Avatar name={p.name} className="size-7 text-xs ring-2 ring-white" />
              </span>
            ))}
          </div>
          <span className="truncate text-xs text-muted">{covered.map((p) => p.name).join(", ")}</span>
        </div>
      )}

      {policy.files.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {policy.files.map((file) => (
            <StoredFilePreview key={file.id} file={file} />
          ))}
        </div>
      )}
    </Card>
  );
}
