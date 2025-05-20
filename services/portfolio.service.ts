import axiosApi from "@/lib/axios";

export interface Holding {
  symbol: string;
  weight: number;
  sector: string;
  status: string;
  price: number;
}

export interface DownloadLink {
  link: string;
  createdAt: string;
}

export interface Portfolio {
  _id: string;
  name: string;
  description: string;
  cashRemaining: number;
  subscriptionFee: number;
  minInvestment: number;
  durationMonths: number;
  expiryDate: string;
  PortfolioCategory: string;
  holdings: Holding[];
  downloadLinks: DownloadLink[];
}

export const portfolioService = {
  // Fetch all portfolios
  getAll: async (): Promise<Portfolio[]> => {
    const response = await axiosApi.get<Portfolio[]>("/api/portfolios", {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch portfolio by ID
  getById: async (id: string): Promise<Portfolio> => {
    const response = await axiosApi.get<Portfolio>(`/api/portfolios/${id}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },
};
