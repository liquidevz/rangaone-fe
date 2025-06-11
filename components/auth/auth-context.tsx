// components/auth/auth-context.tsx
"use client";

import { authService, UserProfile } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Initialize axios headers
        authService.initializeAuth();

        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const accessToken = authService.getAccessToken();
          
          // Check if token is expired
          if (accessToken && authService.isTokenExpired(accessToken)) {
            // Try to refresh token
            const refreshed = await authService.refreshTokens();
            if (!refreshed) {
              // Refresh failed, clear tokens
              authService.clearTokens();
              setIsAuthenticated(false);
              setUser(null);
              setIsLoading(false);
              return;
            }
          }

          // Fetch user profile
          try {
            const userProfile = await authService.getCurrentUser();
            setUser(userProfile);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // If profile fetch fails, user might be invalid
            authService.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Call login API
      const response = await authService.login({ username, password });
      
      // Store tokens
      authService.setTokens(response.accessToken, response.refreshToken, rememberMe);
      
      // Fetch user profile
      const userProfile = await authService.getCurrentUser();
      
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API and clear tokens
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userProfile = await authService.getCurrentUser();
        setUser(userProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, clear authentication
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};