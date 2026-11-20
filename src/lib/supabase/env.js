// process.env.NEXT_PUBLIC_* must be written out literally so Next.js can inline them in the browser bundle.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseEnv() {
  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Copy .env.example to .env.local, fill in " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart the dev server."
    );
  }
  if (new URL(url).pathname !== "/") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be just https://<project-ref>.supabase.co, without /rest/v1 or any other path."
    );
  }
  return { url, publishableKey };
}
