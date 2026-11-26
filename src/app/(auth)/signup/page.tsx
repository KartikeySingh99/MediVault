import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <SignupForm />
      </div>
    </main>
  );
}
