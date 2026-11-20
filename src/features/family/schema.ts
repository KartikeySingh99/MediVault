import { z } from "zod";

export const RELATIONSHIPS = ["self", "spouse", "parent", "sibling", "child", "other"] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  self: "You",
  spouse: "Spouse",
  parent: "Parent",
  sibling: "Sibling",
  child: "Child",
  other: "Other",
};

/** Relationships a user can pick when adding someone (not "self"). */
export const FAMILY_RELATIONSHIPS = ["spouse", "parent", "sibling", "child", "other"] as const;
export type FamilyRelationship = (typeof FAMILY_RELATIONSHIPS)[number];

// .pipe() gives each field a wider INPUT type (what the form holds before validation:
// "" = nothing selected yet, consent unticked) and a strict OUTPUT type (what you get after).
export const familyMemberSchema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(60, "Name is too long"),
  relationship: z
    .union([z.literal(""), z.enum(FAMILY_RELATIONSHIPS)])
    .pipe(z.enum(FAMILY_RELATIONSHIPS, { message: "Choose a relationship" })),
  consent: z.boolean().pipe(
    z.literal(true, {
      message: "Please confirm you have permission to manage their information",
    })
  ),
});

/** { name: string; relationship: "" | FamilyRelationship; consent: boolean } */
export type FamilyMemberFormValues = z.input<typeof familyMemberSchema>;
/** { name: string; relationship: FamilyRelationship; consent: true } */
export type FamilyMemberInput = z.output<typeof familyMemberSchema>;

/** A person whose records the account manages. Mirrors the `profiles` table. */
export interface FamilyProfile {
  id: string;
  name: string;
  relationship: Relationship;
  createdAt: string;
}
