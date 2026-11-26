import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Log in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
