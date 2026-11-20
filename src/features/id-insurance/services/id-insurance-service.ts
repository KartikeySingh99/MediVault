// TEMPORARY persistence: details in localStorage, files in IndexedDB, until Supabase is set up.
// Planned tables: documents (kind = identity | insurance, profile_id),
// insurance_policies, insurance_policy_members (policy_id, profile_id) for family floaters.
// Identity documents are never sent to the AI provider.
import { deleteFile, getFile, putFile } from "@/lib/file-store";
import { validateFile } from "@/lib/files";
import {
  identityDocumentSchema,
  insurancePolicySchema,
  type IdentityDocument,
  type IdentityDocumentFormValues,
  type InsurancePolicy,
  type InsurancePolicyFormValues,
  type StoredFileMeta,
} from "../schema";

const DOCS_KEY = "medivault:identity-documents";
const POLICIES_KEY = "medivault:insurance-policies";

function read<T>(key: string): T[] {
  try {
    const list: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(list) ? (list as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, list: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(list));
}

const readDocs = () => read<IdentityDocument>(DOCS_KEY);
const readPolicies = () => read<InsurancePolicy>(POLICIES_KEY);

async function storeFiles(files: File[]): Promise<StoredFileMeta[]> {
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

async function removeFiles(files: StoredFileMeta[] = []): Promise<void> {
  await Promise.all(files.map((f) => deleteFile(f.id)));
}

export const getStoredFile = (fileId: string) => getFile(fileId);

// ---- Identity documents ----

export async function listIdentityDocuments(profileId: string): Promise<IdentityDocument[]> {
  return readDocs().filter((d) => d.profileId === profileId);
}

export async function addIdentityDocument(
  profileId: string,
  input: IdentityDocumentFormValues
): Promise<IdentityDocument> {
  const { files, ...data } = identityDocumentSchema.parse(input);
  const storedFiles = await storeFiles(files);
  const doc: IdentityDocument = {
    id: crypto.randomUUID(),
    profileId,
    ...data,
    files: storedFiles,
    createdAt: new Date().toISOString(),
  };
  write(DOCS_KEY, [...readDocs(), doc]);
  return doc;
}

export async function deleteIdentityDocument(id: string): Promise<void> {
  const list = readDocs();
  const doc = list.find((d) => d.id === id);
  write(DOCS_KEY, list.filter((d) => d.id !== id));
  await removeFiles(doc?.files);
}

// ---- Insurance policies ----

export async function listInsurancePolicies(profileId: string): Promise<InsurancePolicy[]> {
  return readPolicies().filter((p) => p.coveredProfileIds.includes(profileId));
}

export async function addInsurancePolicy(
  input: InsurancePolicyFormValues
): Promise<InsurancePolicy> {
  const { files, ...data } = insurancePolicySchema.parse(input);
  const storedFiles = await storeFiles(files);
  const policy: InsurancePolicy = {
    id: crypto.randomUUID(),
    ...data,
    files: storedFiles,
    createdAt: new Date().toISOString(),
  };
  write(POLICIES_KEY, [...readPolicies(), policy]);
  return policy;
}

export async function deleteInsurancePolicy(id: string): Promise<void> {
  const list = readPolicies();
  const policy = list.find((p) => p.id === id);
  write(POLICIES_KEY, list.filter((p) => p.id !== id));
  await removeFiles(policy?.files);
}

/** Called when a family profile is deleted. */
export async function removeProfileFromIdInsurance(profileId: string): Promise<void> {
  const docs = readDocs();
  write(DOCS_KEY, docs.filter((d) => d.profileId !== profileId));
  await removeFiles(docs.filter((d) => d.profileId === profileId).flatMap((d) => d.files));

  const kept: InsurancePolicy[] = [];
  for (const policy of readPolicies()) {
    const covered = policy.coveredProfileIds.filter((id) => id !== profileId);
    if (covered.length > 0) kept.push({ ...policy, coveredProfileIds: covered });
    else await removeFiles(policy.files); // nobody left on this policy
  }
  write(POLICIES_KEY, kept);
}
