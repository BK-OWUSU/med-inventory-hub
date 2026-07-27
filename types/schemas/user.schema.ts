import { UserRole } from "@/generated/prisma/browser";
import * as z from "zod";

export const VISIBLE_ROLES = [
  UserRole.PHARMACIST,
  UserRole.STAFF,
  UserRole.VIEWER,
] as const;

export const CreateUserSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address format"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(VISIBLE_ROLES, {
    required_error: "Please specify the user role",
  }),
  facilityId: z.string().min(1, "Facility is required"), // 👈 Add th
  phone: z.string().optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
  needsPasswordChange: z.boolean().default(true),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.string().min(1, "ID is required"),
  customId: z.string().min(3, "Custom ID must be at least 3 characters"),
});

export type CreateUserInput = z.input<typeof CreateUserSchema>;
export type UpdateUserInput = z.input<typeof UpdateUserSchema>;
