import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server";
// import jwtVerify2 from "jose"
import {jwtVerify, decodeJwt, errors, SignJWT} from "jose"
import { cookies, headers } from "next/headers";
import { EmailVerificationPayload, JwtPayload } from "@/types/types/app.type";
const APP_COOKIE_NAME = "med_inv_hub_token_";
const VERIFY_COOKIE_NAME = "med_hub_verify_token_";
const PASSWORD_CHANGE_COOKIE_NAME = "med_hub_password_reset_";


// For hashing passwords, 
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

//For password verification,
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password,hashedPassword)
}

// For JWT token generation the POS,
export function generateAppToken (payload: JwtPayload): string  {
    const JWT_SECRET = process.env.JWT_SECRET!
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRETE is not defined");
    }
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "3d"}) //Expires in 3 days
}


//FOR EMAIL VERIFICATION TOKEN
export function generateEmailVerificationToken(payload: EmailVerificationPayload): string {
    const JWT_SECRET = process.env.JWT_SECRET!
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRETE is not defined");
    }
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "10m"}) //Expires in 10 minutes
}


// This is only used in API routes, NOT in middleware
export function verifyAppToken(token: string): JwtPayload | null {
    try {
        const JWT_SECRET = process.env.JWT_SECRET!
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRETE is not defined");
        }
        const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decode; // Return the actual payload object
    } catch (error) {
        console.log("Error verifying token: ", error)
        return null;
    }
}

//for middleware token verification, jose is needed 
export async function verifyAppTokenEdge(token: string): Promise<{payload: JwtPayload, isExpired: boolean} | null> {
    try {
        const JWT_SECRET = process.env.JWT_SECRET!
         if (!JWT_SECRET) {
            throw new Error("JWT_SECRETE is not defined");
        }
        const secrete = new TextEncoder().encode(JWT_SECRET);
        const {payload} = await jwtVerify(token, secrete)
        return {payload: payload as JwtPayload, isExpired: false };
    } catch (error: unknown) {
        console.log("Error verifying token: ", error)
        if (error instanceof errors.JWTExpired) {
            try {
                const decoded = decodeJwt(token) as JwtPayload;
                return { payload: decoded, isExpired: true };
            } catch (decodeError) {
                console.log("Error decoding expired token: ", decodeError);
                return null;
            }
        }
        return null;
    }
}


// Utility function to get session in API routes
export async function getAppSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAppToken(token) as JwtPayload;
}


export function verifyEmailVerificationToken(token: string): EmailVerificationPayload | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET!;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string, purpose?: string};
  } catch (error) {
    console.log("Verify token error:", error);
    return null;
  }
}




//Attaches the signed  TOKENS into HttpOnly cookies on a response object.
// MAIN APP SESSION UPDATER
export async function updateSessionPayload(updates: Partial<JwtPayload>): Promise<boolean> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET!;
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(APP_COOKIE_NAME);
    if (!existingCookie || !existingCookie.value) return false; 
    
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

    // 1. Decode current valid token payload data context
    const { payload } = await jwtVerify(existingCookie.value, SECRET_KEY) as { payload: JwtPayload };

    // 2. Validate that update fields are provided
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("No update parameters were provided");
    }
    
    // 3. Merge old payload with any dynamic fields provided
    const updatedPayload: JwtPayload = {
      ...payload,
      ...updates
    };
  
    // 4. Re-sign a brand new token containing the updated parameters
    const newToken = await new SignJWT(updatedPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m") // Match your 30 minutes rule parameters window
      .sign(SECRET_KEY);

    // 5. Overwrite cookie directly from within the NextJS server action boundary runtime context
    cookieStore.set(APP_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60, // 1 day (86,400 seconds)
      path: "/",
    });

    return true;
  } catch (error) {
    console.error("FAILED_TO_UPDATE_SESSION_COOKIE:", error);
    return false;
  }
}


//SET MAIN POS APP TOKEN FOR LOGIN
export function setAppSessionCookie(response: NextResponse, payload: JwtPayload): void {
  const token = generateAppToken(payload);
  response.cookies.set(APP_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60, 
    path: "/", // Ensures access across all sibling nested api/page layers
  });
}

//SET EMAIL VERIFICATION TOKEN 
export function setEmailVerificationSessionCookie(response: NextResponse, payload: EmailVerificationPayload): void {
  const token = generateEmailVerificationToken(payload);
  response.cookies.set(VERIFY_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60, // 10 minutes
    path: "/", // Ensures access across all sibling nested api/page layers
  });
}


//EMAIL PASSWORD RESET TOKEN 
export function setPasswordResetSessionCookie(response: NextResponse, payload: EmailVerificationPayload): void {
  const token = generateEmailVerificationToken(payload);
  response.cookies.set(PASSWORD_CHANGE_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60, // 10 minutes
    path: "/", // Ensures access across all sibling nested api/page layers
  });
}

//CLEARING TOKENS
 //Evicts the session token completely from the client browser cache drawer.

 //MAIN POS APP
export function clearAppAppSessionCookie(response: NextResponse): void {
  response.cookies.set(APP_COOKIE_NAME, "",{
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, 
    path: "/", 
  });
}


//EMAIL VERIFICATION TOKEN CLEARING
export function clearEmailVerificationSessionCookie(response: NextResponse): void {
  response.cookies.set(VERIFY_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0), 
    maxAge: 0,
    path: "/", 
  });
}

//PASSWORD RESET TOKEN CLEARING 
export function clearPasswordResetSessionCookie(response: NextResponse): void {
  response.cookies.set(PASSWORD_CHANGE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0), 
    path: "/",
    maxAge: 0 
  });
}

export interface RequestMeta {
  ipAddress: string;
  userAgent: string;
}

export async function getRequestMeta(): Promise<RequestMeta> {
  const headersList = await headers();

  // 1. Fallback chain for different hosting providers (Vercel, Cloudflare, etc.)
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||  // Standard proxy chain
    headersList.get("x-real-ip") ||                               // Nginx / AWS proxies
    headersList.get("cf-connecting-ip") ||                        // Cloudflare
    "127.0.0.1";                                                  // Local fallback

  // 2. Fetch the User-Agent header
  const userAgent = headersList.get("user-agent") || "Unknown User Agent";

  return {
    ipAddress: ip,
    userAgent,
  };
}


export { APP_COOKIE_NAME, VERIFY_COOKIE_NAME,PASSWORD_CHANGE_COOKIE_NAME};