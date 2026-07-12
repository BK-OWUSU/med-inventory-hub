import { checkDatabaseConnection } from "@/lib/database/dbConnection";
import { NextResponse } from "next/server";

export async function GET() {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
        return NextResponse.json({
            success: false,
            status: "error",
            message: "Database connection failed",
        },{status: 503})
    }
    return NextResponse.json({
        success: true,
        status: "ok",
        message: "API is healthy and database connection is successful",
    });
}