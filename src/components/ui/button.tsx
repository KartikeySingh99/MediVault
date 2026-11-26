import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-slate-50 disabled:text-muted",
  ghost: "text-muted hover:bg-slate-100 hover:text-foreground",
} as const;

/** Every native <button> prop (onClick, disabled, aria-*...) plus our variant. */
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: keyof typeof VARIANTS;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "cursor-pointer inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
