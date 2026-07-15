"use server"

import { DrugFormValues, UpdateDrugFormValues } from "@/types/schemas/drug.schema";
import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { DrugService } from "../service/business-services/drug-service";



export async function createDrugAction(payload: DrugFormValues) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugService.createDrug(payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function updateDrugAction(drugId: string, payload: UpdateDrugFormValues) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

      const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugService.updateDrug(drugId, payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function deleteDrugAction(drugId: string) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

      const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugService.deleteDrug(drugId, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function restoreDeletedDrugAction(drugId: string) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

      const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugService.restoreDrug(drugId, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function bulkCreateDrugAction(payload: DrugFormValues[]) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }
    
    const { ipAddress } = await getRequestMeta();
    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugService.bulkImportDrugs(payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}



