export interface User {
  id: string;
  name: string;
  company: string;
  avatar?: string;
}

export interface StockData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  target: number;
  timeHorizon: string;
  closed?: boolean;
  returnPercentage?: number;
  buyRange?: { min: number; max: number };
  targetPrice?: { min: number; max: number };
  addMoreAt?: { min: number; max: number };
  recommendedDate?: string;
  ltp?: { price: number; change: number; changePercent: number };
  whyBuy?: string[];
  category?: string;
}

export interface Stock {
  symbol: string;
  allocation: number;
  currentPrice: number;
  purchasePrice: number;
}

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

export interface YoutubeLink {
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
  youTubeLinks?: YoutubeLink[];
  monthlyGains?: number;
  oneYearGains?: number;
  totalInvestment?: number;
  currentValue?: number;
  isPurchased?: boolean;
  cagr?: number;
  returns?: number;
  message?: string; // For subscription access control - if present, user needs to subscribe
}

export interface TipDownloadLink {
  link: string;
  createdAt: string;
}

export interface Tip {
  _id: string;
  portfolio: string;
  title: string;
  content: string;
  status: string;
  buyRange: string;
  targetPrice: string;
  addMoreAt: string;
  tipUrl: string;
  horizon: string;
  downloadLinks: TipDownloadLink[];
  createdAt: string;
  updatedAt: string;
}
