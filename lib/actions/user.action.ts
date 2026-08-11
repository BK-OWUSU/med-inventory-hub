"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { UserService } from "../service/auth-services/user-service";
import { CreateUserInput, UpdateUserInput } from "@/types/schemas/user.schema";
import { PasswordChangeInput } from "@/types/schemas/auth.schema";

export async function createUserAction(payload: CreateUserInput) {
  const session = await getAppSession();
  if (!session || typeof session === "string") {
    return { success: false, error: "Unauthorized session" } as AppResponse;
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const { userId, facilityId } = session;

  const response = await UserService.createUser(payload, userId, facilityId || "", ipAddress, userAgent)

  if (response.success) {
    revalidatePath(`/user`, "layout");
    return { message: response.message, success: response.success, data: response.data };
  } else {
    return { error: response.error, success: response.success };
  }
}

export async function updateUserAction(id: string, payload: UpdateUserInput) {
  const session = await getAppSession();
  if (!session || typeof session === "string") {
    return { success: false, error: "Unauthorized session" } as AppResponse;
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const { userId, facilityId } = session;

  const response = await UserService.updateUser(id, payload, userId, facilityId || "", ipAddress, userAgent)

  if (response.success) {
    revalidatePath(`/user`, "layout");
    return { message: response.message, success: response.success, data: response.data };
  } else {
    return { error: response.error, success: response.success };
  }
}

export async function toggleUserStatus(id: string) {
  const session = await getAppSession();
  if (!session || typeof session === "string") {
    return { success: false, error: "Unauthorized session" } as AppResponse;
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const { userId, facilityId } = session;

  const response = await UserService.toggleUserStatus(id, userId, facilityId || "", ipAddress, userAgent)

  if (response.success) {
    revalidatePath(`/user`, "layout");
    return { message: response.message, success: response.success, data: response.data };
  } else {
    return { error: response.error, success: response.success };
  }
}


export async function changePasswordAction(id: string, data: PasswordChangeInput) {
 const session = await getAppSession();
  if (!session || typeof session === "string") {
    return { success: false, error: "Unauthorized session" } as AppResponse;
  }

  const { ipAddress, userAgent } = await getRequestMeta();

  // const response = await UserService.changePassword(id, userId, facilityId || "", ipAddress, userAgent)
  const response = await UserService.changePassword(id, data, ipAddress, userAgent)

  if (response.success) {
    revalidatePath(`/account/profile`, "layout");
    return { message: response.message, success: response.success};
  } else {
    return { error: response.error, success: response.success };
  }
}
