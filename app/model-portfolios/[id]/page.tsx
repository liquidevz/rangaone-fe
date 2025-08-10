"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Portfolio, Holding } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service";
import axiosApi from "@/lib/axios";
import { authService } from "@/services/auth.service";
import { stockPriceService, type StockPriceData } from "@/services/stock-price.service";
import { tipsService, type Tip } from "@/services/tip.service";
import TipsCarousel from "@/components/tips-carousel";
import {
  Download,
  FileText,
  Play,
  Calculator,
  RefreshCw,
  TrendingUp,
  Target,
  Calendar,
  ExternalLink,
  Clock,
  Lock,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PageHeader } from '@/components/page-header';
import { useRouter } from "next/navigation";
import { motion, useMotionValue, animate } from "framer-motion";
import { format, isSameDay, addDays, differenceInDays } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PortfolioDetailsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const { toast } = useToast();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [accessChecked, setAccessChecked] = useState<boolean>(false);
  const [holdingsWithPrices, setHoldingsWithPrices] = useState<HoldingWithPrice[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [fullPriceHistory, setFullPriceHistory] = useState<PriceHistoryData[]>([]);
  const [portfolioTips, setPortfolioTips] = useState<Tip[]>([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<PortfolioAllocationItem | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<PortfolioAllocationItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('1m');
  const [chartLoading, setChartLoading] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [chartData, setChartData] = useState<PriceHistoryData[]>([]);
  const [dailyPnl, setDailyPnl] = useState<{ value: number; percent: number }>({ value: 0, percent: 0 });
  const inceptionGainPercent = useMemo(() => {
    const series = (fullPriceHistory && fullPriceHistory.length > 0) ? fullPriceHistory : priceHistory;
    if (!series || series.length < 2) return null;
    const first = Number(series[0]?.portfolioValue || 0);
    const last = Number(series[series.length - 1]?.portfolioValue || 0);
    if (!isFinite(first) || first <= 0) return null;
    const pct = ((last - first) / first) * 100;
    return Number(pct.toFixed(2));
  }, [fullPriceHistory, priceHistory]);

  // Trailing Returns computed live from price-history API
  type TrailingItem = { period: string; value: string };
  const [trailingReturns, setTrailingReturns] = useState<TrailingItem[]>([
    { period: "1 day", value: "-" },
    { period: "1 Week", value: "-" },
    { period: "1 Month", value: "-" },
    { period: "3 Months", value: "-" },
    { period: "6 Months", value: "-" },
    { period: "1 year", value: "-" },
    { period: "3 Years", value: "-" },
    { period: "5 Years", value: "-" },
    { period: "Since Inception", value: "-" },
  ]);

  const computeChangePercent = (series: Array<{ date: string; value: number }>, startIndex: number, endIndex: number): number | null => {
    if (!series || series.length === 0) return null;
    const start = series[startIndex]?.value;
    const end = series[endIndex]?.value;
    if (typeof start !== 'number' || typeof end !== 'number' || start <= 0) return null;
    return ((end - start) / start) * 100;
  };

  const formatReturn = (val: number | null): string => {
    if (val === null || !isFinite(val)) return "-";
    const rounded = Number(val.toFixed(1));
    return `${rounded}`;
  };

  useEffect(() => {
    const loadTrailingReturns = async () => {
      try {
        const periods: Array<'1w' | '1m' | '3m' | '6m' | '1y' | 'all'> = ['1w', '1m', '3m', '6m', '1y', 'all'];
        const responses = await Promise.all(periods.map(p => axiosApi.get(`/api/portfolios/${portfolioId}/price-history?period=${p}`)));
        const byPeriod = new Map<string, any[]>(
          responses.map((res, idx) => [periods[idx], Array.isArray(res.data) ? res.data : []])
        );

        const series1w = byPeriod.get('1w') || [];
        const series1m = byPeriod.get('1m') || [];
        const series3m = byPeriod.get('3m') || [];
        const series6m = byPeriod.get('6m') || [];
        const series1y = byPeriod.get('1y') || [];
        const seriesAll = byPeriod.get('all') || [];

        const mapSeries = (arr: any[]) => arr.map(d => ({ date: d.date, value: Number(d.value) }));
        const s1w = mapSeries(series1w);
        const s1m = mapSeries(series1m);
        const s3m = mapSeries(series3m);
        const s6m = mapSeries(series6m);
        const s1y = mapSeries(series1y);
        const sAll = mapSeries(seriesAll);

        let oneDay: number | null = null;
        if (s1w.length >= 2) {
          oneDay = computeChangePercent(s1w, s1w.length - 2, s1w.length - 1);
        }

        const oneWeek = s1w.length >= 2 ? computeChangePercent(s1w, 0, s1w.length - 1) : null;
        const oneMonth = s1m.length >= 2 ? computeChangePercent(s1m, 0, s1m.length - 1) : null;
        const threeMonths = s3m.length >= 2 ? computeChangePercent(s3m, 0, s3m.length - 1) : null;
        const sixMonths = s6m.length >= 2 ? computeChangePercent(s6m, 0, s6m.length - 1) : null;
        const oneYear = s1y.length >= 2 ? computeChangePercent(s1y, 0, s1y.length - 1) : null;

        const lastDate = sAll.length > 0 ? new Date(sAll[sAll.length - 1].date) : null;
        const findStartIndexFromYears = (years: number): number | null => {
          if (!lastDate || sAll.length === 0) return null;
          const cutoff = new Date(lastDate);
          cutoff.setFullYear(cutoff.getFullYear() - years);
          for (let i = 0; i < sAll.length; i++) {
            if (new Date(sAll[i].date) >= cutoff) return i;
          }
          return null;
        };
        const idx3y = findStartIndexFromYears(3);
        const threeYears = idx3y !== null ? computeChangePercent(sAll, idx3y, sAll.length - 1) : null;
        const idx5y = findStartIndexFromYears(5);
        const fiveYears = idx5y !== null ? computeChangePercent(sAll, idx5y, sAll.length - 1) : null;
        const sinceInception = sAll.length >= 2 ? computeChangePercent(sAll, 0, sAll.length - 1) : null;

        setTrailingReturns([
          { period: '1 day', value: formatReturn(oneDay) },
          { period: '1 Week', value: formatReturn(oneWeek) },
          { period: '1 Month', value: formatReturn(oneMonth) },
          { period: '3 Months', value: formatReturn(threeMonths) },
          { period: '6 Months', value: formatReturn(sixMonths) },
          { period: '1 year', value: formatReturn(oneYear) },
          { period: '3 Years', value: formatReturn(threeYears) },
          { period: '5 Years', value: formatReturn(fiveYears) },
          { period: 'Since Inception', value: formatReturn(sinceInception) },
        ]);
      } catch (err) {
        console.error('Failed to compute trailing returns:', err);
      }
    };

    if (portfolioId && hasAccess) {
      loadTrailingReturns();
    }
  }, [portfolioId, hasAccess]);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Calculate optimized Y-axis domain for better chart visualization
  const yAxisDomain = useMemo(() => {
    if (priceHistory.length === 0) return ['dataMin', 'dataMax'];
    
    const allValues = priceHistory.flatMap(d => [d.portfolioValue, d.benchmarkValue]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue;
    
    // Use dynamic padding based on the data range
    // Smaller ranges get proportionally more padding to show differences
    let paddingPercent = 0.1; // Default 10%
    if (range < 1000) paddingPercent = 0.2; // 20% for small ranges
    else if (range < 5000) paddingPercent = 0.15; // 15% for medium ranges
    
    const padding = Math.max(range * paddingPercent, 50); // Minimum ₹50 padding
    
    return [
      Math.max(0, minValue - padding),
      maxValue + padding
    ];
  }, [priceHistory]);
  // Animate chart from flatline to actual points when data changes
  useEffect(() => {
    if (!priceHistory || priceHistory.length === 0) {
      setChartData([]);
      return;
    }
    const firstPoint = priceHistory[0];
    const baseline: PriceHistoryData[] = priceHistory.map((d) => ({
      ...d,
      portfolioValue: firstPoint.portfolioValue,
      benchmarkValue: firstPoint.benchmarkValue,
    }));
    setChartData(baseline);
    const timeoutId = setTimeout(() => setChartData(priceHistory), 60);
    return () => clearTimeout(timeoutId);
  }, [priceHistory]);

  // Compute and store Daily PnL in localStorage based on last two priceHistory points
  useEffect(() => {
    if (!priceHistory || priceHistory.length === 0) return;
    try {
      const last = priceHistory[priceHistory.length - 1]?.portfolioValue ?? 0;
      const prev = priceHistory.length > 1 ? (priceHistory[priceHistory.length - 2]?.portfolioValue ?? 0) : last;
      const change = last - prev;
      const percent = prev > 0 ? (change / prev) * 100 : 0;
      const rounded = { value: Number(change.toFixed(2)), percent: Number(percent.toFixed(2)) };
      setDailyPnl(rounded);
      const key = `dailyPnL:${portfolioId}`;
      localStorage.setItem(key, JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        ...rounded,
      }));
    } catch (e) {
      // ignore storage errors
    }
  }, [priceHistory, portfolioId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wantsReports = window.location.hash === "#reports" || searchParams.get("scrollTo") === "reports";
    if (wantsReports && !loading) {
      const tryScroll = () => {
        const target = document.getElementById("reports");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "end" });
          setTimeout(() => {
            const doc = document.documentElement;
            window.scrollTo({ top: doc.scrollHeight, behavior: "smooth" });
          }, 200);
        } else {
          requestAnimationFrame(tryScroll);
        }
      };
      requestAnimationFrame(tryScroll);
    }
  }, [searchParams, loading]);

  // Check subscription access
  useEffect(() => {
    async function checkAccess() {
      try {
        const accessData = await subscriptionService.getSubscriptionAccess();
        setSubscriptionAccess(accessData);
        
        // Check if user has access to this specific portfolio
        // Access is STRICTLY based on portfolioAccess array only
        const hasPortfolioAccess = accessData.portfolioAccess.includes(portfolioId);
        setHasAccess(hasPortfolioAccess);
        
        console.log("📊 Individual portfolio access check:", {
          portfolioId,
          hasPremium: accessData.hasPremium,
          portfolioAccess: accessData.portfolioAccess,
          hasAccess: hasPortfolioAccess,
          isIdInArray: accessData.portfolioAccess.includes(portfolioId),
          arrayLength: accessData.portfolioAccess.length,
          note: "Access based ONLY on portfolioAccess array from /api/user/subscriptions, regardless of hasPremium flag"
        });
        
        // Additional verification logging
        if (accessData.portfolioAccess.length > 0) {
          console.log("🔑 User has access to these portfolio IDs (from API):", accessData.portfolioAccess);
          accessData.portfolioAccess.forEach((id, index) => {
            console.log(`  ${index + 1}. ${id} ${id === portfolioId ? '← CURRENT PORTFOLIO' : ''}`);
          });
        } else {
          console.log("🔒 User has no portfolio access (empty portfolioAccess array from API)");
        }
        
        if (!hasPortfolioAccess) {
          toast({
            title: "Access Required",
            description: "You don't have access to this portfolio. Please subscribe to view details.",
            variant: "destructive",
          });
          // Redirect to model portfolios page after a short delay
          setTimeout(() => {
            router.push('/model-portfolios');
          }, 2000);
        }
        
      } catch (error) {
        console.error("Failed to check subscription access:", error);
        setHasAccess(false);
      } finally {
        setAccessChecked(true);
      }
    }

    if (portfolioId) {
      checkAccess();
    }
  }, [portfolioId, toast, router]);

  interface StockPrice {
    _id: string;
    symbol: string;
    exchange: string;
    name: string;
    currentPrice: string;
    previousPrice: string;
  }

  interface PriceHistoryData {
    date: string;
    rawDate?: string;
    portfolioValue: number;
    benchmarkValue: number;
    portfolioChange: number;
    benchmarkChange: number;
  }

  // API Response types for price history
  interface PriceHistoryApiResponse {
    portfolioId: string;
    period: string;
    dataPoints: number;
    data: Array<{
      date: string;
      value: number;
      cash: number;
      change: number;
      changePercent: number;
    }>;
  }

  // Chart data interface for the API response
  interface ChartDataPoint {
    date: string;
    value: number;
    cash: number;
    change: number;
    changePercent: number;
  }

  type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1Yr' | 'Since Inception';

  interface PortfolioAllocationItem {
    name: string;
    value: number;
    color: string;
    sector: string;
  }

  interface HoldingWithPrice extends Holding {
    currentPrice?: number;
    previousPrice?: number;
    change?: number;
    changePercent?: number;
    value?: number;
    marketCap?: string;
    priceData?: StockPriceData;
  }

  // Helper function to safely convert values
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Display title should drop the word "Portfolio" and keep only the first word
  const getDisplayTitle = (value: any): string => {
    const name = safeString(value);
    const withoutPortfolio = name.replace(/\bportfolio\b/gi, '').trim();
    const firstWord = withoutPortfolio.split(/\s+/)[0] || withoutPortfolio;
    return firstWord;
  };

  // Map UI periods to API periods (according to API spec: 1w, 1m, 3m, 6m, 1y, all)
  const mapPeriodToAPI = (period: TimePeriod): string => {
    switch (period) {
      case '1w':
        return '1w';
      case '1m':
        return '1m';
      case '3m':
        return '3m';
      case '6m':
        return '6m';
      case '1Yr':
        return '1y';
      case 'Since Inception':
        return 'all';
      default:
        return '1m'; // Default to 1 month instead of 'all' for better performance
    }
  };

  // Handle time period selection
  const handleTimePeriodChange = async (period: TimePeriod) => {
    setSelectedTimePeriod(period);
    // Flatten current chart visually while fetching
    if (chartData && chartData.length > 0) {
      const firstPoint = chartData[0];
      const baseline = chartData.map((d) => ({
        ...d,
        portfolioValue: firstPoint.portfolioValue,
        benchmarkValue: firstPoint.benchmarkValue,
      }));
      setChartData(baseline);
    }
    await fetchPriceHistory(portfolioId, period);
  };

  // Handle manual price refresh
  const handleRefreshPrices = async () => {
    if (!portfolio || refreshingPrices) return;
    
    setRefreshingPrices(true);
    console.log("🔄 Manually refreshing stock prices...");
    
    try {
      // Clear cache to force fresh data
      stockPriceService.clearCache();
      
      // Get current holdings
      const currentHoldings = portfolio.holdings || [];
      if (currentHoldings.length === 0) {
        console.warn("No holdings to refresh");
        toast({
          title: "No Holdings",
          description: "No holdings found to refresh prices for.",
          variant: "default",
        });
        return;
      }

      // Fetch fresh prices
      const updatedHoldings = await fetchStockPrices(currentHoldings, portfolio);
      setHoldingsWithPrices(updatedHoldings);
      
      const successCount = updatedHoldings.filter(h => h.currentPrice !== undefined).length;
      
      toast({
        title: "Prices Refreshed",
        description: `Successfully updated ${successCount}/${currentHoldings.length} stock prices.`,
        variant: "default",
      });
      
      console.log("✅ Price refresh completed");
      
    } catch (error) {
      console.error("❌ Failed to refresh prices:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh stock prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingPrices(false);
    }
  };

  // Fetch stock prices for holdings using the robust stock price service
  const fetchStockPrices = async (holdings: Holding[], portfolioData: Portfolio): Promise<HoldingWithPrice[]> => {
    console.log("🔍 Fetching live stock prices for", holdings.length, "holdings");
    
    if (!holdings || holdings.length === 0) {
      console.warn("⚠️ No holdings provided to fetchStockPrices");
      return [];
    }
    
    const minInvestment = portfolioData.minInvestment || 30000;
    
    // Extract symbols for bulk fetching
    const symbols = holdings.map(holding => holding.symbol).filter(Boolean);
    
    if (symbols.length === 0) {
      console.warn("⚠️ No valid symbols found in holdings");
      return holdings.map(holding => ({
        ...holding,
        value: (holding as any).minimumInvestmentValueStock || (holding.weight / 100) * minInvestment,
        marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
      }));
    }

    

    try {
      // Fetch prices for all symbols using the stock price service
      console.log("📊 Fetching prices for symbols:", symbols);
      const priceResults = await stockPriceService.getMultipleStockPrices(symbols);
      
      // Map results back to holdings
      const updatedHoldings: HoldingWithPrice[] = holdings.map(holding => {
        const priceResponse = priceResults.get(holding.symbol);
        
        // Calculate base allocation value with exact precision - NO ROUNDING
        const exactWeight = holding.weight; // Use exact weight value (e.g., 7.44 instead of 7)
        const allocationValue = parseFloat(((exactWeight / 100) * minInvestment).toFixed(2));
        
        let currentPrice: number | undefined;
        let previousPrice: number | undefined;
        let change: number | undefined;
        let changePercent: number | undefined;
        let priceData: StockPriceData | undefined;

        if (priceResponse?.success && priceResponse.data) {
          priceData = priceResponse.data;
          currentPrice = priceData.currentPrice;
          previousPrice = priceData.previousPrice;
          change = priceData.change;
          changePercent = priceData.changePercent;
            
          console.log(`✅ Applied exact live price for ${holding.symbol}: ₹${currentPrice}, Change: ${changePercent}%, Weight: ${exactWeight}%`);
        } else {
          console.warn(`⚠️ Failed to get price for ${holding.symbol}:`, priceResponse?.error || "No data");
        }

        return {
          ...holding,
          currentPrice,
          previousPrice,
          change,
          changePercent,
          value: allocationValue,
          marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
          priceData,
        };
      });

      const successCount = updatedHoldings.filter(h => h.currentPrice !== undefined).length;
      console.log(`📈 Stock price fetch completed. Success: ${successCount}/${holdings.length}`);
      
      return updatedHoldings;

    } catch (error) {
      console.error("❌ Failed to fetch stock prices:", error);
      
      // Return holdings with fallback data if bulk fetch fails
      return holdings.map(holding => ({
        ...holding,
        value: (holding as any).minimumInvestmentValueStock || (holding.weight / 100) * minInvestment,
        marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
      }));
    }
  };

  // Helper function to determine market cap category
  const getMarketCapCategory = (symbol: string): string => {
    // This is a simplified categorization - in real app, this would come from API
    const largeCap = ['HDFCBANK', 'RELIANCE', 'TCS', 'INFY', 'ICICIBANK', 'AXIS', 'TATAPWR'];
    const midCap = ['IDFCFIRSTB', 'KALYAN', 'NYKAA'];
    const smallCap = ['YATHARTH', 'FIVESTAR', 'EIH', 'CROMPTON', 'AVALON'];
    
    if (largeCap.some(stock => symbol.includes(stock))) return 'Large Cap';
    if (midCap.some(stock => symbol.includes(stock))) return 'Mid cap';
    if (smallCap.some(stock => symbol.includes(stock))) return 'Small cap';
    return 'Mid cap';
  };

  // Validate and clean holdings data from backend
  const validateHoldingsData = (holdings: any[], portfolioId: string): Holding[] => {
    console.log(`🔍 Validating holdings data for portfolio ${portfolioId}`);
    console.log("📊 Raw holdings data structure:", holdings);
    
    if (!holdings || !Array.isArray(holdings)) {
      console.warn("⚠️ Invalid holdings data structure:", holdings);
      return [];
    }

    // Log each holding for debugging
    holdings.forEach((holding: any, index: number) => {
      console.log(`📋 Holding ${index + 1}:`, {
        symbol: holding.symbol,
        weight: holding.weight,
        sector: holding.sector,
        status: holding.status,
        price: holding.price,
        portfolioId: holding.portfolioId, // Check if this field exists
        _id: holding._id // Check if this field exists
      });
    });

    const validHoldings: Holding[] = holdings
      .filter((holding: any) => {
        // Validate required fields
        if (!holding.symbol || !holding.weight || !holding.sector) {
          console.warn("⚠️ Invalid holding data:", holding);
          return false;
        }
        
        // Ensure weight is a valid number
        if (isNaN(holding.weight) || holding.weight <= 0) {
          console.warn("⚠️ Invalid weight for holding:", holding);
          return false;
        }
        
        return true;
      })
      .map((holding: any) => ({
        symbol: holding.symbol,
        weight: parseFloat(holding.weight),
        sector: holding.sector,
        stockCapType: holding.stockCapType || 'Mid cap',
        status: holding.status || 'FRESH-BUY',
        buyPrice: holding.buyPrice || 0,
        minimumInvestmentValueStock: holding.minimumInvestmentValueStock || 0,
        quantity: holding.quantity || 0
      }));

    console.log(`✅ Validated ${validHoldings.length} holdings out of ${holdings.length} total`);
    
    // Check for potential data mixing issues
    const totalWeight = validHoldings.reduce((sum, holding) => sum + holding.weight, 0);
    console.log(`📊 Total weight across all holdings: ${totalWeight.toFixed(2)}%`);
    
    if (totalWeight > 100) {
      console.warn("⚠️ WARNING: Total weight exceeds 100% - possible data mixing from different portfolios!");
      console.warn("📊 This could indicate holdings from multiple portfolios are being mixed together.");
    } else if (totalWeight < 50) {
      console.warn("⚠️ WARNING: Total weight is very low - possible incomplete data!");
    }
    
    return validHoldings;
  };

  const fetchPriceHistory = async (portfolioId: string, period: TimePeriod = 'Since Inception') => {
    try {
      const apiPeriod = mapPeriodToAPI(period);
      console.log(`🔍 Fetching: ${portfolioId}, period: ${apiPeriod}`);
      
      const response = await axiosApi.get(`/api/portfolios/${portfolioId}/price-history?period=${apiPeriod}`);
      
      console.log('🔍 RAW API RESPONSE:', response.data);
      console.log('🔍 Response type:', typeof response.data);
      console.log('🔍 Is array:', Array.isArray(response.data));
      
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.warn('⚠️ No valid data');
        setPriceHistory([]);
        return;
      }
      
      console.log('🔍 First 3 items:', response.data.slice(0, 3));
      
      const chartData = response.data.map((item: any) => {
        console.log('🔍 Item:', item);
        
        return {
          date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          portfolioValue: Number(item.value) || 0,
          benchmarkValue: (Number(item.value) || 0) * 0.95,
          portfolioChange: 0,
          benchmarkChange: 0
        };
      }).filter(item => item.portfolioValue > 0);
      
      console.log('🔍 Final chart data:', chartData);
      setPriceHistory(chartData);
      
    } catch (error) {
      console.error('❌ Error:', error);
      setPriceHistory([]);
    }
  };

  // Generate sample chart data for demo/fallback purposes
  const generateSampleChartData = (period: TimePeriod) => {
    let dataPoints: number;
    let dateInterval: 'day' | 'week' | 'month';
    
    // Set appropriate data points and intervals based on period
    switch (period) {
      case '1w':
        dataPoints = 5; // 5 trading days (Monday to Friday)
        dateInterval = 'day';
        break;
      case '1m':
        dataPoints = 30;
        dateInterval = 'day';
        break;
      case '3m':
        dataPoints = 12; // Weekly data points
        dateInterval = 'week';
        break;
      case '6m':
        dataPoints = 24; // Bi-weekly data points
        dateInterval = 'week';
        break;
      case '1Yr':
        dataPoints = 12; // Monthly data points
        dateInterval = 'month';
        break;
      default: // Since Inception
        dataPoints = 24; // Monthly data points over 2 years
        dateInterval = 'month';
        break;
    }

    const data = [];
    let portfolioChange = 0;
    let benchmarkChange = 0;
    
    for (let i = 0; i < dataPoints; i++) {
      let date = new Date();
      
      // Calculate proper date intervals
      switch (dateInterval) {
        case 'day':
          if (period === '1w') {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 4 + i);
            date = currentDate;
          } else {
            date.setDate(date.getDate() - (dataPoints - i - 1));
          }
          break;
        case 'week':
          date.setDate(date.getDate() - ((dataPoints - i - 1) * 7));
          break;
        case 'month':
          date.setMonth(date.getMonth() - (dataPoints - i - 1));
          break;
      }
      
      // Generate incremental returns
      const dailyReturn = (Math.random() - 0.45) * 0.5;
      const benchmarkReturn = dailyReturn * 0.85 + (Math.random() - 0.5) * 0.2;
      
      // Accumulate returns
      portfolioChange += dailyReturn;
      benchmarkChange += benchmarkReturn;
      
      // Format date
      let formattedDate: string;
      if (period === '1w') {
        formattedDate = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
      } else if (period === '1m') {
        formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      } else if (period === '3m' || period === '6m') {
        formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      } else if (period === '1Yr') {
        formattedDate = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      } else {
        formattedDate = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      }
      
      data.push({
        date: formattedDate,
        portfolioValue: 100 * (1 + portfolioChange / 100),
        benchmarkValue: 100 * (1 + benchmarkChange / 100),
        portfolioChange: parseFloat(portfolioChange.toFixed(2)),
        benchmarkChange: parseFloat(benchmarkChange.toFixed(2)),
      });
    }
    
    return data;
  };

  // Fetch portfolio tips
  const fetchPortfolioTips = async (portfolioId: string) => {
    try {
      setTipsLoading(true);
      console.log("🔍 Fetching portfolio tips for ID:", portfolioId);
      
      const tips = await tipsService.getPortfolioTips({ portfolioId });
      console.log("📋 Portfolio tips fetched:", tips);
      
      setPortfolioTips(tips || []);
    } catch (error) {
      console.error("❌ Failed to fetch portfolio tips:", error);
      setPortfolioTips([]);
      
      // Don't show error toast for tips failure as it's not critical
    } finally {
      setTipsLoading(false);
    }
  };

  useEffect(() => {
    async function loadPortfolioData() {
      // Only load portfolio data if access has been checked and user has access
      if (!accessChecked || !hasAccess) {
        return;
      }
      
      try {
        setLoading(true);
        console.log("Loading portfolio data for ID:", portfolioId);
        
        // Fetch portfolio details
        const portfolioResponse: any = await portfolioService.getById(portfolioId);
        console.log("Portfolio response received:", portfolioResponse);
        
        // Handle different response structures
        let portfolioData = portfolioResponse;
        if (portfolioResponse?.data) {
          portfolioData = portfolioResponse.data;
        } else if (portfolioResponse?.portfolio) {
          portfolioData = portfolioResponse.portfolio;
        }
        
        // Verify that we got the correct portfolio data
        if (portfolioData._id && portfolioData._id !== portfolioId) {
          console.warn(`⚠️ WARNING: Portfolio ID mismatch! Expected: ${portfolioId}, Got: ${portfolioData._id}`);
        }
        
        setPortfolio(portfolioData);
        
        // Check for holdings and fetch live prices
        if (portfolioData.holdings && portfolioData.holdings.length > 0) {
          console.log("Holdings found:", portfolioData.holdings.length, "holdings");
          
          // Validate and clean holdings data from backend
          const validatedHoldings = validateHoldingsData(portfolioData.holdings, portfolioId);
          
          if (validatedHoldings.length > 0) {
            const holdingsWithLivePrices = await fetchStockPrices(validatedHoldings, portfolioData);
            setHoldingsWithPrices(holdingsWithLivePrices);
          } else {
            console.warn("⚠️ No valid holdings found after validation");
            setHoldingsWithPrices([]);
          }
        }
        
        // Fetch price history for initial load
        await fetchPriceHistory(portfolioId, selectedTimePeriod);
        
        // Fetch portfolio tips
        fetchPortfolioTips(portfolioId);
        
      } catch (error) {
        console.error("Failed to load portfolio:", error);
        toast({
          title: "Error",
          description: "Failed to load portfolio details. Please try again later.",
          variant: "destructive",
        });
        
        setPortfolio(null);
        setHoldingsWithPrices([]);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolioData();
  }, [portfolioId, toast, accessChecked, hasAccess]);

  if (!accessChecked || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-3">
              {!accessChecked ? "Checking access..." : "Loading portfolio..."}
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Access Required</h2>
            <p className="text-gray-600 mb-6">You need to subscribe to view this portfolio's details.</p>
            <div className="space-x-4">
              <Button onClick={() => router.push('/model-portfolios')}>
                Back to Portfolios
              </Button>
              <Button variant="outline" onClick={() => router.push('/premium-subscription')}>
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Use backend calculated values from the exact backend structure
  const useBackendCalculatedValues = (holdings: HoldingWithPrice[], minInvestment: number) => {
    return holdings.map(holding => {
      // Use exact backend field names
      const quantity = holding.quantity || 0;
      const actualInvestment = holding.minimumInvestmentValueStock || 0;
      const remainingCash = holding.remainingCash || 0;
      const allocatedAmount = holding.allocatedAmount || 
        parseFloat(((holding.weight / 100) * minInvestment).toFixed(2));
      const currentValue = holding.currentValue || 0;
      const marketCap = holding.stockCapType || 'Mid cap';
      
      console.log(`📊 ${holding.symbol}: Backend values - Quantity: ${quantity}, Investment: ₹${actualInvestment}, Current Value: ₹${currentValue}, Market Cap: ${marketCap}`);
      
      return {
        ...holding,
        quantity,
        actualInvestment,
        remainingCash,
        allocatedAmount,
        currentValue,
        marketCap
      };
    });
  };

  // Calculate portfolio metrics based on live pricing with EXACT precision
  const calculatePortfolioMetrics = () => {
    const minInvestment = (portfolio as any)?.minInvestment || 30000;
    
    console.log(`📊 Calculating exact portfolio metrics for min investment: ₹${minInvestment}`);
    
    // Use backend calculated values instead of frontend calculations
    const holdingsWithQuantities = useBackendCalculatedValues(holdingsWithPrices, minInvestment);
    
    // Use backend current values if available, otherwise calculate from holdings
    const actualHoldingsValue = holdingsWithQuantities.reduce((sum: number, holding: any) => {
      if (holding.currentValue !== undefined && holding.currentValue > 0) {
        // Use backend current value
        console.log(`📈 ${holding.symbol}: Backend Current Value: ₹${holding.currentValue}`);
        return parseFloat((sum + holding.currentValue).toFixed(2));
      } else if (holding.currentPrice && holding.quantity > 0) {
        // Fallback: calculate based on quantity * current price
        const currentValue = parseFloat((holding.quantity * holding.currentPrice).toFixed(2));
        console.log(`📈 ${holding.symbol}: Calculated Current Value: ₹${currentValue}`);
        return parseFloat((sum + currentValue).toFixed(2));
      } else {
        console.log(`📉 ${holding.symbol}: No current value available`);
        return parseFloat((sum + 0).toFixed(2));
      }
    }, 0);
    
    // Calculate total actual investments (sum of all minimumInvestmentValueStock)
    const totalActualInvestments = holdingsWithQuantities.reduce((sum: number, holding: any) => {
      const actualInvestment = holding.minimumInvestmentValueStock || 0;
      return parseFloat((sum + actualInvestment).toFixed(2));
    }, 0);
    
    // Calculate cash: Minimum Investment - Sum of All Actual Investments (Investment Column)
    const exactCashBalance = parseFloat((minInvestment - totalActualInvestments).toFixed(2));
    
    // Ensure cash is not negative (can't have negative cash in reality)
    const finalCashBalance = Math.max(0, exactCashBalance);
    
    console.log(`💰 Cash Calculation Details:`, {
      minInvestment,
      totalActualInvestments,
      calculatedCash: exactCashBalance,
      finalCashBalance: finalCashBalance,
      note: "Cash = Min Investment - Sum of Investment Column (not affected by current value changes)"
    });
    
    // Total portfolio value with EXACT precision
    const exactTotalPortfolioValue = parseFloat((actualHoldingsValue + finalCashBalance).toFixed(2));
    
    // Calculate cash percentage based on current portfolio value
    const cashPercentage = exactTotalPortfolioValue > 0 ? 
      parseFloat(((finalCashBalance / exactTotalPortfolioValue) * 100).toFixed(2)) : 0;
    
    console.log(`📋 Portfolio Metrics (EXACT):`, {
      holdingsValue: actualHoldingsValue,
      cashBalance: finalCashBalance,
      totalValue: exactTotalPortfolioValue,
      cashPercentage: cashPercentage,
      totalActualInvestments
    });
    
    return {
      holdingsValue: actualHoldingsValue,
      cashBalance: finalCashBalance,
      totalValue: exactTotalPortfolioValue,
      cashPercentage: cashPercentage,
      minInvestment: minInvestment,
      pnl: parseFloat((exactTotalPortfolioValue - minInvestment).toFixed(2)),
      pnlPercentage: parseFloat((((exactTotalPortfolioValue - minInvestment) / minInvestment) * 100).toFixed(2)),
      holdingsWithQuantities,
      // Additional details for debugging/display
      totalActualInvestments
    };
  };
  
  const portfolioMetrics = calculatePortfolioMetrics();

  

  // Helper: normalize API percent values and format for display
  const normalizePercent = (value: any): number => {
    if (value === null || value === undefined) return 0;
    // Strip a trailing % if API ever returns strings like "12.3%"
    const numeric = typeof value === 'string' ? Number(value.replace(/%/g, '')) : Number(value);
    return isFinite(numeric) ? numeric : 0;
  };

  const monthlyGainsValue = normalizePercent((portfolio as any)?.monthlyGains);
  const oneYearGainsValue = normalizePercent((portfolio as any)?.oneYearGains);
  const cagrSinceInceptionValue = normalizePercent((portfolio as any)?.CAGRSinceInception);

  // Create portfolio allocation data from holdings
  const portfolioAllocationData: PortfolioAllocationItem[] = holdingsWithPrices.length > 0 
    ? holdingsWithPrices
        .sort((a, b) => b.weight - a.weight)
        .map((holding, index) => {
          const getColorForStock = (symbol: string, index: number) => {
            const stockColorMap: { [key: string]: string } = {
              'HDFCBANK': '#3B82F6',
              'IDFCFIRSTB': '#10B981',
              'INFY': '#F59E0B',
              'TCS': '#EF4444',
              'RELIANCE': '#8B5CF6',
            };
            
            return stockColorMap[symbol] || [
              '#4B4B4C', '#005F73', '#0A9396', '#92D2BD', '#E9D8A6',
              '#EE9B00', '#CA6702', '#BB3E03', '#AE2012', '#9B2226'
            ][index % 10];
          };
          
          return {
            name: holding.symbol,
            value: holding.weight,
            color: getColorForStock(holding.symbol, index),
            sector: holding.sector || holding.marketCap || 'Banking',
          };
        })
    : [
        { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
        { name: "IDFCFIRSTB", value: 20.43, color: "#10B981", sector: "Banking" }
      ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title={getDisplayTitle(portfolio.name)} 
          subtitle={(() => {
            if (Array.isArray(portfolio.description)) {
              const homeCardDesc = portfolio.description.find((item: any) => item.key === "home card");
              if (homeCardDesc && homeCardDesc.value) {
                const textContent = homeCardDesc.value.replace(/<[^>]*>/g, '');
                return textContent.length > 400 ? textContent.substring(0, 400) + '...' : textContent;
              }
            }
            return safeString(portfolio.description);
          })()} 
        />

        {/* Portfolio Info Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              {/* Action Buttons Section */}
              <div className="flex flex-row gap-3 mb-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none sm:min-w-[120px] flex items-center justify-center space-x-2 
                           border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200
                           bg-white shadow-sm hover:shadow-md"
                           onClick={() => {
                    const section = document.getElementById("reports");
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth", block: "end" });
                      setTimeout(() => {
                        const doc = document.documentElement;
                        window.scrollTo({ top: doc.scrollHeight, behavior: "smooth" });
                      }, 150);
                    }
                           }}
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Reports</span>
                </Button>
                
                {(portfolio as any)?.youTubeLinks && (portfolio as any).youTubeLinks.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none sm:min-w-[120px] flex items-center justify-center space-x-2
                           border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-200
                           bg-white shadow-sm hover:shadow-md"
                  onClick={() => window.open((portfolio as any).youTubeLinks[0].link, '_blank')}
                >
                  <Play className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Video</span>
                </Button>
                )}
            </div>
          </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium leading-tight h-8 flex items-center justify-center">Monthly Gains</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${monthlyGainsValue > 0 ? 'text-green-600' : monthlyGainsValue < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {monthlyGainsValue === 0 ? '-' : `${monthlyGainsValue > 0 ? '+' : ''}${monthlyGainsValue}%`}
                </p>
                  </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium leading-tight h-8 flex items-center justify-center">1 Year<br/>Gains</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${oneYearGainsValue > 0 ? 'text-green-600' : oneYearGainsValue < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {oneYearGainsValue === 0 ? '-' : `${oneYearGainsValue > 0 ? '+' : ''}${oneYearGainsValue}%`}
                </p>
                  </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium leading-tight h-8 flex items-center justify-center">CAGR Since<br/>Inception</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${cagrSinceInceptionValue > 0 ? 'text-green-600' : cagrSinceInceptionValue < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {cagrSinceInceptionValue === 0 ? '-' : `${cagrSinceInceptionValue > 0 ? '+' : ''}${cagrSinceInceptionValue}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-6">
              <div>
                {(() => {
                  let htmlContent = '';

                  if (Array.isArray((portfolio as any)?.description)) {
                    const portfolioCardItem = (portfolio as any).description.find((item: any) =>
                      item.key && item.key.toLowerCase() === 'portfolio card'
                    );

                    if (portfolioCardItem && portfolioCardItem.value) {
                      htmlContent = portfolioCardItem.value;
                    } else {
                      const firstDesc = (portfolio as any).description.find((item: any) => item.value);
                      htmlContent = firstDesc?.value || '';
                    }
                  } else if (typeof (portfolio as any)?.description === 'string') {
                    htmlContent = (portfolio as any).description;
                  }

                  if (!htmlContent) {
                    htmlContent = (portfolio as any)?.details || "This portfolio is designed for investors looking for balanced growth and risk management.";
                  }

                  // Split into first paragraph and the rest for mobile collapsible
                  const tempDiv = typeof window !== 'undefined' ? document.createElement('div') : null;
                  tempDiv && (tempDiv.innerHTML = safeString(htmlContent));
                  const paragraphs = tempDiv ? Array.from(tempDiv.querySelectorAll('p')).map(p => p.outerHTML) : [safeString(htmlContent)];
                  const firstParagraph = paragraphs[2] || '';
                  const restContent = paragraphs.slice(1).join('') || '';

                  return (
                    <div className="tinymce-content">
                      {/* Desktop: show full content */}
                      <div className="hidden sm:block">
                        <div
                          className="text-gray-800 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:text-gray-700 prose-li:mb-1 prose-a:text-blue-600 prose-a:underline"
                          dangerouslySetInnerHTML={{ __html: safeString(htmlContent) }}
                        />
                      </div>

                      {/* Mobile: first paragraph + expandable rest */}
                      <div className="block sm:hidden">
                        <div
                          className="text-gray-800 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:text-gray-700 prose-li:mb-1 prose-a:text-blue-600 prose-a:underline"
                          dangerouslySetInnerHTML={{ __html: firstParagraph || safeString(htmlContent) }}
                        />
                        {restContent && (
                          <div>
                            {!detailsExpanded ? (
                              <button
                                className="mt-2 text-sm text-blue-600 font-medium underline"
                                onClick={() => setDetailsExpanded(true)}
                              >
                                Read more
                              </button>
                            ) : (
                              <>
                                <div
                                  className="mt-2 text-gray-800 leading-relaxed prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: restContent }}
                                />
                                <button
                                  className="mt-2 text-sm text-blue-600 font-medium underline"
                                  onClick={() => setDetailsExpanded(false)}
                                >
                                  Show less
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 font-bold font-size-2xl">Portfolio Details</div>
              </div>
            
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">Time Horizon</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">{safeString((portfolio as any)?.timeHorizon || "Long term")}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">Rebalancing</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">{safeString((portfolio as any)?.rebalancing || "Quarterly")}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">Benchmark Index</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">{safeString((portfolio as any)?.index || (portfolio as any)?.compareWith )}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">Minimum Investment</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">₹{safeNumber((portfolio as any)?.minInvestment || 30000).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">Monthly Contribution</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">₹{safeNumber((portfolio as any)?.monthlyContribution || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">{isMobile ? 'Last Rebalancing' : 'Last Rebalancing Date'}</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">{(portfolio as any)?.lastRebalanceDate ? new Date((portfolio as any).lastRebalanceDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">{isMobile ? 'Next Rebalancing' : 'Next Rebalancing Date'}</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">{(portfolio as any)?.nextRebalanceDate ? new Date((portfolio as any).nextRebalanceDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1 sm:line-clamp-none">Launched At</p>
                  <p className="text-gray-600 line-clamp-2 sm:line-clamp-none leading-snug">{(portfolio as any)?.createdAt ? new Date((portfolio as any).createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
        </div>
          </div>
          </CardContent>
        </Card>

        {/* Trailing Returns */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">Trailing Returns</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-900 text-[#FFFFF0]">
                      {trailingReturns.map((item, index) => (
                      <th key={index} className="px-2 sm:px-4 py-3 text-center font-medium text-xs sm:text-sm whitespace-nowrap">
                        {item.period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    {trailingReturns.map((item, index) => (
                      <td key={index} className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">
                        {item.value === '-' ? '-' : `${item.value}%`}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Returns Graph */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Returns Graph - {selectedTimePeriod === '1w' ? '1 Week' : 
                              selectedTimePeriod === '1m' ? '1 Month' : 
                              selectedTimePeriod === '3m' ? '3 Months' : 
                              selectedTimePeriod === '6m' ? '6 Months' : 
                              selectedTimePeriod === '1Yr' ? '1 Year' : 
                              'All Time'}
            </h3>
            
            {/* Time period dropdown filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <select
                  value={selectedTimePeriod}
                  onChange={(e) => handleTimePeriodChange(e.target.value as TimePeriod)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="1Yr">1 Year</option>
                  <option value="Since Inception">Since Inception</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chart Info Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 How to Read This Chart</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Track your portfolio's actual value growth over time. Hover over any point to see percentage gains/losses. 
                    The <span className="font-semibold text-green-600">green line</span> shows your portfolio performance vs the 
                    <span className="font-semibold text-gray-600"> dashed gray line</span> (benchmark).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-sm">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
                    <div className="w-3 h-0.5 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Your Portfolio</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
                    <div className="w-3 h-0.5 bg-gray-500 rounded border-dashed border-t"></div>
                    <span className="text-gray-700">Benchmark</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-80 sm:h-88 md:h-96 lg:h-[28rem] bg-white rounded-lg border border-gray-200 p-4 relative">
              {/* Performance Summary Overlay - desktop only to avoid covering data on mobile */}
              {priceHistory.length > 0 && !isMobile && (
                <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-2 shadow-lg max-w-[240px]">
                  <div className="text-xs text-gray-600 mb-1">Performance Summary</div>
                  {(() => {
                    const firstValue = priceHistory[0]?.portfolioValue || 0;
                    const lastValue = priceHistory[priceHistory.length - 1]?.portfolioValue || 0;
                    const totalGain = lastValue - firstValue;
                    const totalGainPercent = firstValue > 0 ? ((totalGain / firstValue) * 100) : 0;
                    const isPositive = totalGain >= 0;
                    
                    return (
                      <div className="space-y-1">
                        <div className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}₹{Math.abs(totalGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          ({isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedTimePeriod === '1w' ? 'This Week' : 
                           selectedTimePeriod === '1m' ? 'This Month' : 
                           selectedTimePeriod === '3m' ? '3 Months' : 
                           selectedTimePeriod === '6m' ? '6 Months' : 
                           selectedTimePeriod === '1Yr' ? 'This Year' : 
                           'Since Inception'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={chartData}
                    margin={{ top: 12, right: isMobile ? 12 : 120, left: 12, bottom: 16 }}
                    onMouseMove={(state: any) => {
                      if (state?.activeTooltipIndex !== undefined) {
                        setActiveIndex(state.activeTooltipIndex);
                        setIsInteracting(true);
                      }
                    }}
                    onMouseLeave={() => { setActiveIndex(null); setIsInteracting(false); }}
                    onMouseDown={() => setIsInteracting(true)}
                    onMouseUp={() => setIsInteracting(false)}
                  >
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f3f4f6" 
                    opacity={0.8}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: isMobile ? 10 : 11, fill: '#6b7280', fontWeight: 500 }}
                    interval={isMobile ? 'preserveStartEnd' : 0}
                    angle={!isMobile && (selectedTimePeriod === '1w' || selectedTimePeriod === '1m') ? -45 : 0}
                    textAnchor={!isMobile && (selectedTimePeriod === '1w' || selectedTimePeriod === '1m') ? 'end' : 'middle'}
                    height={!isMobile && (selectedTimePeriod === '1w' || selectedTimePeriod === '1m') ? 60 : 32}
                    minTickGap={8}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                      if (value >= 100000) return `₹${(value/100000).toFixed(1)}L`;
                      if (value >= 1000) return `₹${(value/1000).toFixed(1)}K`;
                      return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
                    }}
                    tick={{ fontSize: isMobile ? 10 : 11, fill: '#6b7280', fontWeight: 500 }}
                    domain={yAxisDomain}
                    width={isMobile ? 48 : 90}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => {
                      // Calculate percentage change from the first data point
                      const firstDataPoint = priceHistory[0];
                      if (!firstDataPoint) return [`₹${value.toLocaleString('en-IN')}`, name];
                      
                      const baseValue = name === 'portfolioValue' ? firstDataPoint.portfolioValue : firstDataPoint.benchmarkValue;
                      const percentChange = ((value - baseValue) / baseValue) * 100;
                      const absoluteChange = value - baseValue;
                      
                      return [
                        <div key={name} className="space-y-1">
                          <div className="font-semibold">
                            ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-sm ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {percentChange >= 0 ? '+' : ''}₹{Math.abs(absoluteChange).toLocaleString('en-IN', { maximumFractionDigits: 0 })} 
                            ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%)
                          </div>
                        </div>,
                        name === 'portfolioValue' 
                          ? (getDisplayTitle((portfolio as any)?.name || 'Portfolio'))
                          : safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'NIFTY 50')
                      ];
                    }}
                    labelFormatter={(label) => `📅 ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: isMobile ? '12px' : '14px',
                      padding: isMobile ? '10px' : '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      minWidth: isMobile ? '140px' : '200px',
                      pointerEvents: 'none'
                    }}
                    wrapperStyle={{ pointerEvents: 'none' }}
                    allowEscapeViewBox={{ x: false, y: true }}
                    offset={10}
                    cursor={false}
                    isAnimationActive={false}
                    position={(activeIndex !== null && activeIndex > priceHistory.length - 3)
                      ? { x: undefined, y: 0 }
                      : undefined}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#10B981" 
                    strokeWidth={4}
                    name="portfolioValue"
                    dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
                    activeDot={{ 
                      r: 8, 
                      fill: '#10B981', 
                      stroke: '#ffffff',
                      strokeWidth: 3,
                      filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3))'
                    }}
                    fill="url(#portfolioGradient)"
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmarkValue" 
                    stroke="#6B7280" 
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    name="benchmarkValue"
                    dot={false}
                    activeDot={{ 
                      r: 6, 
                      fill: '#6B7280',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  {activeIndex !== null && priceHistory[activeIndex] && (
                    <ReferenceLine
                      x={priceHistory[activeIndex].date}
                      stroke="#9CA3AF"
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"
                    />
                  )}
                  {!isMobile && (
                    <Legend 
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '14px', paddingTop: '20px', textAlign: 'center' }}
                      iconType="line"
                      formatter={(value) => {
                        if (value === 'portfolioValue') {
                          const name = getDisplayTitle((portfolio as any)?.name || 'Portfolio');
                          return `📈 ${name.length > 20 ? name.substring(0, 20) + '...' : name}`;
                        }
                        return `📊 ${safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'NIFTY 50')}`;
                      }}
                    />
                  )}
                </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data</div>
              )}
          </div>
          </CardContent>
        </Card>



        {/* Portfolio & Weights Table */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-600 mb-2 sm:mb-0">Portfolio & Weights</h3>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => router.push(`/investment-calculator?portfolio=${portfolioId}`)}
              >
                <Calculator className="h-4 w-4" href="/investment-calculator" />
                <span className="text-sm">Investment calculator</span>
              </Button>
          </div>

            {/* Mobile Table Layout */}
            <div className="block lg:hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="bg-gray-600 text-[#FFFFF0] text-xs">
                    <th className="px-2 py-2 text-left font-medium">Stock Name</th>
                    <th className="px-2 py-2 text-center font-medium">Type</th>
                    <th className="px-2 py-2 text-center font-medium">Wt (%)</th>
                    <th className="px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <span>Last Traded Price</span>
                        <button
                          onClick={handleRefreshPrices}
                          disabled={refreshingPrices}
                          className={`p-1 rounded-full hover:bg-white/20 transition-all duration-200 ${
                            refreshingPrices ? 'animate-spin' : 'hover:scale-110'
                          }`}
                        >
                          <RefreshCw className={`h-3 w-3 text-[#FFFFF0] ${refreshingPrices ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                  </th>
                </tr>
              </thead>
                <tbody className="text-xs">
                  {portfolioMetrics.holdingsWithQuantities.length > 0 ? portfolioMetrics.holdingsWithQuantities.map((holding, index) => (
                    <React.Fragment key={index}>
                      <tr 
                        className={`cursor-pointer transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      >
                        <td className="px-2 py-2">
                          <div className="font-medium text-blue-600">{holding.symbol}</div>
                          <div className="text-gray-500 text-xs">NSE : {holding.symbol}</div>
                    </td>
                        <td className="px-2 py-2 text-center text-gray-700">{holding.marketCap || 'Mid cap'}</td>
                        <td className="px-2 py-2 text-center font-medium">{holding.weight.toFixed(2)}%</td>
                        <td className="px-2 py-2 text-center">
                          {holding.currentPrice ? (
                            <div>
                              <div className={`inline-block font-medium px-2 py-1 rounded text-[#FFFFF0] text-xs ${
                                holding.changePercent && holding.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                ₹{holding.currentPrice.toFixed(2)}
                              </div>
                              {typeof holding.changePercent === 'number' && holding.changePercent !== 0 ? (
                                <div className={`text-xs mt-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-gray-400">Loading...</span>
                          )}
                    </td>
                      </tr>
                      {expandedRow === index && (
                        <tr className="bg-blue-50">
                          <td colSpan={4} className="px-2 py-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">Sector:</span>
                                <div className="text-gray-800">{holding.sector}</div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Quantity:</span>
                                <div className="text-gray-800 font-medium">{holding.quantity || 0}</div>
                                {(holding.remainingCash || 0) > 0 && (
                                  <div className="text-xs text-gray-500">+₹{(holding.remainingCash || 0).toFixed(2)} cash</div>
                                )}
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Investment:</span>
                                <div className="text-gray-800 font-medium">
                                  ₹{(holding.minimumInvestmentValueStock || holding.actualInvestment || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Current Value:</span>
                                <div className="text-gray-800 font-medium">
                                  {holding.currentValue !== undefined && holding.currentValue > 0
                                    ? `₹${holding.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                                    : holding.currentPrice && holding.quantity > 0 
                                    ? `₹${(holding.quantity * holding.currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                                    : `₹0.00`
                                  }
                                </div>
                              </div>
                            </div>
                    </td>
                  </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No holdings data available
                  </td>
                </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-600 text-[#FFFFF0] text-xs">
                    <th className="px-2 py-2 text-left font-medium">Stock Name</th>
                    <th className="px-2 py-2 text-center font-medium">Type</th>
                    <th className="px-2 py-2 text-center font-medium">Sector</th>
                    <th className="px-2 py-2 text-center font-medium">Wt (%)</th>
                    <th className="px-2 py-2 text-center font-medium">Action</th>
                    <th className="px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <span>Last Traded Price</span>
                        <button
                          onClick={handleRefreshPrices}
                          disabled={refreshingPrices}
                          className={`p-1 rounded-full hover:bg-white/20 transition-all duration-200 ${
                            refreshingPrices ? 'animate-spin' : 'hover:scale-110'
                          }`}
                        >
                          <RefreshCw className={`h-3 w-3 text-[#FFFFF0] ${refreshingPrices ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </th>
                    <th className="px-2 py-2 text-center font-medium">Quantity</th>
                    <th className="px-2 py-2 text-center font-medium">Investment</th>
                    <th className="px-2 py-2 text-center font-medium">Current Value</th>
                </tr>
                </thead>
                <tbody className="text-xs">
                  {portfolioMetrics.holdingsWithQuantities.length > 0 ? portfolioMetrics.holdingsWithQuantities.map((holding, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-2 py-2">
                        <div className="font-medium text-blue-600">{holding.symbol}</div>
                        <div className="text-gray-500 text-xs">NSE : {holding.symbol}</div>
                  </td>
                      <td className="px-2 py-2 text-center text-gray-700">{holding.marketCap || 'Mid cap'}</td>
                      <td className="px-2 py-2 text-center text-gray-700">{holding.sector}</td>
                      <td className="px-2 py-2 text-center font-medium">{holding.weight.toFixed(2)}%</td>
                      <td className="px-2 py-2 text-center">
                        <span className="px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          {holding.status?.toUpperCase() || 'FRESH-BUY'}
                        </span>
                  </td>
                      <td className="px-2 py-2 text-center">
                        {holding.currentPrice ? (
                          <div>
                            <div className={`inline-block font-medium px-2 py-1 rounded text-[#FFFFF0] text-xs ${
                              holding.changePercent && holding.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              ₹{holding.currentPrice.toFixed(2)}
                            </div>
                            {typeof holding.changePercent === 'number' && holding.changePercent !== 0 ? (
                              <div className={`text-xs mt-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="inline-block font-medium px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs">
                              Loading...
                            </div>
                          </div>
                        )}
                  </td>
                      <td className="px-2 py-2 text-center">
                        <div className="font-medium text-blue-600">{holding.quantity || 0}</div>
                        {(holding.remainingCash || 0) > 0 && (
                          <div className="text-xs text-gray-500">+₹{(holding.remainingCash || 0).toFixed(2)}</div>
                        )}
                  </td>
                      <td className="px-2 py-2 text-center">
                        <span className="font-medium">
                          ₹{(holding.minimumInvestmentValueStock || holding.actualInvestment || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                  </td>
                      <td className="px-2 py-2 text-center">
                        <span className="font-medium">
                          {holding.currentValue !== undefined && holding.currentValue > 0
                            ? `₹${holding.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                            : holding.currentPrice && holding.quantity > 0 
                            ? `₹${(holding.quantity * holding.currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                            : `₹0.00`
                          }
                        </span>
                  </td>
                </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No holdings data available
                  </td>
                </tr>
                  )}
                </tbody>
            </table>
          </div>

          {/* Daily P&L */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 px-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Daily P&L</span>
                  </div>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${dailyPnl.value >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-xs font-bold ${dailyPnl.value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {dailyPnl.value >= 0 ? '+' : ''}₹{Math.abs(dailyPnl.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({dailyPnl.percent >= 0 ? '+' : ''}{Math.abs(dailyPnl.percent).toFixed(2)}%)
                    </span>
                  </div>
            </div>
          

            {/* Portfolio Summary */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-xl border border-gray-200/60 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Portfolio Summary</span>
                  </div>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/70 rounded-lg border border-gray-200/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-700">Holdings</span>
                        </div>
                    <div className="text-base font-bold text-slate-900">
                        ₹{portfolioMetrics.holdingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    <div className="text-xs text-slate-500">Total Value</div>
                  </div>

                  <div className="bg-white/70 rounded-lg border border-gray-200/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-blue-700">Cash</span>
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                          {portfolioMetrics.cashPercentage.toFixed(2)}%
                      </span>
                        </div>
                    <div className="text-base font-bold text-blue-900">
                        ₹{portfolioMetrics.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    <div className="text-xs text-blue-600">Available</div>
                  </div>

                  <div className="bg-white/70 rounded-lg border border-gray-200/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-indigo-700">Portfolio</span>
                        </div>
                    <div className="text-base font-bold text-indigo-900">
                        ₹{portfolioMetrics.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    <div className="text-xs text-indigo-600">Total Value</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100/60">
                  <div className="flex items-center justify-center space-x-2 text-center">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Since Inception:</span>
                    </div>
                    <span className={`text-sm font-bold ${inceptionGainPercent !== null && inceptionGainPercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {inceptionGainPercent === null ? '-' : `${inceptionGainPercent >= 0 ? '+' : ''}${Math.abs(inceptionGainPercent).toFixed(2)}%`} Gain
                    </span>
                  </div>
                </div>
              </div>
                </div>
          </CardContent>
        </Card>

                {/* Portfolio Tips Section */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-0">
            <div className="p-4 sm:p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-blue-600 mb-2 sm:mb-0">Portfolio Investment Tips</h3>
                {/* Removed View All Tips button */}
              </div>
            </div>
            
            <div className={`w-full ${portfolioTips.length > 0 ? 'min-h-[300px] pb-8' : 'pb-2'}`}>
              <TipsCarousel 
                portfolioId={portfolio?._id} 
                tips={portfolioTips}
                loading={tipsLoading}
                isModelPortfolio={true}
                onTipClick={(tipId) => {
                  // Navigate to tip details page
                  window.location.href = `/model-portfolios/${portfolio?._id}/tips/${tipId}`;
                }}
              />
            </div>
          </CardContent>
        </Card>

      {/* Portfolio Allocation Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
        <Card className="shadow-sm border border-gray-200 xl:col-span-2 transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-lg lg:text-xl font-bold mb-4 text-gray-800">Portfolio Allocation</h3>
            <div className="relative flex items-center justify-center">
              <div className="w-full h-64 sm:h-72 lg:h-80 xl:h-96 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      onMouseEnter={(data) => {
                          setHoveredSegment(data);
                          if (selectedSegment && selectedSegment.name !== data.name) {
                            setSelectedSegment(data);
                        }
                      }}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={(data) => {
                          if (selectedSegment?.name === data.name) {
                            setSelectedSegment(null);
                          } else {
                            setSelectedSegment(data);
                          }
                      }}
                    >
                      {portfolioAllocationData.map((entry, index) => {
                        const isActive = hoveredSegment?.name === entry.name;
                        const isSelected = selectedSegment?.name === entry.name;
                        const isFaded = hoveredSegment && !isActive;

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              transformOrigin: 'center',
                              transform: isActive 
                                ? 'scale(1.08) translateZ(0)' 
                                : isSelected 
                                  ? 'scale(1.03) translateZ(0)' 
                                  : 'scale(1) translateZ(0)',
                              filter: isActive
                                ? `brightness(1.15) saturate(1.3) drop-shadow(0 4px 8px rgba(0,0,0,0.15))`
                                : isSelected
                                  ? `brightness(1.08) saturate(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))`
                                  : isFaded
                                    ? 'brightness(0.75) saturate(0.5)'
                                    : 'brightness(1) saturate(1)',
                              opacity: isFaded ? 0.5 : 1,
                              willChange: 'transform, filter, opacity',
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center max-w-40">
                    {(hoveredSegment || selectedSegment) ? (
                      <div className="transition-all duration-500 ease-out transform scale-100 animate-in fade-in-0 slide-in-from-bottom-2">
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 transition-all duration-300 transform hover:scale-105">
                          {(hoveredSegment || selectedSegment)?.value.toFixed(1)}%
                  </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 leading-tight mb-1 transition-all duration-300">
                          {(hoveredSegment || selectedSegment)?.name}
                        </div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide transition-all duration-300">
                          {(hoveredSegment || selectedSegment)?.sector}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 transition-all duration-500 ease-out animate-in fade-in-0">
                        <div className="text-lg font-semibold mb-1 transition-colors duration-300">Portfolio</div>
                        <div className="text-sm transition-colors duration-300">Click or hover to explore</div>
                </div>
              )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200 xl:col-span-3 transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Holdings Detail</h3>
            <div className="space-y-2 h-64 sm:h-72 lg:h-80 xl:h-96 overflow-y-auto">
              {portfolioAllocationData
                .sort((a, b) => b.value - a.value)
                .map((stock, index) => {
                  const isSelected = selectedSegment?.name === stock.name;
                  const isHovered = hoveredSegment?.name === stock.name;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 lg:p-4 rounded-lg cursor-pointer transition-all duration-300 ease-out transform will-change-transform ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200 shadow-md scale-[1.02] translate-x-1' 
                          : isHovered 
                            ? 'bg-gray-50 border border-gray-200 shadow-sm scale-[1.01] translate-x-0.5'
                            : 'hover:bg-gray-50 border border-transparent hover:shadow-sm hover:scale-[1.005] hover:-translate-y-0.5'
                        }`}
                      onClick={() => setSelectedSegment(isSelected ? null : stock)}
                      onMouseEnter={() => {
                          setHoveredSegment(stock);
                          if (selectedSegment && selectedSegment.name !== stock.name) {
                            setSelectedSegment(stock);
                        }
                      }}
                      onMouseLeave={() => setHoveredSegment(null)}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        transitionDelay: isHovered || isSelected ? '0ms' : `${index * 20}ms`
                      }}
                    >
                      <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                        <div 
                          className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0 transition-all duration-300 ${
                            isSelected || isHovered ? 'scale-110 shadow-md' : 'scale-100'
                          }`}
                          style={{ 
                            backgroundColor: stock.color,
                            boxShadow: isSelected || isHovered ? `0 0 10px ${stock.color}40` : 'none'
                          }}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm lg:text-base font-medium text-gray-800 truncate transition-all duration-300 ${
                            isSelected ? 'text-blue-800 font-semibold' : isHovered ? 'text-gray-900 font-medium' : ''
                          }`}>
                            {stock.name}
                          </div>
                          <div className={`text-xs lg:text-sm text-gray-500 transition-colors duration-300 ${
                            isSelected ? 'text-blue-600' : isHovered ? 'text-gray-600' : ''
                          }`}>
                            {stock.sector}
                          </div>
                          </div>
                        </div>
                      <div className="text-right flex-shrink-0 ml-2 lg:ml-4 transition-all duration-300">
                        <div className={`text-sm lg:text-base font-bold text-gray-900 transition-all duration-300 ${
                          isSelected ? 'text-blue-800 scale-105' : isHovered ? 'text-gray-900 scale-102' : ''
                        }`}>
                            {stock.value.toFixed(1)}%
                          </div>
                        <div className={`text-xs lg:text-sm text-gray-500 transition-colors duration-300 ${
                          isSelected ? 'text-blue-600' : isHovered ? 'text-gray-600' : ''
                        }`}>
                            ₹{parseFloat(((stock.value / 100) * portfolioMetrics.totalValue).toFixed(2)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Research Reports Section */}
        <div className="mt-8 scroll-mt-24 md:scroll-mt-28" id="reports">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 leading-tight">
                <span className="block sm:inline">Latest Research Reports</span>
                <span className="block sm:inline text-base sm:text-lg lg:text-xl text-gray-700 font-medium mt-1 sm:mt-0 sm:ml-2">
                  for {getDisplayTitle((portfolio as any)?.name || 'Portfolio')}
                </span>
              </h2>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-xs sm:text-sm text-gray-600">Filter By:</span>
                <select className="border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  <option>All</option>
                  <option>PDF</option>
                  <option>Research</option>
                </select>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-4">
              <h3 className="text-blue-600 font-medium pb-2">Latest Updates</h3>
            </div>

            <div className="space-y-6">
              
              {(portfolio as any)?.downloadLinks && (portfolio as any).downloadLinks.length > 0 ? (
                (portfolio as any).downloadLinks.map((link: any, index: number) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <p className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm md:text-base font-medium bg-gray-700 text-[#FFFFF0] inline-block whitespace-nowrap">
                      {link.linkType || 'Research document and analysis for portfolio subscribers.'}
                    </p>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {link.name || link.linkDiscription || `${link.linkType?.charAt(0).toUpperCase() + link.linkType?.slice(1) || 'Document'} Report`}
                    </h4>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span>Publish on {new Date(link.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <a 
                      href={link.linkUrl || link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                    >
                      Details →
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📄</div>
                  <p className="text-gray-600">No research reports available at the moment.</p>
                </div>
              )}
            </div>

            {/* Compact Performance Summary for mobile placed below chart */}
            {isMobile && priceHistory.length > 0 && (
              <div className="mt-2 px-2 py-2 bg-white border rounded-md text-xs flex items-center justify-between">
                {(() => {
                  const firstValue = priceHistory[0]?.portfolioValue || 0;
                  const lastValue = priceHistory[priceHistory.length - 1]?.portfolioValue || 0;
                  const totalGain = lastValue - firstValue;
                  const totalGainPercent = firstValue > 0 ? ((totalGain / firstValue) * 100) : 0;
                  const isPositive = totalGain >= 0;
                  return (
                    <>
                      <span className="text-gray-600">Performance</span>
                      <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}₹{Math.abs(totalGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        {' '}({isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}

