import { create } from "zustand"
import apiClient from "@/lib/api-client"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { AppUser } from "@/types/types/auth.types"
import { AppResponse, JwtPayload } from "@/types/types/app.type"
import { LoginFormValues, ResetPasswordSchema } from "@/types/schemas/auth.schema"

type AuthStore = {
  user: AppUser | null;
  loading: boolean;
  login: (data: LoginFormValues) => Promise<AppResponse>;
  logout: () => Promise<void>;
  logoutExpiration: () => Promise<void>;
  fetchUser: () => Promise<void>;
  changePassword: (data: ResetPasswordSchema) => Promise<AppResponse>; 
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    try {
      set({ loading: true })
      const response = await apiClient.get("/auth/me")
      const userData = response.data?.data as AppUser 
      set({
        user: userData,
        loading: false
      })
    } catch (error) {
      console.error("Error fetching operational user context: ", error)
      set({ user: null, loading: false })
    }
  },

login: async (data) => {
    try {
      set({ loading: true });
      
      // 1. Send the login request
      const response = await apiClient.post("/auth/login", data);
      
      // 2. If it succeeds cleanly (Status 200), retrieve profile context
      await get().fetchUser();
      
      const responseData = response.data as AppResponse;
      const userData = responseData.data as JwtPayload;
      
      return {
        success: responseData.success ?? true,
        message: responseData.message || "Login successful.",
        redirectTo: responseData.redirectTo, // Standard routing path
        data: userData || response.data
      } as AppResponse;

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data;
        console.log("Captured backend error data in store:", responseData);

        // 3. Handle the 403 password change redirect directive gracefully
        if (error.response?.status === 403 && responseData?.needsPasswordChange) {
          return {
            success: true, // Mark success true so page.tsx doesn't trigger setServerError
            message: responseData.message || "Password change required.",
            redirectTo: responseData.redirectTo || "/auth/change-password",
            data: responseData.data || responseData,
          } as AppResponse;
        }

        // Standard validation or credential failures
        return {
          success: false,
          message: responseData?.message || error.message || "Failed to authenticate.",
          error: responseData?.error || "UNAUTHORIZED"
        } as AppResponse;
      }

      return {
        success: false,
        message: "A network operational failure occurred. Please retry.",
        error: "NETWORK_ERROR"
      } as AppResponse;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true })
      const response = await apiClient.post("/auth/logout")
      set({ user: null })
      if (response.data?.success ?? true) {
        toast.success("Logged out successfully!")
      }
    } catch (error) {
      console.error("Error encountered during system logout: ", error)
      // Enforce local client clean fallback regardless of server-side state
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },

  logoutExpiration: async () => {
    try {
      set({ loading: true })
      const response = await apiClient.post("/auth/logout-expiration")
      
      set({ user: null })
      
      if (response.data?.success ?? true) {
        toast.error("Session expired. Please log in again.")
      }
    } catch (error) {
      console.error("Error encountered during session expiration sequence: ", error)
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },

  changePassword: async (data) => {
    try {
      set({ loading: true })
      const response = await apiClient.post("/auth/change-password", data)
      
      return {
        success: response.data?.success ?? true,
        message: response.data?.message || "Password updated successfully.",
        data: response.data?.data
      } as AppResponse
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data
        console.error("Password reset routine error: ", error)
        return {
          success: false,
          message: responseData?.message || error.message || "Failed to alter credential state.",
          error: responseData?.error || "BAD_REQUEST"
        } as AppResponse
      }
      return {
        success: false,
        message: "A network operational failure occurred. Please retry.",
        error: "NETWORK_ERROR"
      } as AppResponse
    } finally {
      set({ loading: false })
    }
  }
}))
