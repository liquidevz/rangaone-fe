import axiosApi from "@/lib/axios";
import { Portfolio, Holding, DownloadLink } from "@/lib/types";

export const portfolioService = {
  // Fetch all portfolios
  getAll: async (): Promise<Portfolio[]> => {
    try {
      const response = await axiosApi.get<Portfolio[]>("/api/portfolios", {
        headers: {
          accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
      throw error;
    }
  },

  // Fetch portfolio by ID
  getById: async (id: string): Promise<Portfolio> => {
    try {
      if (!id) {
        throw new Error("Portfolio ID is required");
      }
      
      const response = await axiosApi.get<Portfolio>(`/api/portfolios/${id}`, {
        headers: {
          accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch portfolio ${id}:`, error);
      throw error;
    }
  },
};
