// types/portfolio.ts
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
  // Holdings and sensitive data excluded from user endpoints
}

// Cart related types
export interface CartPortfolio {
  _id: string;
  name: string;
  description: PortfolioDescription[];
  subscriptionFee: SubscriptionFee[];
  minInvestment: number;
  durationMonths: number;
}

export interface CartItem {
  _id: string;
  portfolio: CartPortfolio;
  quantity: number;
  addedAt: string;
}

// New bundle cart item interface
export interface BundleCartItem {
  _id: string;
  bundle: {
    _id: string;
    name: string;
    description: string;
    category: string;
    monthlyPrice: number;
    quarterlyPrice: number;
    yearlyPrice: number;
    discountPercentage: number;
  };
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Enhanced cart interface for mixed items (portfolios + bundles)
export interface EnhancedCart {
  _id: string;
  user: string;
  portfolioItems: CartItem[];
  bundleItems: BundleCartItem[];
  createdAt: string;
  updatedAt: string;
}

// Bundle type for cart operations
export interface Bundle {
  _id: string;
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  discountPercentage: number;
  portfolios?: UserPortfolio[];
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for portfolio data
export const getDescriptionByKey = (descriptions: PortfolioDescription[], key: string): string => {
  const desc = descriptions.find(d => d.key === key);
  return desc?.value || "";
};

export const getPriceByType = (subscriptionFee: SubscriptionFee[], type: "monthly" | "quarterly" | "yearly"): number => {
  const fee = subscriptionFee.find(f => f.type === type);
  return fee?.price || 0;
};

// Description key constants
export const DESCRIPTION_KEYS = {
  HOME_CARD: "home card",
  CHECKOUT_CARD: "checkout card", 
  PORTFOLIO_CARD: "portfolio card",
  METHODOLOGY_LINK: "methodology PDF link"
} as const;