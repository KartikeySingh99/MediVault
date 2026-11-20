import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "../utils";

export function ProfileCompletionCard({ checklist, percent }: { checklist: ChecklistItem[]; percent: number }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Profile completion</h2>
        <span className="text-2xl font-semibold text-primary">{percent}%</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {checklist.map(({ label, done }) => (
          <li key={label} className="flex items-center gap-2 text-sm">
            {done ? (
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <Circle className="size-4 text-slate-300" aria-hidden="true" />
            )}
            <span className={cn(!done && "text-muted")}>{label}</span>
            <span className="sr-only">{done ? "(complete)" : "(missing)"}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex gap-2 rounded-xl bg-primary-soft p-3 text-xs text-teal-800">
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        <p>
          Everything on this page is <strong>entered by you</strong>. Details the AI extracts
          from documents are kept separate and only appear after you verify them.
        </p>
      </div>
    </Card>
  );
}
