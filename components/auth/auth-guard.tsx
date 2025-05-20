"use client";

import { authService } from "@/services/auth.service";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        // Skip auth check for public routes
        if (authService.isPublicRoute(pathname)) {
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated
        const isAuthenticated = authService.isAuthenticated();

        // Handle token refresh if needed
        if (isAuthenticated) {
          try {
            // Verify if token is still valid (you might need to decode JWT here)
            // If token is expired or about to expire, refresh it
            const accessToken = authService.getAccessToken();
            if (accessToken && isTokenExpired(accessToken)) {
              await authService.refreshTokens();
            }
          } catch (error) {
            console.error("Token refresh failed:", error);
            authService.clearTokens();
            sessionStorage.setItem("redirectPath", pathname);
            router.replace("/login");
            return;
          }
        }

        // Handle route redirections
        if (authService.shouldRedirectToDashboard(pathname)) {
          router.replace("/dashboard");
          return;
        }

        if (authService.shouldRedirectToLogin(pathname)) {
          sessionStorage.setItem("redirectPath", pathname);
          router.replace("/login");
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Simple token expiration check (you might want to use a proper JWT decoder)
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authService.isPublicRoute(pathname) || authService.isAuthenticated()) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
