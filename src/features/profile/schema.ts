import { z } from "zod";

export const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"] as const;
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const MAX_LIST_ITEMS = 30;

const listItem = z.string().trim().min(1).max(100, "Keep each entry under 100 characters");

const medicineSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  dosage: z.string().trim().max(100, "Dosage is too long"),
});

function isValidPastDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date <= new Date() && date.getFullYear() >= 1900;
}

export const profileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name is too long"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine(isValidPastDate, "Enter a valid date that is not in the future"),
    gender: z.enum(["", ...GENDER_OPTIONS]),
    bloodGroup: z.enum(["", ...BLOOD_GROUPS]),
    noKnownAllergies: z.boolean(),
    allergies: z.array(listItem).max(MAX_LIST_ITEMS, `Up to ${MAX_LIST_ITEMS} entries`),
    conditions: z.array(listItem).max(MAX_LIST_ITEMS, `Up to ${MAX_LIST_ITEMS} entries`),
    medications: z.array(medicineSchema).max(MAX_LIST_ITEMS),
    supplements: z.array(medicineSchema).max(MAX_LIST_ITEMS),
    medicalHistory: z.string().trim().max(2000, "Keep this under 2000 characters"),
  })
  .refine((data) => !(data.noKnownAllergies && data.allergies.length > 0), {
    path: ["allergies"],
    message: "Remove the listed allergies or untick “No known allergies”",
  });

/** Inferred from the schema, so the type and the validation can never drift apart. */
export type HealthProfile = z.output<typeof profileSchema>;
export type Medicine = z.output<typeof medicineSchema>;

export const EMPTY_PROFILE: HealthProfile = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  noKnownAllergies: false,
  allergies: [],
  conditions: [],
  medications: [],
  supplements: [],
  medicalHistory: "",
};
