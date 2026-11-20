/** Age in whole years from a YYYY-MM-DD string, or null if invalid. */
export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const birthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!birthdayPassed) age -= 1;
  return age >= 0 ? age : null;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

/**
 * A loose profile shape: the checklist also runs on live, half-filled form values,
 * where any field (even inside arrays) may still be undefined.
 */
export interface CompletionInput {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  noKnownAllergies?: boolean;
  allergies?: readonly unknown[];
  conditions?: readonly unknown[];
  medications?: readonly unknown[];
  medicalHistory?: string;
}

/**
 * Checklist used for the profile completion score.
 * Allergies count as complete when listed OR explicitly marked "none known",
 * because an empty allergy list is ambiguous in an emergency.
 */
export function getCompletionChecklist(profile: CompletionInput): ChecklistItem[] {
  return [
    { label: "Full name", done: Boolean(profile.fullName?.trim()) },
    { label: "Date of birth", done: Boolean(profile.dateOfBirth) },
    { label: "Gender", done: Boolean(profile.gender) },
    { label: "Blood group", done: Boolean(profile.bloodGroup) },
    {
      label: "Allergies",
      done: Boolean(profile.noKnownAllergies) || (profile.allergies?.length ?? 0) > 0,
    },
    { label: "Medical conditions", done: (profile.conditions?.length ?? 0) > 0 },
    { label: "Current medications", done: (profile.medications?.length ?? 0) > 0 },
    { label: "Medical history", done: Boolean(profile.medicalHistory?.trim()) },
  ];
}

export function calculateProfileCompletion(profile: CompletionInput): number {
  const checklist = getCompletionChecklist(profile);
  const done = checklist.filter((item) => item.done).length;
  return Math.round((done / checklist.length) * 100);
}
