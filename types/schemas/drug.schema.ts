
import { DosageForm, Unit } from "@/generated/prisma/enums";
import * as z from "zod";


export const drugFormSchema = z.object({
  name: z.string().min(2, "Drug name must be at least 2 characters long"),
  genericName: z.string().optional(),
  categoryId: z.string().min(1, "Please select a drug category"),
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
});

export type DrugFormValues = z.input<typeof drugFormSchema>;
export type UpdateDrugFormValues = z.infer<typeof drugFormSchema>;


//DRUG CATEGORY
export const drugCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters long." })
    .max(50, { message: "Category name cannot exceed 50 characters." })
    .trim(),
  isActive: z.boolean().default(true),
})

export type DrugCategoryFormValues = z.input<typeof drugCategorySchema>
export type UpdateDrugCategoryFormValues = z.infer<typeof drugCategorySchema>