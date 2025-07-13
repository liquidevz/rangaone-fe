import axiosApi from "@/lib/axios";

export interface TipDownloadLink {
  link: string;
  createdAt: string;
}

export interface Tip {
  _id: string;
  portfolio: string | {
    name: string;
    description: string;
    _id: string;
    [key: string]: any;
  };
  title: string;
  stockId: string;
  category?: 'basic' | 'premium';
  content: string | { key: string; value: string; }[];
  description: string;
  status: string;
  action?: string;
  buyRange: string;
  targetPrice: string;
  targetPercentage?: string; // API returns string like "20%"
  addMoreAt: string;
  tipUrl: string;
  exitPrice?: string;
  exitStatus?: string;
  exitStatusPercentage?: string; // API returns string like "25%"
  horizon: string;
  downloadLinks: TipDownloadLink[];
  createdAt: string;
  updatedAt: string;
}

export const tipsService = {
  // Fetch all tips
  getAll: async (): Promise<Tip[]> => {
    const response = await axiosApi.get<Tip[]>("/api/user/tips", {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch tip by ID
  getById: async (id: string): Promise<Tip> => {
    const response = await axiosApi.get<Tip>(`/api/user/tips/${id}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch tips by portfolio ID
  getByPortfolioId: async (portfolioId: string): Promise<Tip[]> => {
    const response = await axiosApi.get<Tip[]>(`/api/tips/portfolios/${portfolioId}/tips`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  }
};
