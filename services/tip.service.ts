import axiosApi from "@/lib/axios";

export interface TipDownloadLink {
  link: string;
  createdAt: string;
}

export interface Tip {
  _id: string;
  portfolio: string;
  title: string;
  stockId: string;
  category?: 'basic' | 'premium';
  content: { key: string; value: string; }[];
  description: string;
  status: string;
  action?: string;
  buyRange: string;
  targetPrice: string;
  targetPercentage?: number;
  addMoreAt: string;
  tipUrl: string;
  exitPrice?: string;
  exitStatus?: string;
  exitStatusPercentage?: number;
  horizon: string;
  downloadLinks: TipDownloadLink[];
  createdAt: string;
  updatedAt: string;
}

export const tipsService = {
  // Fetch all tips
  getAll: async (): Promise<Tip[]> => {
    const response = await axiosApi.get<Tip[]>("/api/tips", {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch tip by ID
  getById: async (id: string): Promise<Tip> => {
    const response = await axiosApi.get<Tip>(`/api/tips/${id}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch tips for a specific portfolio
  getByPortfolioId: async (portfolioId: string): Promise<Tip[]> => {
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
