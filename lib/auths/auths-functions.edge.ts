// lib/auths/auths-functions.edge.ts
import { jwtVerify, decodeJwt, errors } from "jose";
import { JwtPayload } from "@/types/types/app.type";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function verifyAppTokenEdge(token: string): Promise<{payload: JwtPayload, isExpired: boolean} | null> {
    try {
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
        
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return { payload: payload as JwtPayload, isExpired: false };
    } catch (error: unknown) {
        if (error instanceof errors.JWTExpired) {
            try {
                const decoded = decodeJwt(token) as JwtPayload;
                return { payload: decoded, isExpired: true };
            } catch {
                return null;
            }
        }
        return null;
    }
}