import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/dbConnection";
import { verifyPassword, setAppSessionCookie, setPasswordResetSessionCookie, clearPasswordResetSessionCookie, hashPassword, verifyAppTokenEdge, PASSWORD_CHANGE_COOKIE_NAME, } from "@/lib/auths/auths-functions";
import { loginSchema, resetPasswordSchema, ResetPasswordSchema } from "@/types/schemas/auth.schema";
import { AuditAction, AuditEntity, SessionReason } from "@/generated/prisma/enums";
import { AppResponse, EmailVerificationPayload, JwtPayload } from "@/types/types/app.type";
import { AppUser } from "@/types/types/auth.types";


export class AuthService {
  /**
   * Orchestrates the verification, multi-tenant evaluation, session logging, 
   * and cookie allocation workflow for inbound users.
   */
  static async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NextResponse> {
    try {
      // 1. Zod runtime payload parsing validation validation
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: validation.error.errors[0]?.message || "Invalid input parameters provided." 
          }, 
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();

      // 2. Locate active user with their linked facility data structural mappings
      const user = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          isActive: true,
        },
        include: {
          facility: true,
        },
      });

   

      // Unified error protection mechanism to eliminate username enumeration attacks
      if (!user) {
        return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
      }

      // 3. Verify cryptographically hashed credentials
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
      }

      // 4. Handle account state guards: Enforce multi-tenant structure context locks
      // If the user isn't a global SUPER_ADMIN, verify that their assigned facility is active
      if (user.role !== "SUPER_ADMIN") {
        if (!user.facilityId || !user.facility) {
          return NextResponse.json(
            { success: false, error: "User profile has no valid operational facility link configuration." },
            { status: 403 }
          );
        }

        if (!user.facility.isActive) {
          return NextResponse.json(
            { success: false, error: "Access denied: Your assigned facility has been deactivated." },
            { status: 403 }
          );
        }

        if (!user.facility.isVerified) {
          return NextResponse.json(
            { success: false, error: "Access pending: Facility validation audits are still incomplete." },
            { status: 403 }
          );
        }
      }

     // 5. Handle First-Time Login / Reset Guards
      if (user.needsPasswordChange) {
        const resetPayload: EmailVerificationPayload = {
          userId: user.id,
          email: user.email,
          facilityId: user.facilityId || undefined,
          purpose: "PASSWORD_FORCE_CHANGE"
        };

        const response = NextResponse.json(
          {
            success: false, // Keep false to indicate the sequence isn't fully completed
            message: "Credentials valid. Password update transition process mandatory.",
            needsPasswordChange: true,
            redirectTo: "/change-password",
            data: { email: user.email }
          },
          { status: 403 }
        );

        // Apply your dedicated password reset cookie!
        setPasswordResetSessionCookie(response, resetPayload);
        return response;
      }

      // 6. Generate Session and Platform Audit Logs atomically inside an isolated transaction
      const sessionAndLogs = await prisma.$transaction(async (tx) => {
        // Create live historical tracker line record block mapping
        const sessionLog = await tx.userSessionLog.create({
          data: {
            userId: user.id,
            facilityId: user.facilityId || "GLOBAL-SYSTEM", // System fallback string literal metric identifier
            reason: SessionReason.LOGIN,
            isActive: true,
            ipAddress,
            userAgent,
          },
        });

        // Update the primary User table matrix timestamp indicator flag status references
        await tx.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Append historical ledger record line markers to system transaction metrics tracking
        await tx.auditLog.create({
          data: {
            userId: user.id,
            facilityId: user.facilityId,
            action: AuditAction.LOGIN,
            entityType: AuditEntity.USER,
            entityId: user.id,
            ipAddress,
            userAgent,
            details: {
              message: `User session logged in successfully via web interface.`,
              customId: user.customId,
              roleName: user.role,
            },
          },
        });

        return sessionLog;
      });

      // 7. Assemble core structural values array payload structure context mapping parameters
      const tokenPayload: JwtPayload = {
        userId: user.id,
        customId: user.customId,
        facilityId: user.facilityId || undefined,
        facilityName: user.facility?.name || "Global Administration Portal",
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        sessionId: sessionAndLogs.id,
        needsPasswordChange: user.needsPasswordChange,
      };

      // Determine dynamic dashboard routing layout depending cleanly on identity credentials structures
      const landingRoute = user.role === "SUPER_ADMIN" ? "/admin/admin-dashboard" : "/dashboard";

      const response = NextResponse.json(
        {
          success: true,
          message: "Authentication successful. Access authorization cleared.",
          redirectTo: landingRoute,
          data: tokenPayload
        },
        { status: 200 }
      );

      // 8. Apply active cookie configuration payload mapping criteria mutations over parameters
      setAppSessionCookie(response, tokenPayload);
      return response;

    } catch (error) {
      console.error("🚨 Critical System Level Login Failure Process Logged:", error);
      return NextResponse.json(
        { success: false, error: "Internal System Execution Framework Server Error." },
        { status: 500 }
      );
    }
  }

  /**
   * Terminating operations service: Marks active database tracking lines 
   * as revoked, logs the corporate operational audit, and destroys session cookies.
   */
  static async logout(
    userId: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      if (!userId) {
        return {
          success: false, error: "User context identity parameter is required to terminate session.",status: 400 
        } as AppResponse;
      }

      // 1. Transactionally update logs and track session state metrics
      await prisma.$transaction(async (tx) => {
        // Fetch user instance parameters to attach context data structures to audit tracking logs
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, customId: true, facilityId: true, role: true },
        });

        // If a valid sessionId was passed from our JWT payload, cleanly update its life track state
        if (sessionId) {
          const activeSession = await tx.userSessionLog.findUnique({
            where: { id: sessionId },
          });

          if (activeSession && activeSession.isActive) {
            await tx.userSessionLog.update({
              where: { id: sessionId },
              data: {
                isActive: false,
                logoutAt: new Date(),
                reason: SessionReason.LOGOUT,
              },
            });
          }
        } else {
          // Fallback Strategy: Revoke any remaining trailing active logs matching this user context
          await tx.userSessionLog.updateMany({
            where: {
              userId: userId,
              isActive: true,
            },
            data: {
              isActive: false,
              logoutAt: new Date(),
              reason: SessionReason.LOGOUT,
            },
          });
        }

        // 2. Commit historical trace record metadata inside parent operational auditing matrix
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: user?.facilityId || null,
            action: AuditAction.LOGOUT,
            entityType: AuditEntity.USER,
            entityId: userId,
            ipAddress,
            userAgent,
            details: {
              message: "User session revoked and logged out successfully.",
              customId: user?.customId || "UNKNOWN",
              roleName: user?.role || "UNKNOWN",
              explicitSessionIdTerminated: !!sessionId,
            },
          },
        });
      });

      // 3. Purge state tracking parameters from browser cookie store natively
      
      // Return unified execution response payload
      return{
          success: true,
          message: "Session terminated successfully. Storage arrays clean.",
          redirectTo: "/auth/login",
          status: 200 
        } as AppResponse;
      
    } catch (error) {
      console.error("🚨 Critical System Level Logout Failure Process Logged:", error);
      return{ 
        success: false, error: "Internal System Execution Framework Server Logout Error." ,
        status: 500 } as AppResponse;
    }
  }

/**
   * Validates the temporary force-change session, updates the user's password,
   * clears the reset cookie, and logs the user in with a full session.
   */
  static async resetPassword(
    data: ResetPasswordSchema,
    request: NextRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NextResponse> {
    try {
      // 1. Zod runtime validation
      const validation = resetPasswordSchema.safeParse(data);
      console.log("RECEIVED DATA: ",data)
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: validation.error.errors[0]?.message || "Invalid input parameters provided." 
          }, 
          { status: 400 }
        );
      }

      // 2. Extract and verify the temporary password change cookie
      const tempToken = request.cookies.get(PASSWORD_CHANGE_COOKIE_NAME)?.value;
      if (!tempToken) {
        return NextResponse.json(
          { success: false, error: "Reset session expired or invalid. Please log in again." },
          { status: 401 }
        );
      }

      // Reusing your verified Edge verification helper or standard verification helper
      const verification = await verifyAppTokenEdge(tempToken);
      console.log("TOKEN V: ", verification)
      if (!verification || verification.isExpired || !verification.payload) {
        return NextResponse.json(
          { success: false, error: "Reset token signature has expired or is invalid." },
          { status: 401 }
        );
      }

    const { userId, email } = verification.payload as EmailVerificationPayload;

      // 3. Locate the user
      const user = await prisma.user.findFirst({
        where: { id: userId, email, isActive: true },
        include: { facility: true }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User record associated with this reset token was not found." },
          { status: 404 }
        );
      }

      console.log("USER: ", user)

      // 4. Hash the new password
      const hashedPassword = await hashPassword(data.newPassword);

      // 5. Execute DB updates and logging inside an atomic transaction
      const sessionAndLogs = await prisma.$transaction(async (tx) => {
        // Update user password and clear the reset flag
        await tx.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            needsPasswordChange: false,
            lastLoginAt: new Date(),
          },
        });

        // Create the official session log
        const sessionLog = await tx.userSessionLog.create({
          data: {
            userId: user.id,
            facilityId: user.facilityId || "GLOBAL-SYSTEM",
            reason: SessionReason.LOGIN,
            isActive: true,
            ipAddress,
            userAgent,
          },
        });

        // Record security audit event
        await tx.auditLog.create({
          data: {
            userId: user.id,
            facilityId: user.facilityId,
            action: AuditAction.PASSWORD_RESET,
            entityType: AuditEntity.USER,
            entityId: user.id,
            ipAddress,
            userAgent,
            details: {
              message: "User successfully cleared force-password reset constraint.",
              customId: user.customId,
              roleName: user.role,
            },
          },
        });

        return sessionLog;
      });

      // 6. Assemble your full login payload
      const tokenPayload: JwtPayload = {
        userId: user.id,
        customId: user.customId,
        facilityId: user.facilityId || undefined,
        facilityName: user.facility?.name || "Global Administration Portal",
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        sessionId: sessionAndLogs.id,
        needsPasswordChange: false, // Explicitly cleared!
      };

      const landingRoute = user.role === "SUPER_ADMIN" ? "/admin/admin-dashboard" : "/dashboard";

      const response = NextResponse.json(
        {
          success: true,
          message: "Your password was changed successfully. Redirecting...",
          redirectTo: landingRoute,
          data: tokenPayload
        },
        { status: 200 }
      );

      // 7. Cookie Management: Clear the temporary token & set the real session token!
      clearPasswordResetSessionCookie(response);
      setAppSessionCookie(response, tokenPayload);

      return response;

    } catch (error) {
      console.error("🚨 Critical System Level Password Reset Failure:", error);
      return NextResponse.json(
        { success: false, error: "Internal System Execution Framework Server Error." },
        { status: 500 }
      );
    }
  }


/**
   * Session verification service: Fetches core authenticated user profile data 
   * and structural facility metadata based on active token identity.
   */
  static async fetchCurrentUser(userId: string): Promise<AppResponse> {
    try {
      if (!userId) {
        return { 
          success: false, 
          error: "Authentication session expired or user context missing.", 
          status: 401 
        };
      }

      // 1. Fetch targeted profile data structure mappings using field selectors
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          customId: true,
          email: true,
          fullName: true,
          role: true,
          phone: true,
          isActive: true,
          needsPasswordChange: true,
          createdAt: true,
          lastLoginAt: true,
          facilityId: true,
          facility: {
            select: {
              id: true,
              customId: true,
              name: true,
              type: true,
              location: true,
              isVerified: true,
              isActive: true,
            },
          },
        },
      });

      // 2. Validate corporate guard conditions over database results
      if (!user) {
        return {
          success: false, 
          error: "User record context location could not be verified.",
          status: 404 
        };
      }

      if (!user.isActive) {
        return { 
          success: false, 
          error: "Access denied: This user account status is currently disabled.",
          status: 403 
        };
      }

      // 3. Apply Multi-tenant validation guards strictly for non-global actors
      if (user.role !== "SUPER_ADMIN" && user.facility) {
        if (!user.facility.isActive) {
          return { 
            success: false, 
            error: "Access denied: Assigned organizational facility is inactive.",
            status: 403 
          };
        }
        if (!user.facility.isVerified) {
          return { 
            success: false, 
            error: "Access pending: Linked facility verification checks are incomplete.",
            status: 403 
          };
        }
      }

      // 4. Assemble the payload OUTSIDE the guard statement so all roles can access it
      const userData: AppUser = {
          id: user.id,
          customId: user.customId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          isActive: user.isActive,
          needsPasswordChange: user.needsPasswordChange,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          facility: user.facility
          ? {
              id: user.facility.id,
              customId: user.facility.customId,
              name: user.facility.name,
              type: user.facility.type,
              location: user.facility.location,
            }
          : null, 
      };

      // 5. Return unified success wrapper conforming strictly to AppResponse
      return {
        success: true,
        status: 200,
        message: "Authenticated profile criteria retrieved successfully.",
        data: userData,
      };

    } catch (error) {
      console.error("🚨 Critical System Level Me-Fetch Failure Process Logged:", error);
      return {
        success: false,
        status: 500,
        error: "Internal System Error parsing credential session mapping arrays.",
      };
    }
  }

}