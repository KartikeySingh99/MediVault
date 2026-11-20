import { z } from "zod";

export const IDENTITY_TYPES = {
  aadhaar: "Aadhaar (masked)",
  pan: "PAN card",
  voter_id: "Voter ID",
  passport: "Passport",
  driving_licence: "Driving licence",
  other: "Other ID",
} as const;
export type IdentityType = keyof typeof IDENTITY_TYPES;

export const COVER_TYPES = {
  individual: "Individual",
  family_floater: "Family floater",
} as const;
export type CoverType = keyof typeof COVER_TYPES;

// z.enum needs a non-empty tuple, which Object.keys() can't express on its own.
const IDENTITY_TYPE_KEYS = Object.keys(IDENTITY_TYPES) as [IdentityType, ...IdentityType[]];
const COVER_TYPE_KEYS = Object.keys(COVER_TYPES) as [CoverType, ...CoverType[]];

export const MAX_FILES_PER_ITEM = 3;

const filesSchema = z
  .array(z.instanceof(File))
  .max(MAX_FILES_PER_ITEM, `Up to ${MAX_FILES_PER_ITEM} files`);

export const identityDocumentSchema = z
  .object({
    // Input may be "" (nothing selected yet); output is always a real type.
    type: z
      .union([z.literal(""), z.enum(IDENTITY_TYPE_KEYS)])
      .pipe(z.enum(IDENTITY_TYPE_KEYS, { message: "Choose a document type" })),
    label: z.string().trim().max(60, "Keep the name under 60 characters"),
    // Only the last 4 characters are ever stored, never the full ID number.
    last4: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^([A-Z0-9]{4})?$/, "Enter only the last 4 characters"),
    files: filesSchema.min(1, "Add at least one file (e.g. front and back)"),
  })
  .refine((d) => d.type !== "aadhaar" || /^\d{4}$/.test(d.last4), {
    path: ["last4"],
    message: "Enter the last 4 digits shown on your masked Aadhaar",
  })
  .refine((d) => d.type !== "other" || d.label.length > 0, {
    path: ["label"],
    message: "Name this document",
  });

export const insurancePolicySchema = z
  .object({
    insurer: z.string().trim().min(2, "Enter the insurance company").max(80),
    planName: z.string().trim().max(80),
    policyNumber: z.string().trim().min(3, "Enter the policy number").max(40),
    memberId: z.string().trim().max(40),
    coverType: z.enum(COVER_TYPE_KEYS),
    sumInsured: z.string().trim().regex(/^\d*$/, "Numbers only, without commas"),
    validUntil: z.string(),
    tpaName: z.string().trim().max(80),
    tpaHelpline: z
      .string()
      .trim()
      .regex(/^(\+?[\d\s-]{6,20})?$/, "Enter a valid phone number"),
    coveredProfileIds: z.array(z.string()).min(1, "Select at least one covered member"),
    files: filesSchema,
  })
  .refine((d) => d.coverType !== "individual" || d.coveredProfileIds.length === 1, {
    path: ["coveredProfileIds"],
    message: "An individual policy covers exactly one person",
  });

export type IdentityDocumentFormValues = z.input<typeof identityDocumentSchema>;
export type IdentityDocumentInput = z.output<typeof identityDocumentSchema>;
export type InsurancePolicyFormValues = z.input<typeof insurancePolicySchema>;
export type InsurancePolicyInput = z.output<typeof insurancePolicySchema>;

/** Metadata saved for an uploaded file; the bytes live in file storage. */
export interface StoredFileMeta {
  id: string;
  name: string;
  type: string;
  size: number;
}

export type IdentityDocument = Omit<IdentityDocumentInput, "files"> & {
  id: string;
  profileId: string;
  files: StoredFileMeta[];
  createdAt: string;
};

export type InsurancePolicy = Omit<InsurancePolicyInput, "files"> & {
  id: string;
  files: StoredFileMeta[];
  createdAt: string;
};
