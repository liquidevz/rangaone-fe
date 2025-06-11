// services/user-portfolio.service.ts
import axiosApi from "@/lib/axios";

export interface SubscriptionFee {
  type: "monthly" | "quarterly" | "yearly";
  price: number;
}

export interface PortfolioDescription {
  key: string;
  value: string;
}

export interface YouTubeLink {
  link: string;
  createdAt: string;
}

export interface UserPortfolio {
  _id: string;
  name: string;
  description: PortfolioDescription[];
  subscriptionFee: SubscriptionFee[];
  minInvestment: number;
  durationMonths: number;
  createdAt: string;
  // Note: Holdings and sensitive data excluded from user endpoints
}

export const userPortfolioService = {
  // Fetch all portfolios (public info only)
  getAll: async (): Promise<UserPortfolio[]> => {
    const response = await axiosApi.get<UserPortfolio[]>("/api/user/portfolios", {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Fetch portfolio by ID (public info only)
  getById: async (id: string): Promise<UserPortfolio> => {
    const response = await axiosApi.get<UserPortfolio>(`/api/user/portfolios/${id}`, {
      headers: {
        accept: "application/json",
      },
    });
    return response.data;
  },

  // Helper function to get description by key
  getDescriptionByKey: (descriptions: PortfolioDescription[], key: string): string => {
    const desc = descriptions.find(d => d.key === key);
    return desc?.value || "";
  },

  // Helper function to get price by subscription type
  getPriceByType: (subscriptionFee: SubscriptionFee[], type: "monthly" | "quarterly" | "yearly"): number => {
    const fee = subscriptionFee.find(f => f.type === type);
    return fee?.price || 0;
  }
};