import { z } from "zod";

export const CreateNotificationSchema = z.object({
  facilityId: z.string().min(1, "Facility is required"),
  userId: z.string().optional().nullable(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  message: z.string().min(2, "Message must be at least 2 characters"),
  isRead: z.boolean().default(false),
});

export const UpdateNotificationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  isRead: z.boolean(),
});

export type CreateNotificationInput = z.input<typeof CreateNotificationSchema>;
export type UpdateNotificationInput = z.input<typeof UpdateNotificationSchema>;
