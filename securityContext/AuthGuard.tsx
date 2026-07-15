"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthGuardLoading } from "@/components/custom/loaders/AuthGuardLoader";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();

  // 1. Grab auth state from your Zustand store
  const { user, loading, fetchUser } = useAuthStore();

  // Check bypass routes matching your middleware's public paths
  const isResetPasswordPage = pathname.endsWith("/forgot-password");
  const isChangePasswordPage = pathname.endsWith("/change-password");
  const isPublicPage = isResetPasswordPage || isChangePasswordPage;

  // 2. HYDRATION: Fetch user profile if missing and not on a bypass route
  useEffect(() => {
    if (!user && !loading && !isPublicPage) {
      fetchUser();
    }
  }, [user, loading, fetchUser, isPublicPage]);

  // 3. Bypass loading states for public forms so users can submit them
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 4. LOADING/SYNCING STATE: Blocks page rendering until user state is loaded
  if (loading || !user) {
    return (
      <AuthGuardLoading/>
    );
  }

  // 5. Render safe contents
  return <>{children}</>;
}