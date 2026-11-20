import { FileText, Pill, UploadCloud, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatsGrid({ stats }) {
  const items = [
    { label: "Medical documents", value: stats.totalDocuments, icon: FileText },
    { label: "Current medications", value: stats.currentMedications, icon: Pill },
    { label: "Profile completion", value: `${stats.profileCompletion}%`, icon: UserCheck },
    { label: "Recent uploads", value: stats.recentUploads, icon: UploadCloud },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="flex items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
