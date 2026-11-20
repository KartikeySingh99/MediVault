import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared classes for text inputs, selects and textareas. */
export function inputClassName(invalid?: boolean): string {
  return cn(
    "w-full rounded-xl border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 disabled:text-muted",
    invalid
      ? "border-danger focus:ring-red-100"
      : "border-border focus:border-primary focus:ring-primary/15"
  );
}

/** Label + control + hint/error wrapper. Pass the control as children. */
interface FormFieldProps {
  id: string;
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ id, label, optional, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
