import { FacilityType, UserRole } from "@/generated/prisma/browser";
import * as z from "zod";


export const CreateFacilitySchema = z.object({
  name: z.string().min(2, "Facility name is required"),
  type:z.nativeEnum(FacilityType, {
      required_error: "Please specify the type of facility",
    }),
  location: z.string().min(2, "Location is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "License number is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),

  //Fields for first Amin
  adminEmail: z.string().min(1, "Email is required").email("Invalid email address format"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.literal(UserRole.ADMIN).default(UserRole.ADMIN),
});
// Types inferred from Zod
export type CreateFacilityInput = z.input<typeof CreateFacilitySchema>;



export const UpdateFacilitySchema = z.object({
    id: z.string().min(1, "ID is required"),  
    customId: z.string().min(3, "Custom ID must be at least 3 characters"),
    name: z.string().min(2, "Facility name is required"),
    type:z.nativeEnum(FacilityType, {
      required_error: "Please specify the type of facility",
    }),
  location: z.string().min(2, "Location is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "License number is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});
export type UpdateFacilityInput = z.input<typeof UpdateFacilitySchema>;