"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField, inputClassName } from "@/components/ui/form-field";
import { login } from "@/features/auth/actions";

type LoginState = {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
  values?: { email: string };
};

const initialState: LoginState = { values: { email: "" } };

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, initialState);
  const emailError = state.errors?.email?.[0];
  const passwordError = state.errors?.password?.[0];

  return (
    <form action={formAction} className="mt-6 space-y-4 text-left">
      <FormField id="email" label="Email" error={emailError}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
          className={inputClassName(!!emailError)}
          placeholder="Enter your email"
        />
      </FormField>
      <FormField id="password" label="Password" error={passwordError}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error" : undefined}
          className={inputClassName(!!passwordError)}
          placeholder="Enter your password"
        />
      </FormField>
      {state.message && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
      </p>
    </form>
  );
}
