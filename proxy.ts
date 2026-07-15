// proxy.ts (Place in your Root or /src directory)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAppTokenEdge } from "@/lib/auths/auths-functions";
import { All_ROUTE_LIST } from "./lib/constants/nav-Def";

const APP_COOKIE_NAME = "med_inv_hub_token_";
const PASSWORD_CHANGE_COOKIE_NAME = "med_hub_password_reset_";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Instantly skip asset pipelines, system engines, and image maps
  if (pathname.startsWith("/_next") || pathname.includes(".") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // 2. Extract authorization cookies
  const sessionToken = request.cookies.get(APP_COOKIE_NAME)?.value;
  const passwordResetToken = request.cookies.get(PASSWORD_CHANGE_COOKIE_NAME)?.value;

  // 3. Define absolute public endpoints
  const publicPaths = ["/login", "/forgot-password", "/"];
  const isPublicRoute = publicPaths.includes(pathname);

  // 4. Session Validation Layer
  let userPayload = null;
  if (sessionToken) {
    const authResult = await verifyAppTokenEdge(sessionToken);
    if (authResult && !authResult.isExpired) {
      userPayload = authResult.payload;
    }
  }

  let resetPayload = null;
  if (passwordResetToken) {
    const authResult = await verifyAppTokenEdge(passwordResetToken); 
    if (authResult && !authResult.isExpired) {
      resetPayload = authResult.payload;
    }
  }

  // 5. Explicit Protection Rule for `/change-password`
  if (pathname === "/change-password") {
    const isTempAuthorized = !!resetPayload; 
    const isSessionAuthorized = !!(userPayload && userPayload.needsPasswordChange);

    if (!isTempAuthorized && !isSessionAuthorized) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    return NextResponse.next();
  }

  // 6. Handle active session landing rules on public endpoints
  if (isPublicRoute) {
    if (userPayload) {
      if (userPayload.needsPasswordChange) {
        return NextResponse.redirect(new URL("/change-password", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 7. Protect all internal paths against unauthenticated attempts
  if (!userPayload) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Session expired or unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 8. Intercept internal dashboard routes and evaluate password state requirements
  if (userPayload.needsPasswordChange && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // 9. Evaluate application path boundaries against flat All_ROUTE_LIST
  const subSegments = pathname.split("/").filter(Boolean);
  const routeBaseSegment = subSegments[0]; // e.g., "admin-dashboard", "drug-management"
  const activeSubKey = subSegments[1];      // e.g., "add-drug", "adjustment-history"

  // Check if the route is defined in our registered routes system
  const isRegisteredRoute = All_ROUTE_LIST.includes(routeBaseSegment) || 
                            (activeSubKey && All_ROUTE_LIST.includes(activeSubKey));

  if (isRegisteredRoute) {
    const userRole = userPayload.role;

    // RBAC: Admin Dashboard boundary for SUPER_ADMIN only
    if (routeBaseSegment === "admin" || routeBaseSegment === "admin-dashboard") {
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // RBAC: Standard internal infrastructure boundaries (Audit Logs, Facilities, Users)
    const restrictedKeys = ["audit-logs", "facilities", "users"];
    if (restrictedKeys.includes(routeBaseSegment) || (activeSubKey && restrictedKeys.includes(activeSubKey))) {
      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    
    // RBAC: Non-admin write/mutation operations fallback protection
    const mutationKeys = ["add-drug", "adjustment-history", "create-order"];
    if (activeSubKey && mutationKeys.includes(activeSubKey)) {
      if (userRole === "VIEWER" || userRole === "STAFF") {
        return NextResponse.redirect(new URL(`/${routeBaseSegment}`, request.url));
      }
    }
  }

  // 10. Append verified attributes to request headers for Server Component access
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userPayload.userId);
  requestHeaders.set("x-user-role", userPayload.role);
  if (userPayload.facilityId) {
    requestHeaders.set("x-facility-id", userPayload.facilityId);
  }

  // Create the response object
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

 // CRITICAL FIX: Prevent browser from caching authenticated dashboard views.
  // This forces the back-button to re-evaluate this middleware on every click.
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  return response;

}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};