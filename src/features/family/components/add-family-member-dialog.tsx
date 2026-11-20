"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, inputClassName } from "@/components/ui/form-field";
import {
  FAMILY_RELATIONSHIPS,
  RELATIONSHIP_LABELS,
  familyMemberSchema,
  type FamilyMemberFormValues,
  type FamilyMemberInput,
} from "../schema";
import { useActiveProfile } from "../context/active-profile-context";

export function AddFamilyMemberDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add family member"
      description="Manage their records from your account. They don't need their own login."
    >
      <AddFamilyMemberForm onDone={onClose} />
    </Dialog>
  );
}

function AddFamilyMemberForm({ onDone }: { onDone: () => void }) {
  const { addProfile } = useActiveProfile();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FamilyMemberFormValues, unknown, FamilyMemberInput>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: { name: "", relationship: "", consent: false },
  });

  async function onSubmit(data: FamilyMemberInput) {
    try {
      await addProfile(data);
      onDone();
    } catch {
      setError("root", { message: "Could not add family member. Please try again." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <FormField id="member-name" label="Name" error={errors.name?.message}>
          <input
            id="member-name"
            autoFocus
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? "member-name-error" : undefined}
            className={inputClassName(!!errors.name)}
            {...register("name")}
          />
        </FormField>

        <FormField id="member-relationship" label="Relationship" error={errors.relationship?.message}>
          <select
            id="member-relationship"
            aria-invalid={Boolean(errors.relationship) || undefined}
            className={inputClassName(!!errors.relationship)}
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
              I have their permission, or I am their parent or legal guardian, to store and manage
              their health information.
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
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Add member
        </Button>
      </div>
    </form>
  );
}
