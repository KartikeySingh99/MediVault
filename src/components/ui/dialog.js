"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const SIZES = { md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

/**
 * Native <dialog> modal: focus trapping, Esc-to-close and backdrop come from the browser.
 * Children only render while open, so forms inside start fresh every time.
 */
export function Dialog({ open, onClose, title, description, size = "md", children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className={cn(
        "m-auto max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-card border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-slate-900/40",
        SIZES[size]
      )}
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <Button variant="ghost" className="px-2" onClick={onClose} aria-label="Close">
              <X className="size-5" />
            </Button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
