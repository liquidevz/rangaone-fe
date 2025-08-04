"use client";

import { useAuth } from "./auth-context";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profileComplete, missingFields, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();

  // Routes that don't require profile completion
  const exemptRoutes = ["/", "/login", "/signup", "/contact-us", "/premium-subscription", "/basic-subscription", "/thanks"];
  const isExemptRoute = exemptRoutes.includes(pathname) || pathname.startsWith("/auth/");

  useEffect(() => {
    if (isAuthenticated && !profileComplete && !isExemptRoute && !isLoading) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isAuthenticated, profileComplete, isExemptRoute, isLoading]);

  // If user is authenticated but profile is incomplete and not on exempt route, show modal
  if (isAuthenticated && !profileComplete && !isExemptRoute && !isLoading) {
    return (
      <>
        {children}
        <ProfileCompletionModal
          open={showModal}
          onOpenChange={() => {}} // Prevent closing
          onProfileComplete={() => setShowModal(false)}
          forceOpen={true}
        />
      </>
    );
  }

  return <>{children}</>;
}