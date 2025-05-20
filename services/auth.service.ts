import axiosApi, { post } from "@/lib/axios";

interface SignupPayload {
  username: string;
  email: string;
  password: string;
  mainUserId?: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface RefreshTokenPayload {
  refreshToken: string;
}

interface SignupResponse {
  message: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Authentication methods
  signup: async (payload: SignupPayload): Promise<SignupResponse> => {
    return await post<SignupResponse>("/auth/signup", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return await post<LoginResponse>("/auth/login", payload, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  },

  // Token refresh method
  refreshTokens: async (): Promise<RefreshTokenResponse | null> => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await post<RefreshTokenResponse>(
        "/auth/refresh",
        { refreshToken },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Store the new tokens using the same rememberMe preference
      const rememberMe = !!localStorage.getItem("refreshToken");
      authService.setTokens(
        response.accessToken,
        response.refreshToken,
        rememberMe
      );

      return response;
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      authService.clearTokens();
      return null;
    }
  },

  // Token management methods
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") {
      if (process.env.ACCESS_TOKEN) {
        return process.env.ACCESS_TOKEN;
      }
      return null;
    }

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!token) {
        console.log("No access token found");
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return null;
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") {
      if (process.env.REFRESH_TOKEN) {
        return process.env.REFRESH_TOKEN;
      }
      return null;
    }

    return (
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken")
    );
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") {
      return !!process.env.ACCESS_TOKEN;
    }
    return !!(
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  },

  setTokens: (
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean = false
  ): void => {
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
      }

      axiosApi.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    }
  },

  clearTokens: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      delete axiosApi.defaults.headers.common["Authorization"];
    }
  },

  isPublicRoute: (path: string): boolean => {
    const publicRoutes = ["/", "/login", "/sign-up"];
    return publicRoutes.includes(path);
  },

  shouldRedirectToLogin: (path: string): boolean => {
    return !authService.isPublicRoute(path) && !authService.isAuthenticated();
  },

  shouldRedirectToDashboard: (path: string): boolean => {
    const authRoutes = ["/login", "/sign-up"];
    return authRoutes.includes(path) && authService.isAuthenticated();
  },
};
