"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { FilePicker } from "@/components/shared/file-picker";
import { RELATIONSHIP_LABELS } from "@/features/family/schema";
import { COVER_TYPES, MAX_FILES_PER_ITEM, insurancePolicySchema } from "../schema";

export function AddInsuranceDialog({ open, onClose, onSubmit, profiles, activeProfileId }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Add insurance policy"
      description="Hospitals ask for these details at admission, especially for cashless claims."
    >
      <InsuranceForm
        onCancel={onClose}
        onSubmit={onSubmit}
        profiles={profiles}
        activeProfileId={activeProfileId}
      />
    </Dialog>
  );
}

function TextField({ id, label, optional, error, register, name, ...inputProps }) {
  return (
    <FormField id={id} label={label} optional={optional} error={error?.message}>
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        className={inputClassName(error)}
        {...inputProps}
        {...register(name)}
      />
    </FormField>
  );
}

function InsuranceForm({ onCancel, onSubmit, profiles, activeProfileId }) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(insurancePolicySchema),
    defaultValues: {
      insurer: "",
      planName: "",
      policyNumber: "",
      memberId: "",
      coverType: "individual",
      sumInsured: "",
      validUntil: "",
      tpaName: "",
      tpaHelpline: "",
      coveredProfileIds: [activeProfileId],
      files: [],
    },
  });

  async function submit(data) {
    try {
      await onSubmit(data);
    } catch (error) {
      setError("root", { message: error.message || "Could not save the policy." });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="ins-insurer" label="Insurance company" name="insurer" register={register} error={errors.insurer} placeholder="e.g. Star Health" />
        <TextField id="ins-plan" label="Plan name" optional name="planName" register={register} error={errors.planName} />
        <TextField id="ins-policy" label="Policy number" name="policyNumber" register={register} error={errors.policyNumber} autoComplete="off" />
        <TextField id="ins-member" label="Member / card ID" optional name="memberId" register={register} error={errors.memberId} autoComplete="off" />

        <FormField id="ins-cover" label="Cover type" error={errors.coverType?.message}>
          <select id="ins-cover" className={inputClassName(errors.coverType)} {...register("coverType")}>
            {Object.entries(COVER_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
        <TextField id="ins-sum" label="Sum insured (₹)" optional name="sumInsured" register={register} error={errors.sumInsured} inputMode="numeric" placeholder="500000" />
        <TextField id="ins-valid" label="Valid until" optional name="validUntil" register={register} error={errors.validUntil} type="date" />
      </div>

      <fieldset className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-medium">TPA (claims administrator)</legend>
        <TextField id="ins-tpa" label="TPA name" optional name="tpaName" register={register} error={errors.tpaName} />
        <TextField id="ins-tpa-phone" label="TPA helpline" optional name="tpaHelpline" register={register} error={errors.tpaHelpline} type="tel" placeholder="1800 123 4567" />
      </fieldset>

      <Controller
        control={control}
        name="coveredProfileIds"
        render={({ field, fieldState }) => (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Covered members</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {profiles.map((p) => {
                const checked = field.value.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2 has-checked:border-primary has-checked:bg-primary-soft"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={checked}
                      onChange={() =>
                        field.onChange(
                          checked ? field.value.filter((id) => id !== p.id) : [...field.value, p.id]
                        )
                      }
                    />
                    <Avatar name={p.name} className="size-7 text-xs" />
                    <span className="text-sm">
                      {p.name} <span className="text-muted">· {RELATIONSHIP_LABELS[p.relationship]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {fieldState.error && (
              <p role="alert" className="mt-1.5 text-xs text-danger">
                {fieldState.error.message}
              </p>
            )}
          </fieldset>
        )}
      />

      <Controller
        control={control}
        name="files"
        render={({ field, fieldState }) => (
          <FormField
            id="ins-files"
            label="Insurance card / policy document"
            optional
            error={fieldState.error?.message}
          >
            <FilePicker
              id="ins-files"
              value={field.value}
              onChange={field.onChange}
              max={MAX_FILES_PER_ITEM}
              invalid={Boolean(fieldState.error)}
            />
          </FormField>
        )}
      />

      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save policy"}
        </Button>
      </div>
    </form>
  );
}
