"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { AddDrugInventoryBatchInput, StockAdjustmentInput, UpdateDrugInventoryBatchInput } from "@/types/schemas/inventory.schema";
import { InventoryService } from "../service/business-services/inventory.service";
import { ExecuteAdjustmentInput } from "@/types/types/stock-movement-adjusment.type";



export async function createDrugBatchAction(payload: AddDrugInventoryBatchInput) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.createDrugBatch(payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
         revalidatePath(`/inventory/inventory-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function updateDrugInventoryBatchAction(inventoryId: string,payload: UpdateDrugInventoryBatchInput,) {
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.updateDrugInventoryBatch(inventoryId,payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/inventory/inventory-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function createInventoryAdjustment(payload: StockAdjustmentInput) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.createAdjustment(payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
        revalidatePath(`/inventory/inventory-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function deactivateInventory(inventoryId: string) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await InventoryService.deactivateInventory(inventoryId, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
        revalidatePath(`/inventory/inventory-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


  export async function getInventoryByIdAction(inventoryId: string) {
  try {
    // 1. Securely fetch the active user session on the server
    const session = await getAppSession();
    if (!session || typeof session === "string") {
      return { success: false, error: "Unauthorized access.", status: 401 } as AppResponse;
    }
    const { facilityId } = session;

    const response = await InventoryService.getInventoryBatchDetails(inventoryId, facilityId|| "");
    return response;

  } catch (error) {
    console.error("INVENTORY_ACTION_GET_BY_ID_ERROR:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred while fetching the batch.", 
      status: 500 
    } as AppResponse;
  }
}



  export async function getStockMovementByIdAction(stockMovementId: string) {
  try {
    // 1. Securely fetch the active user session on the server
    const session = await getAppSession();
    if (!session || typeof session === "string") {
      return { success: false, error: "Unauthorized access.", status: 401 } as AppResponse;
    }
    const { facilityId } = session;

    const response = await InventoryService.getStockMovementDetails(stockMovementId, facilityId|| "");
    return response;

  } catch (error) {
    console.error("MOVEMENT_ACTION_GET_BY_ID_ERROR:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred while fetching the stock movement.", 
      status: 500 
    } as AppResponse;
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

    // const response = await InventoryService.executeStockAdjustment(payload, userId, facilityId || "", ipAddress, userAgent)

    // if (response.success) {       
    //      revalidatePath(`/inventory/inventory-list`, 'layout');
    //     return {message: response.message, success:response.success, data: response.data};
    // }else {
    //     return {error: response.error, success: response.success};
    // }
}


