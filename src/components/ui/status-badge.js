import { DOCUMENT_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-50 text-sky-700",
  warning: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }) {
  const meta = DOCUMENT_STATUS_META[status] ?? { label: status, tone: "neutral" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[meta.tone]
      )}
    >
      {meta.label}
    </span>
  );
}
