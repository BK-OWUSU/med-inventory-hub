"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { OrderService } from "../service/business-services/OrderService";
import { CreateOrderInput, UpdateOrderInput } from "@/types/schemas/order.schema";




export async function createOrderAction(payload: CreateOrderInput) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.createOrder(payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/inventory/inventory-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function updateOrderAction( orderId: string, payload: UpdateOrderInput) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.updateOrder(orderId, payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/inventory/inventory-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}





