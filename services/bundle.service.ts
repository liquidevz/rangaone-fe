// services/bundle.service.ts
import { get } from "@/lib/axios";

export interface Bundle {
  _id: string;
  name: string;
  description: string;
  portfolios: Portfolio[];
  discountPercentage: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  _id: string;
  name: string;
  description?: Array<{
    key: string;
    value: string;
  }>;
  subscriptionFee: Array<{
    type: "monthly" | "quarterly" | "yearly";
    price: number;
  }>;
  minInvestment: number;
  durationMonths?: number;
  holdings?: Array<{
    symbol: string;
    weight: number;
    sector: string;
    status: string;
    price: number;
  }>;
}

export const bundleService = {
  // Get all bundles
  getAll: async (): Promise<Bundle[]> => {
    return await get<Bundle[]>("/api/bundles", {
      headers: {
        accept: "application/json",
      },
    });
  },

  // Get bundle by ID
  getById: async (id: string): Promise<Bundle> => {
    return await get<Bundle>(`/api/bundles/${id}`, {
      headers: {
        accept: "application/json",
      },
    });
  },
};