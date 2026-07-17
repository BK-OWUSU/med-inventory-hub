"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { AddInventoryInput, UpdateStockInput } from "@/types/schemas/inventory.schema";
import { InventoryService } from "../service/business-services/inventory.service";
import { ExecuteAdjustmentInput } from "@/types/types/stock-movement-adjusment.type";



export async function createInventoryAction(payload: AddInventoryInput) {
    console.log(payload)
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.createInventory(payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-category`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function updateInventoryStockAction(payload: UpdateStockInput) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.updateStock(payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-category`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function executeStockAdjustmentStockAction(payload: ExecuteAdjustmentInput) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.executeStockAdjustment(payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
        revalidatePath(`/drugs/drug-category`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


