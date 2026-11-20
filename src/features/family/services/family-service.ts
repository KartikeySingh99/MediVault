// TEMPORARY persistence: browser localStorage, until Supabase is set up.
// In Supabase this becomes the `profiles` table (id, owner_user_id, relationship, name),
// and every health table references profile_id.
import { deleteHealthProfile } from "@/features/profile/services/profile-service";
import { removeProfileFromIdInsurance } from "@/features/id-insurance/services/id-insurance-service";
import { familyMemberSchema, type FamilyMemberFormValues, type FamilyProfile } from "../schema";

const PROFILES_KEY = "medivault:family-profiles";
const ACTIVE_KEY = "medivault:active-profile-id";

function readProfiles(): FamilyProfile[] {
  try {
    const list: unknown = JSON.parse(window.localStorage.getItem(PROFILES_KEY) ?? "[]");
    return Array.isArray(list) ? (list as FamilyProfile[]) : [];
  } catch {
    return [];
  }
}

function writeProfiles(list: FamilyProfile[]): void {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
}

/** Returns all profiles, creating the account owner's "self" profile on first run. */
export async function listFamilyProfiles(): Promise<FamilyProfile[]> {
  let list = readProfiles();
  if (!list.some((p) => p.relationship === "self")) {
    const self: FamilyProfile = {
      id: crypto.randomUUID(),
      name: "Me",
      relationship: "self",
      createdAt: new Date().toISOString(),
    };
    list = [self, ...list];
    writeProfiles(list);
  }
  return list;
}

/** Accepts raw form values and validates them; never trust the caller. */
export async function createFamilyProfile(input: FamilyMemberFormValues): Promise<FamilyProfile> {
  const { name, relationship } = familyMemberSchema.parse(input);
  const profile: FamilyProfile = {
    id: crypto.randomUUID(),
    name,
    relationship,
    createdAt: new Date().toISOString(),
  };
  writeProfiles([...readProfiles(), profile]);
  return profile;
}

export async function renameFamilyProfile(
  id: string,
  name: string
): Promise<FamilyProfile | undefined> {
  const list = readProfiles().map((p) => (p.id === id ? { ...p, name } : p));
  writeProfiles(list);
  return list.find((p) => p.id === id);
}

export async function deleteFamilyProfile(id: string): Promise<void> {
  const list = readProfiles();
  const target = list.find((p) => p.id === id);
  if (!target) return;
  if (target.relationship === "self") throw new Error("Your own profile cannot be removed");
  writeProfiles(list.filter((p) => p.id !== id));
  await deleteHealthProfile(id);
  await removeProfileFromIdInsurance(id);
}

export function getStoredActiveProfileId(): string | null {
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function setStoredActiveProfileId(id: string): void {
  window.localStorage.setItem(ACTIVE_KEY, id);
}
