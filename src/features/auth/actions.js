"use server";

import {z} from "zod";
import { redirect } from "next/navigation"; 
import { createClient } from "@/lib/supabase/server";   
import { loginSchema, signupSchema } from "./schema";

export async function signup(prevState, formData){
    const input = {
        fullName: formData.get("fullName") ?? "",
        email: formData.get("email") ?? "",
        password: formData.get("password") ?? "",
    };

    const values = {fullName: input.fullName, email: input.email};

    const parsed = signupSchema.safeParse(input);
    if(!parsed.success){
        return { errors: z.flattenError(parsed.error).fieldErrors, values}
    }

    const {fullName, email, password} = parsed.data;
    const supabse = await createClient();
    const { error } = await supabse.auth.signUp({
        email,
        password,
        options: {
            data: {full_name: fullName},
        }});
    if(error){
        return {message:error.message, values}
    }

    redirect("/dashboard");
}

export async function login(prevState, formData) {
  const input = {
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  };
  const values = { email: input.email };

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Same message whether the email exists or not, so attackers can't
    // use the login form to discover which emails have accounts.
    return { message: "Incorrect email or password", values };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}   