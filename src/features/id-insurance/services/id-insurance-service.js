// TEMPORARY persistence: details in localStorage, files in IndexedDB, until Supabase is set up.
// Planned tables: documents (kind = identity | insurance, profile_id),
// insurance_policies, insurance_policy_members (policy_id, profile_id) for family floaters.
// Identity documents are never sent to the AI provider.
import { deleteFile, getFile, putFile } from "@/lib/file-store";
import { validateFile } from "@/lib/files";
import { identityDocumentSchema, insurancePolicySchema } from "../schema";

const DOCS_KEY = "medivault:identity-documents";
const POLICIES_KEY = "medivault:insurance-policies";

function read(key) {
  try {
    const list = JSON.parse(window.localStorage.getItem(key));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(key, list) {
  window.localStorage.setItem(key, JSON.stringify(list));
}

async function storeFiles(files) {
  for (const file of files) {
    const error = await validateFile(file);
    if (error) throw new Error(error);
  }
  return Promise.all(
    files.map(async (file) => {
      const id = crypto.randomUUID();
      await putFile(id, file);
      return { id, name: file.name, type: file.type, size: file.size };
    })
  );
}

async function removeFiles(files = []) {
  await Promise.all(files.map((f) => deleteFile(f.id)));
}

export const getStoredFile = (fileId) => getFile(fileId);

// ---- Identity documents ----

export async function listIdentityDocuments(profileId) {
  return read(DOCS_KEY).filter((d) => d.profileId === profileId);
}

export async function addIdentityDocument(profileId, input) {
  const { files, ...data } = identityDocumentSchema.parse(input);
  const storedFiles = await storeFiles(files);
  const doc = {
    id: crypto.randomUUID(),
    profileId,
    ...data,
    files: storedFiles,
    createdAt: new Date().toISOString(),
  };
  write(DOCS_KEY, [...read(DOCS_KEY), doc]);
  return doc;
}

export async function deleteIdentityDocument(id) {
  const list = read(DOCS_KEY);
  const doc = list.find((d) => d.id === id);
  write(DOCS_KEY, list.filter((d) => d.id !== id));
  await removeFiles(doc?.files);
}

// ---- Insurance policies ----

export async function listInsurancePolicies(profileId) {
  return read(POLICIES_KEY).filter((p) => p.coveredProfileIds.includes(profileId));
}

export async function addInsurancePolicy(input) {
  const { files, ...data } = insurancePolicySchema.parse(input);
  const storedFiles = await storeFiles(files);
  const policy = {
    id: crypto.randomUUID(),
    ...data,
    files: storedFiles,
    createdAt: new Date().toISOString(),
  };
  write(POLICIES_KEY, [...read(POLICIES_KEY), policy]);
  return policy;
}

export async function deleteInsurancePolicy(id) {
  const list = read(POLICIES_KEY);
  const policy = list.find((p) => p.id === id);
  write(POLICIES_KEY, list.filter((p) => p.id !== id));
  await removeFiles(policy?.files);
}

/** Called when a family profile is deleted. */
export async function removeProfileFromIdInsurance(profileId) {
  const docs = read(DOCS_KEY);
  write(DOCS_KEY, docs.filter((d) => d.profileId !== profileId));
  await removeFiles(docs.filter((d) => d.profileId === profileId).flatMap((d) => d.files));

  const kept = [];
  for (const policy of read(POLICIES_KEY)) {
    const covered = policy.coveredProfileIds.filter((id) => id !== profileId);
    if (covered.length > 0) kept.push({ ...policy, coveredProfileIds: covered });
    else await removeFiles(policy.files); // nobody left on this policy
  }
  write(POLICIES_KEY, kept);
}
