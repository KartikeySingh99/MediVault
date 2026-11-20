import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/** Placeholder body for routes that are scaffolded but not yet built. */
export function ComingSoon({ day, children }: { day: number | string; children: ReactNode }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-primary">Planned for Day {day}</p>
      <p className="mt-2 max-w-md text-sm text-muted">{children}</p>
    </Card>
  );
}
