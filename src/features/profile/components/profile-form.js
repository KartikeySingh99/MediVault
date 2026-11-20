"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { BLOOD_GROUPS, EMPTY_PROFILE, GENDER_OPTIONS, profileSchema } from "../schema";
import {
  calculateAge,
  calculateProfileCompletion,
  getCompletionChecklist,
} from "../utils";
import { getHealthProfile, saveHealthProfile } from "../services/profile-service";
import { useActiveProfile } from "@/features/family/context/active-profile-context";
import { TagInput } from "./tag-input";
import { MedicineList } from "./medicine-list";
import { ProfileCompletionCard } from "./profile-completion-card";

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center text-muted" role="status">
      <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> Loading profile…
    </div>
  );
}

/** Renders the health profile form for whichever family profile is active. */
export function ProfileForm() {
  const { activeProfile, renameProfile } = useActiveProfile();
  if (!activeProfile) return <LoadingState />;

  // key: switching profile remounts the form, so no state leaks between people.
  return (
    <HealthProfileForm
      key={activeProfile.id}
      member={activeProfile}
      onNameChange={(name) => renameProfile(activeProfile.id, name)}
    />
  );
}

function HealthProfileForm({ member, onNameChange }) {
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState({ status: "idle", message: "" });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY_PROFILE,
    mode: "onTouched",
  });

  // Live values for the completion card and age display.
  const values = useWatch({ control });
  const checklist = getCompletionChecklist(values);
  const percent = calculateProfileCompletion(values);
  const age = calculateAge(values.dateOfBirth);

  useEffect(() => {
    getHealthProfile(member.id).then((profile) => {
      // New family member: prefill the name they were added with ("Me" is a placeholder).
      const prefillName = member.relationship === "self" && member.name === "Me" ? "" : member.name;
      reset(profile ?? { ...EMPTY_PROFILE, fullName: prefillName });
      setLoading(false);
    });
    // Runs once per mount; the parent remounts this component when the profile changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data) {
    try {
      const saved = await saveHealthProfile(member.id, data);
      reset(saved); // clears dirty state with the trimmed, saved values
      if (saved.fullName !== member.name) await onNameChange(saved.fullName);
      setSaveState({ status: "success", message: "Profile saved" });
    } catch {
      setSaveState({ status: "error", message: "Could not save your profile. Please try again." });
    }
  }

  if (loading) return <LoadingState />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => saveState.status !== "idle" && setSaveState({ status: "idle", message: "" })}
      noValidate
      className="grid gap-6 lg:grid-cols-3"
    >
      <div className="space-y-6 lg:col-span-2">
        {/* Personal information */}
        <Card>
          <CardHeader title="Personal information" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="fullName"
              label="Full name"
              error={errors.fullName?.message}
              className="sm:col-span-2"
            >
              <input
                id="fullName"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName) || undefined}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={inputClassName(errors.fullName)}
                {...register("fullName")}
              />
            </FormField>

            <FormField
              id="dateOfBirth"
              label="Date of birth"
              error={errors.dateOfBirth?.message}
              hint={age !== null ? `Age: ${age} years` : undefined}
            >
              <input
                id="dateOfBirth"
                type="date"
                autoComplete="bday"
                max={new Date().toISOString().split("T")[0]}
                aria-invalid={Boolean(errors.dateOfBirth) || undefined}
                aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                className={inputClassName(errors.dateOfBirth)}
                {...register("dateOfBirth")}
              />
            </FormField>

            <FormField id="gender" label="Gender" optional error={errors.gender?.message}>
              <select id="gender" className={inputClassName(errors.gender)} {...register("gender")}>
                <option value="">Not specified</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FormField>

            <FormField
              id="bloodGroup"
              label="Blood group"
              optional
              hint="Shown on your emergency card if provided."
              error={errors.bloodGroup?.message}
            >
              <select
                id="bloodGroup"
                className={inputClassName(errors.bloodGroup)}
                {...register("bloodGroup")}
              >
                <option value="">Unknown</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FormField>
          </div>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader
            title="Allergies"
            description="Critical in an emergency. Include medicines, foods and other triggers."
          />
          <label className="mb-4 flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("noKnownAllergies")}
            />
            I have no known allergies
          </label>
          <Controller
            control={control}
            name="allergies"
            render={({ field, fieldState }) => (
              <FormField id="allergies" label="Known allergies" error={fieldState.error?.message}>
                <TagInput
                  id="allergies"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. Penicillin, then press Enter"
                  disabled={values.noKnownAllergies && field.value.length === 0}
                  invalid={Boolean(fieldState.error)}
                />
              </FormField>
            )}
          />
        </Card>

        {/* Conditions & history */}
        <Card>
          <CardHeader title="Conditions & history" />
          <div className="space-y-4">
            <Controller
              control={control}
              name="conditions"
              render={({ field, fieldState }) => (
                <FormField
                  id="conditions"
                  label="Existing medical conditions"
                  optional
                  error={fieldState.error?.message}
                >
                  <TagInput
                    id="conditions"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. Hypothyroidism, then press Enter"
                    invalid={Boolean(fieldState.error)}
                  />
                </FormField>
              )}
            />

            <FormField
              id="medicalHistory"
              label="Important medical history"
              optional
              hint="Surgeries, hospitalizations, implants or anything a doctor should know."
              error={errors.medicalHistory?.message}
            >
              <textarea
                id="medicalHistory"
                rows={4}
                className={inputClassName(errors.medicalHistory)}
                {...register("medicalHistory")}
              />
            </FormField>
          </div>
        </Card>

        {/* Medications & supplements */}
        <Card>
          <CardHeader
            title="Medications & supplements"
            description="Only list what you are taking now. Dosage as written by your doctor."
          />
          <div className="space-y-6">
            <MedicineList
              name="medications"
              label="Current medications"
              control={control}
              register={register}
              errors={errors}
              emptyText="No current medications added."
            />
            <MedicineList
              name="supplements"
              label="Current supplements"
              control={control}
              register={register}
              errors={errors}
              emptyText="No supplements added."
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:rounded-card sm:border sm:px-5">
          <p
            role="status"
            className={
              saveState.status === "error" ? "text-sm text-danger" : "text-sm text-primary"
            }
          >
            {saveState.status === "success" && (
              <CheckCircle2 className="mr-1 inline size-4" aria-hidden="true" />
            )}
            {saveState.message}
          </p>
          <Button
            variant="secondary"
            disabled={!isDirty || isSubmitting}
            onClick={() => reset()}
          >
            Discard changes
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Save profile
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-22 lg:self-start">
        <ProfileCompletionCard checklist={checklist} percent={percent} />
      </aside>
    </form>
  );
}
