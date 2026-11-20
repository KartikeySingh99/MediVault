// Verifies the Supabase connection and schema without printing any secrets.
// Usage: npm run check:supabase   (reads .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}
if (key.startsWith("sb_secret_")) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contains a SECRET key. Use the publishable key and rotate the secret key.");
  process.exit(1);
}

if (new URL(url).pathname !== "/") {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL must be just https://<ref>.supabase.co, without /rest/v1 or any other path.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const TABLES = [
  "profiles",
  "health_profiles",
  "emergency_contacts",
  "documents",
  "document_extractions",
  "insurance_policies",
  "insurance_policy_members",
  "files",
];

let failed = false;
console.log(`Checking ${new URL(url).host} as an anonymous (signed-out) user…\n`);

for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  if (error && /permission denied/i.test(error.message)) {
    // Expected after 0002: anon has no table privileges at all.
    console.log(`✓ ${table}: exists, anonymous access denied`);
  } else if (error) {
    failed = true;
    console.log(`✗ ${table}: ${error.message}`);
  } else if (data.length > 0) {
    failed = true;
    console.log(`✗ ${table}: anonymous user can read rows. RLS is NOT protecting this table!`);
  } else {
    console.log(`✓ ${table}: exists, anonymous access returns nothing`);
  }
}

const { error: uploadError } = await supabase.storage
  .from("vault")
  .upload(`anonymous-check/${Date.now()}.txt`, new Blob(["x"]), { contentType: "text/plain" });
if (uploadError) {
  console.log("✓ storage: anonymous upload to the vault bucket is rejected");
} else {
  failed = true;
  console.log("✗ storage: anonymous upload SUCCEEDED. Check the vault bucket policies!");
}

console.log(failed ? "\nSome checks failed." : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
