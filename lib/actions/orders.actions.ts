"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { OrderService } from "../service/business-services/OrderService";
import { CreateOrderInput, ReceivedOrderItemsInput, UpdateOrderInput } from "@/types/schemas/order.schema";




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
        revalidatePath(`/orders`, 'layout');
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
        revalidatePath(`/orders`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function receiveOrderAction( orderId: string, payload: ReceivedOrderItemsInput) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.receiveOrder(orderId, payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/orders`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function approveOrderAction( orderId: string) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.approveOrder(orderId, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/orders`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}



export async function rejectOrderAction( orderId: string, reason: string) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.rejectOrder(orderId,reason, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/orders`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}



export async function shipOrderAction( orderId: string) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.shipOrder(orderId, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/orders`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function cancelOrderAction( orderId: string, reason: string) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await OrderService.cancelOrder(orderId,reason, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/orders`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}





