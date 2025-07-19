import axiosApi from "@/lib/axios";
import { Portfolio, Holding, DownloadLink } from "@/lib/types";
import { authService } from "./auth.service";
import { Tip } from "./tip.service";

export const portfolioService = {  
  // Fetch portfolio price history
  getPriceHistory: async (portfolioId: string, period: string = 'all'): Promise<any> => {
    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log(`🔍 Fetching price history for portfolio ${portfolioId}, period: ${period}`);
      
      const response = await axiosApi.get(`/api/portfolios/${portfolioId}/price-history?period=${period}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📈 Price history API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch price history:', error.response?.data || error.message);
      throw error;
    }
  },

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

  // Fetch all portfolios from public endpoint (includes downloadLinks and youTubeLinks)
  getAllPublic: async (): Promise<Portfolio[]> => {
    try {
      const response = await axiosApi.get<Portfolio[]>("/api/portfolios", {
        headers: {
          accept: "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch all public portfolios:", error);
      return [];
    }
  },

  // Get methodology links for a specific portfolio
  getMethodologyLinks: async (portfolioId: string): Promise<{ downloadLinks: any[], youTubeLinks: any[] }> => {
    try {
      const portfolios = await portfolioService.getAllPublic();
      const portfolio = portfolios.find(p => p._id === portfolioId);
      
      if (portfolio) {
        return {
          downloadLinks: portfolio.downloadLinks || [],
          youTubeLinks: portfolio.youTubeLinks || []
        };
      }
      
      return { downloadLinks: [], youTubeLinks: [] };
    } catch (error: any) {
      console.error("Failed to fetch methodology links:", error);
      return { downloadLinks: [], youTubeLinks: [] };
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

      console.log(`🔍 Fetching portfolio ${id} from /api/user/portfolios/${id}`);
      const response = await axiosApi.get(`/api/user/portfolios/${id}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("📦 Raw API response:", response);
      console.log("📊 Response data:", response.data);
      
      // Handle different response structures
      let portfolioData = response.data;
      
      // If the response has a 'data' property, use that
      if (response.data?.data) {
        portfolioData = response.data.data;
        console.log("📋 Using response.data.data:", portfolioData);
      }
      // If the response has a 'portfolio' property, use that  
      else if (response.data?.portfolio) {
        portfolioData = response.data.portfolio;
        console.log("📋 Using response.data.portfolio:", portfolioData);
      }
      
      // Validate that we have the required fields
      if (!portfolioData?.name) {
        console.warn("⚠️ Portfolio data missing name field, raw response:", response.data);
      }
      
      if (!portfolioData?.holdings || !Array.isArray(portfolioData.holdings)) {
        console.warn("⚠️ Portfolio data missing or invalid holdings array:", portfolioData?.holdings);
      } else {
        console.log("✅ Holdings found:", portfolioData.holdings.length, "items");
      }
      
      return portfolioData;
    } catch (error: any) {
      console.error(`❌ Failed to fetch portfolio ${id}:`, error);
      
      if (error.response) {
        console.error("📡 Error response status:", error.response.status);
        console.error("📡 Error response data:", error.response.data);
      }
      
      throw error;
    }
  },

  // Fetch tips for a specific portfolio
  getPortfolioTips: async (portfolioId: string): Promise<Tip[]> => {
    const response = await axiosApi.get<Tip[]>(
      `/api/tips/portfolios/${portfolioId}/tips`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    return response.data;
  },
};
