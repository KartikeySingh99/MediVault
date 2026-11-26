'use client'

import Link from 'next/link';
import { signup } from '@/features/auth/actions';
import { FormField, inputClassName } from '@/components/ui/form-field';
import { useActionState } from 'react';

type SignupFormState = {
 errors?: {email?:string[], password?:string[], fullName?: string[]},
 message?: string,
 values?: {email:string}
}

const initialState: SignupFormState = { values: { email: ""} };

const SignupForm = () => {
    const [state, formAction, pending] = useActionState<SignupFormState, FormData>(signup, initialState )
    console.log(state.values);
    
  return (
    <form action={formAction}>
        <FormField id='email' label='email'>
            <input type="email" name="email" id="email" />
        </FormField>
        <FormField id='fullName' label='fullName'>
            <input type="text" name='fullName' id='fullName' />
        </FormField>
        <FormField id='password' label='password' >
            <input type="password" name="password" id="password" />
        </FormField>
        <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  )
}

export default SignupForm