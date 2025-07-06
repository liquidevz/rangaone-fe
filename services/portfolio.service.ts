import axiosApi from "@/lib/axios";
import { Portfolio, Holding, DownloadLink } from "@/lib/types";
import { authService } from "./auth.service";

export const portfolioService = {
  // Debug portfolio API access
  debugPortfolioAccess: async (): Promise<void> => {
    const token = authService.getAccessToken();
    console.log("=== PORTFOLIO API DEBUG ===");
    console.log("Auth token exists:", !!token);
    console.log("Auth token (first 10 chars):", token ? token.substring(0, 10) + "..." : "None");
    
    if (!token) {
      console.log("❌ No auth token - user not logged in");
      return;
    }

    // Test different portfolio endpoints
    const endpoints = [
      "/api/portfolios",
      "/api/portfolios/all", 
      "/api/portfolios/public"
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await axiosApi.get(endpoint, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(`✅ ${endpoint} - Success:`, response.data?.length || 0, "portfolios");
      } catch (error: any) {
        console.log(`❌ ${endpoint} - Error:`, error.response?.status, error.response?.data || error.message);
      }
    }
    console.log("=== END PORTFOLIO DEBUG ===");
  },

  // Fetch all portfolios
  getAll: async (): Promise<Portfolio[]> => {
    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        console.log("No auth token available");
        return [];
      }

      const response = await axiosApi.get<Portfolio[]>("/api/user/portfolios", {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch portfolios:", error);
      
      if (error.response?.status === 401) {
        console.log("Unauthorized - user needs to log in");
      } else if (error.response?.status === 403) {
        console.log("Forbidden - user needs appropriate subscription");
      }
      
      return [];
    }
  },

  // Fetch public portfolio information (for browsing before purchase)
  getPublic: async (): Promise<Portfolio[]> => {
    try {
      // Try public endpoint first (if it exists)
      const response = await axiosApi.get<Portfolio[]>("/api/portfolios/public", {
        headers: {
          accept: "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch public portfolios:", error);
      
      // If public endpoint doesn't exist, try the regular endpoint without auth
      try {
        const response = await axiosApi.get<Portfolio[]>("/api/portfolios", {
          headers: {
            accept: "application/json",
          },
        });
        return response.data;
      } catch (fallbackError: any) {
        console.error("Failed to fetch portfolios without auth:", fallbackError);
        // Return empty array to prevent crashes
        return [];
      }
    }
  },

  // Fetch portfolio by ID
  getById: async (id: string): Promise<Portfolio> => {
    try {
      if (!id) {
        throw new Error("Portfolio ID is required");
      }
      
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axiosApi.get<Portfolio>(`/api/user/portfolios/${id}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch portfolio ${id}:`, error);
      throw error;
    }
  },
};
