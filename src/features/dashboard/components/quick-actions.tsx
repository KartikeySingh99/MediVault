import Link from "next/link";
import { IdCard, UploadCloud, UserPen } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

const ACTIONS = [
  { label: "Upload medical document", href: "/documents", icon: UploadCloud },
  { label: "Update health profile", href: "/profile", icon: UserPen },
  { label: "View emergency card", href: "/emergency", icon: IdCard },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader title="Quick actions" />
      <div className="space-y-2">
        {ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
