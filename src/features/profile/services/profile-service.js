// TEMPORARY persistence: browser localStorage, until Supabase is set up.
// Use synthetic data only. Health data in localStorage is not acceptable for production.
// Data is stored per family profile (profileId), mirroring the planned profile_id foreign key.
// The async signatures match the future API so components won't need to change.
import { EMPTY_PROFILE, profileSchema } from "../schema";

const storageKey = (profileId) => `medivault:health-profile:${profileId}`;

export async function getHealthProfile(profileId) {
  try {
    const raw = window.localStorage.getItem(storageKey(profileId));
    if (!raw) return null;
    const parsed = profileSchema.safeParse({ ...EMPTY_PROFILE, ...JSON.parse(raw) });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function saveHealthProfile(profileId, profile) {
  const data = profileSchema.parse(profile);
  window.localStorage.setItem(storageKey(profileId), JSON.stringify(data));
  return data;
}

export async function deleteHealthProfile(profileId) {
  window.localStorage.removeItem(storageKey(profileId));
}
