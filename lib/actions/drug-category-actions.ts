"use server"

import { AppResponse } from "@/types/types/app.type";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { revalidatePath } from "next/cache";
import { DrugCategoryService } from "../service/business-services/drug-category-service";
import { DrugCategoryFormValues, UpdateDrugCategoryFormValues } from "@/types/schemas/drug.schema";


export async function createDrugCategoryAction(payload: DrugCategoryFormValues) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugCategoryService.createCategory(payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function updateDrugCategoryAction(categoryId: string, payload: UpdateDrugCategoryFormValues) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugCategoryService.updateCategory(categoryId, payload, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function deleteDrugCategoryAction(categoryId: string) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugCategoryService.deleteCategory(categoryId, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function restoreDrugCategoryAction(categoryId: string) {
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await DrugCategoryService.deleteCategory(categoryId, userId, facilityId || "", ipAddress)

    if (response.success) {       
        revalidatePath(`/drugs/drug-list`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

