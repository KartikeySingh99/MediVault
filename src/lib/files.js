export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const FILE_INPUT_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

/**
 * Detects the real file type from its first bytes ("magic numbers").
 * The browser-reported MIME type is based on the extension and can't be trusted.
 * The server will repeat this check once uploads go to Supabase.
 */
export async function detectFileType(file) {
  const b = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf"; // %PDF
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  return null;
}

/** Returns an error message, or null if the file is acceptable. */
export async function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) return `${file.name} is larger than 10 MB`;
  if (file.size === 0) return `${file.name} is empty`;
  if (!(await detectFileType(file))) return `${file.name} is not a PDF, JPG or PNG`;
  return null;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
