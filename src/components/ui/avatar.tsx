import { cn } from "@/lib/utils";

function getInitials(name = ""): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  if (!first) return "?";
  return (first.charAt(0) + (last?.charAt(0) ?? "")).toUpperCase();
}

interface AvatarProps {
  name?: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
