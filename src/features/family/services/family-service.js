// TEMPORARY persistence: browser localStorage, until Supabase is set up.
// In Supabase this becomes the `profiles` table (id, owner_user_id, relationship, name),
// and every health table references profile_id.
import { deleteHealthProfile } from "@/features/profile/services/profile-service";
import { removeProfileFromIdInsurance } from "@/features/id-insurance/services/id-insurance-service";
import { familyMemberSchema } from "../schema";

const PROFILES_KEY = "medivault:family-profiles";
const ACTIVE_KEY = "medivault:active-profile-id";

function readProfiles() {
  try {
    const list = JSON.parse(window.localStorage.getItem(PROFILES_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeProfiles(list) {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
}

/** Returns all profiles, creating the account owner's "self" profile on first run. */
export async function listFamilyProfiles() {
  let list = readProfiles();
  if (!list.some((p) => p.relationship === "self")) {
    const self = {
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

export async function createFamilyProfile(input) {
  const { name, relationship } = familyMemberSchema.parse(input);
  const profile = {
    id: crypto.randomUUID(),
    name,
    relationship,
    createdAt: new Date().toISOString(),
  };
  writeProfiles([...readProfiles(), profile]);
  return profile;
}

export async function renameFamilyProfile(id, name) {
  const list = readProfiles().map((p) => (p.id === id ? { ...p, name } : p));
  writeProfiles(list);
  return list.find((p) => p.id === id);
}

export async function deleteFamilyProfile(id) {
  const list = readProfiles();
  const target = list.find((p) => p.id === id);
  if (!target) return;
  if (target.relationship === "self") throw new Error("Your own profile cannot be removed");
  writeProfiles(list.filter((p) => p.id !== id));
  await deleteHealthProfile(id);
  await removeProfileFromIdInsurance(id);
}

export function getStoredActiveProfileId() {
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function setStoredActiveProfileId(id) {
  window.localStorage.setItem(ACTIVE_KEY, id);
}
