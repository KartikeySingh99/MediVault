/** Age in whole years from a YYYY-MM-DD string, or null if invalid. */
export function calculateAge(dateOfBirth) {
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

/**
 * Checklist used for the profile completion score.
 * Allergies count as complete when listed OR explicitly marked "none known",
 * because an empty allergy list is ambiguous in an emergency.
 */
export function getCompletionChecklist(profile) {
  return [
    { label: "Full name", done: Boolean(profile.fullName?.trim()) },
    { label: "Date of birth", done: Boolean(profile.dateOfBirth) },
    { label: "Gender", done: Boolean(profile.gender) },
    { label: "Blood group", done: Boolean(profile.bloodGroup) },
    {
      label: "Allergies",
      done: profile.noKnownAllergies || profile.allergies?.length > 0,
    },
    { label: "Medical conditions", done: profile.conditions?.length > 0 },
    { label: "Current medications", done: profile.medications?.length > 0 },
    { label: "Medical history", done: Boolean(profile.medicalHistory?.trim()) },
  ];
}

export function calculateProfileCompletion(profile) {
  const checklist = getCompletionChecklist(profile);
  const done = checklist.filter((item) => item.done).length;
  return Math.round((done / checklist.length) * 100);
}
