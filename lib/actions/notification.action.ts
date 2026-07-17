"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { NotificationService } from "../service/business-services/notification.service";

export async function markNotificationAsReadAction(id: string) {
  const session = await getAppSession();
  if (!session || typeof session === "string") {
    return { success: false, error: "Unauthorized session" } as AppResponse;
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const { userId, facilityId } = session;

  const response = await NotificationService.markAsRead(id, userId, facilityId || "", ipAddress, userAgent)

  if (response.success) {
    revalidatePath(`/notification`, "layout");
    return { message: response.message, success: response.success, data: response.data };
  } else {
    return { error: response.error, success: response.success };
  }
}

export async function markAllNotificationsAsReadAction() {
  const session = await getAppSession();
  if (!session || typeof session === "string") {
    return { success: false, error: "Unauthorized session" } as AppResponse;
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const { userId, facilityId } = session;

  const response = await NotificationService.markAllAsRead(userId, facilityId || "", ipAddress, userAgent)

  if (response.success) {
    revalidatePath(`/notification`, "layout");
    return { message: response.message, success: response.success, data: response.data };
  } else {
    return { error: response.error, success: response.success };
  }
}
