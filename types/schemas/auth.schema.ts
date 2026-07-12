import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.input<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address format"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;