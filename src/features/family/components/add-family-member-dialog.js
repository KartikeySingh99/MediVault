"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { FAMILY_RELATIONSHIPS, RELATIONSHIP_LABELS, familyMemberSchema } from "../schema";
import { useActiveProfile } from "../context/active-profile-context";

const DEFAULTS = { name: "", relationship: "", consent: false };

/** Native <dialog>: gives focus trapping, Esc-to-close and a backdrop for free. */
export function AddFamilyMemberDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const { addProfile } = useActiveProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(familyMemberSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleClose() {
    reset(DEFAULTS);
    onClose();
  }

  async function onSubmit(data) {
    try {
      await addProfile(data);
      handleClose();
    } catch {
      setError("root", { message: "Could not add family member. Please try again." });
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby="add-family-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-slate-900/40"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="add-family-title" className="text-lg font-semibold">
              Add family member
            </h2>
            <p className="mt-1 text-sm text-muted">
              Manage their records from your account. They don&apos;t need their own login.
            </p>
          </div>
          <Button variant="ghost" className="px-2" onClick={handleClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <FormField id="member-name" label="Name" error={errors.name?.message}>
            <input
              id="member-name"
              autoFocus
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "member-name-error" : undefined}
              className={inputClassName(errors.name)}
              {...register("name")}
            />
          </FormField>

          <FormField
            id="member-relationship"
            label="Relationship"
            error={errors.relationship?.message}
          >
            <select
              id="member-relationship"
              aria-invalid={Boolean(errors.relationship) || undefined}
              className={inputClassName(errors.relationship)}
              {...register("relationship")}
            >
              <option value="" disabled>
                Select…
              </option>
              {FAMILY_RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {RELATIONSHIP_LABELS[r]}
                </option>
              ))}
            </select>
          </FormField>

          <div>
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-primary"
                {...register("consent")}
              />
              <span>
                I have their permission, or I am their parent or legal guardian, to store and
                manage their health information.
              </span>
            </label>
            {errors.consent && (
              <p role="alert" className="mt-1.5 text-xs text-danger">
                {errors.consent.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p role="alert" className="text-sm text-danger">
              {errors.root.message}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Add member
          </Button>
        </div>
      </form>
    </dialog>
  );
}
