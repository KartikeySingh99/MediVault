import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <p className="mt-2 text-sm text-muted">Authentication arrives on Day 4 (Supabase Auth).</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Continue to dashboard
        </Link>
      </div>
    </main>
  );
}
