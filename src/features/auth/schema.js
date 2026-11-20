import {z} from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({email,password: z.string().min(1, "Enter your password")});

export const signupSchema = z.object({fullName:z.string().trim().min(2, "Enter your fullname").max(100, "Name is too long"),
    email,
    password: z.string().min(8, "Use at least 8 characters").max(16,"Use at most 16 characters")});``