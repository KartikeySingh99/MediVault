import Link from "next/link";
import { ShieldPlus } from "lucide-react";

export function EmergencyShortcut() {
  return (
    <Link
      href="/emergency"
      className="flex items-center gap-4 rounded-card border border-red-200 bg-danger-soft p-5 transition-colors hover:border-danger"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-danger text-white">
        <ShieldPlus className="size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-red-800">Emergency Center</p>
        <p className="text-sm text-red-700">
          Emergency health card, allergies and contacts in one tap.
        </p>
      </div>
    </Link>
  );
}
