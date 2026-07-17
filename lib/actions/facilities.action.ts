"use server"

import { AppResponse } from "@/types/types/app.type";
import { revalidatePath } from "next/cache";
import { getAppSession, getRequestMeta } from "../auths/auths-functions";
import { FacilityService } from "../service/business-services/facililty.service";
import { CreateFacilityInput, UpdateFacilityInput } from "@/types/schemas/facility.schema";



export async function createFacilityAction(payload: CreateFacilityInput) {
    console.log(payload)
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

    const response = await FacilityService.createFacility(payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
        revalidatePath(`/facility`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}

export async function updateFacilityAction(Id:string, payload: UpdateFacilityInput) {
    console.log(updateFacilityAction)
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

  const response = await FacilityService.updateFacility(Id,payload, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/facility`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}


export async function verifyFacility(Id:string) {
    console.log(updateFacilityAction)
    
    const session = await getAppSession();
    // 1. Check Session
    if(!session || typeof session === "string") {
        return { success: false, error: "Unauthorized session"} as AppResponse;
    }

    const { ipAddress, userAgent } = await getRequestMeta();

    // We get the current user's details from the session
    const { userId, facilityId } = session;

  const response = await FacilityService.verifyFacility(Id, userId, facilityId || "", ipAddress, userAgent)

    if (response.success) {       
         revalidatePath(`/facility`, 'layout');
        return {message: response.message, success:response.success, data: response.data};
    }else {
        return {error: response.error, success: response.success};
    }
}
