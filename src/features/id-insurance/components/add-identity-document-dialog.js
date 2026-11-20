"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { FilePicker } from "@/components/shared/file-picker";
import { IDENTITY_TYPES, MAX_FILES_PER_ITEM, identityDocumentSchema } from "../schema";

export function AddIdentityDocumentDialog({ open, onClose, onSubmit, profileName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add ID document"
      description={`Stored privately for ${profileName}. ID documents are never sent to AI.`}
    >
      <IdentityDocumentForm onCancel={onClose} onSubmit={onSubmit} />
    </Dialog>
  );
}

function IdentityDocumentForm({ onCancel, onSubmit }) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(identityDocumentSchema),
    defaultValues: { type: "", label: "", last4: "", files: [] },
  });
  const type = useWatch({ control, name: "type" });

  async function submit(data) {
    try {
      await onSubmit(data);
    } catch (error) {
      setError("root", { message: error.message || "Could not save the document." });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <FormField id="id-type" label="Document type" error={errors.type?.message}>
        <select id="id-type" className={inputClassName(errors.type)} {...register("type")}>
          <option value="" disabled>
            Select…
          </option>
          {Object.entries(IDENTITY_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      {type === "aadhaar" && (
        <div className="flex gap-2 rounded-xl bg-primary-soft p-3 text-xs text-teal-800">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          <p>
            Please upload a <strong>masked Aadhaar</strong> (only the last 4 digits visible). You
            can download one from the official UIDAI website.
          </p>
        </div>
      )}

      {type === "other" && (
        <FormField id="id-label" label="Document name" error={errors.label?.message}>
          <input
            id="id-label"
            placeholder="e.g. Employee ID"
            className={inputClassName(errors.label)}
            {...register("label")}
          />
        </FormField>
      )}

      <FormField
        id="id-last4"
        label="Last 4 characters of the ID number"
        optional={type !== "aadhaar"}
        hint="Helps you tell documents apart. The full number is never stored."
        error={errors.last4?.message}
      >
        <input
          id="id-last4"
          maxLength={4}
          autoComplete="off"
          className={`${inputClassName(errors.last4)} font-mono uppercase tracking-widest sm:w-32`}
          {...register("last4")}
        />
      </FormField>

      <Controller
        control={control}
        name="files"
        render={({ field, fieldState }) => (
          <FormField id="id-files" label="Files" hint="Add the front and back if needed." error={fieldState.error?.message}>
            <FilePicker
              id="id-files"
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

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save document"}
        </Button>
      </div>
    </form>
  );
}
