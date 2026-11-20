import { z } from "zod";

export const RELATIONSHIP_LABELS = {
  self: "You",
  spouse: "Spouse",
  parent: "Parent",
  sibling: "Sibling",
  child: "Child",
  other: "Other",
};

/** Relationships a user can pick when adding someone (not "self"). */
export const FAMILY_RELATIONSHIPS = ["spouse", "parent", "sibling", "child", "other"];

export const familyMemberSchema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(60, "Name is too long"),
  relationship: z.enum(FAMILY_RELATIONSHIPS, { message: "Choose a relationship" }),
  consent: z.literal(true, {
    message: "Please confirm you have permission to manage their information",
  }),
});
