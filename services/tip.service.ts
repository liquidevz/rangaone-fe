import axiosApi from "@/lib/axios";

export interface TipDownloadLink {
  linkType: string;
  linkUrl: string;
  linkDiscription: string;
  createdAt: string;
  _id: string;
  name: string;
  url: string;
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
  message?: string; // For subscription messages
}

export interface TipsFilterParams {
  startDate?: string;
  endDate?: string;
  category?: 'basic' | 'premium';
  status?: 'active' | 'closed' | 'expired';
  action?: 'buy' | 'sell' | 'hold';
  stockId?: string;
  portfolioId?: string;
}

export const tipsService = {
  // Fetch general tips (without portfolio association)
  getAll: async (params?: TipsFilterParams): Promise<Tip[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.stockId) queryParams.append('stockId', params.stockId);
    
    const url = `/api/user/tips${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axiosApi.get<Tip[]>(url, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch portfolio-specific tips
  getPortfolioTips: async (params?: TipsFilterParams): Promise<Tip[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.portfolioId) queryParams.append('portfolioId', params.portfolioId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.stockId) queryParams.append('stockId', params.stockId);
    
    const url = `/api/user/tips-with-portfolio${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axiosApi.get<Tip[]>(url, {
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

  // Fetch tips by portfolio ID (legacy method for backward compatibility)
  getByPortfolioId: async (portfolioId: string): Promise<Tip[]> => {
    return tipsService.getPortfolioTips({ portfolioId });
  }
};
