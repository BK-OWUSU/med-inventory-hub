
import { DosageForm, Unit } from "@/generated/prisma/enums";
import * as z from "zod";


export const drugFormSchema = z.object({
  name: z.string().min(2, "Drug name must be at least 2 characters long"),
  genericName: z.string().optional(),
  categoryId: z.string().optional(),
  strength: z.string().optional(),
  unit: z.nativeEnum(Unit, {
    errorMap: () => ({ message: "Please select a valid structural unit pack" }),
  }),
  dosageForm: z.nativeEnum(DosageForm).optional(),
  isControlled: z.boolean().default(false),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  // Additional configuration fields mapped from the optional UI layout section
  minStockLevel: z.coerce.number().int().min(0).default(20),
  manufacturer: z.string().optional(),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
  isActive: z.boolean().default(true),
});

export type DrugFormValues = z.input<typeof drugFormSchema>;

// The update schema mirrors the creation rules but is tailored for edit submissions
export const updateDrugFormSchema = z.object({
  name: z.string().min(2, "Drug name must be at least 2 characters long"),
  genericName: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional(),
  strength: z.string().optional().or(z.literal("")),
  unit: z.nativeEnum(Unit, {
    errorMap: () => ({ message: "Please select a valid structural unit pack" }),
  }),
  dosageForm: z.nativeEnum(DosageForm).optional(),
  isControlled: z.boolean().default(false),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  
  // Coerces string inputs from HTML form elements to numbers cleanly
  minStockLevel: z.coerce.number().int().min(0, "Minimum stock level must be at least 0").default(20),
  manufacturer: z.string().optional().or(z.literal("")),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type UpdateDrugFormValues = z.input<typeof updateDrugFormSchema>;


//DRUG CATEGORY
export const drugCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters long." })
    .max(50, { message: "Category name cannot exceed 50 characters." })
    .trim(),
  key: z.string().min(2, "Drug name must be at least 2 characters long"),  
  isActive: z.boolean().default(true),
})

export type DrugCategoryFormValues = z.input<typeof drugCategorySchema>
export type UpdateDrugCategoryFormValues = z.infer<typeof drugCategorySchema>