"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Portfolio, Holding } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
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

export default function PortfolioDetailsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const { toast } = useToast();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
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

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log("[ScrollEffect] useEffect triggered", {
      hash: window.location.hash,
      search: searchParams.toString(),
      loading
    });
    if (
      (window.location.hash === "#research-reports" || searchParams.get("scrollTo") === "reports") &&
      !loading &&
      typeof window !== "undefined"
    ) {
      const tryScroll = () => {
        const target = document.getElementById("research-reports");
        console.log("[ScrollEffect] tryScroll", { target, hash: window.location.hash });
        if (target) {
          console.log("[ScrollEffect] Found target, scrolling!");
          target.scrollIntoView({ behavior: "smooth" });
        } else {
          requestAnimationFrame(tryScroll);
        }
      };
      requestAnimationFrame(tryScroll);
    }
  }, [searchParams, loading]);



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
    setChartLoading(true);
    try {
      await fetchPriceHistory(portfolioId, period);
    } finally {
      setChartLoading(false);
    }
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

  // Fetch price history for charts using the new API structure
  const fetchPriceHistory = async (portfolioId: string, period: TimePeriod = 'Since Inception') => {
    try {
      const apiPeriod = mapPeriodToAPI(period);
      console.log(`🔍 Fetching price history for portfolio ${portfolioId} with period: ${period} (API: ${apiPeriod})`);
      
      // Use the new API endpoint structure with portfolio ID and period filter
      const response = await axiosApi.get(`/api/portfolios/${portfolioId}/price-history?period=${apiPeriod}`);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('📊 Raw API response:', response.data);
        console.log('📊 API data points count:', response.data.data?.length);
        console.log('📊 API data sample:', response.data.data?.slice(0, 3));
        
        // Use the API data directly as it matches our chart requirements
        const apiData: ChartDataPoint[] = response.data.data;
        
        // Transform the API data to chart format
        const transformedData = apiData.map((item: ChartDataPoint) => {
          const date = new Date(item.date);
          const portfolioValue = parseFloat(item.value?.toString() || '0');
          const portfolioChange = parseFloat(item.changePercent?.toString() || '0');
          const cashValue = parseFloat(item.cash?.toString() || '0');
          const changeValue = parseFloat(item.change?.toString() || '0');
          
          // Format date based on period
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
          
          return {
            date: formattedDate,
            portfolioValue: portfolioValue,
            portfolioChange: portfolioChange,
            cash: cashValue,
            change: changeValue,
            // For benchmark comparison, we'll use a simple calculation
            // In a real implementation, you'd fetch benchmark data separately
            benchmarkValue: portfolioValue * (1 + (portfolioChange * 0.8) / 100),
            benchmarkChange: portfolioChange * 0.8,
          };
        });
        
            console.log(`📊 Transformed chart data for ${transformedData.length} points:`, transformedData);
    console.log(`📈 Portfolio: ${(portfolio as any)?.name || 'Portfolio'}`);
    console.log('📅 Sample dates from transformed data:', transformedData.slice(0, 3).map(d => d.date));
    console.log('📅 All dates for 1w:', transformedData.map(d => d.date));
        
        setPriceHistory(transformedData);
        
        // Also store as full history if it's 'all' period
        if (apiPeriod === 'all') {
          setFullPriceHistory(transformedData);
        }
        
      } else {
        console.warn('⚠️ No price history data returned from API');
        // Generate sample data for demo purposes
        const sampleData = generateSampleChartData(period);
        setPriceHistory(sampleData);
      }
    } catch (error) {
      console.error("❌ Failed to fetch price history:", error);
      
      // Generate sample data as fallback
      const sampleData = generateSampleChartData(period);
      setPriceHistory(sampleData);
      
      if (period === 'Since Inception') {
        setFullPriceHistory(sampleData);
      }
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
      const date = new Date();
      
      // Calculate proper date intervals
      switch (dateInterval) {
        case 'day':
          if (period === '1w') {
            // For 1 week, generate 5 trading days (Monday to Friday)
            const currentDate = new Date();
            // Start from 4 days ago (Monday) and go forward
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
      
      // Generate cumulative realistic returns
      const dailyPortfolioChange = (Math.random() - 0.45) * 0.01; // Slight positive bias
      const dailyBenchmarkChange = dailyPortfolioChange * 0.8 + (Math.random() - 0.5) * 0.005;
      
      // Multiply by time factor for longer periods
      const timeFactor = dateInterval === 'day' ? 1 : dateInterval === 'week' ? 7 : 30;
      portfolioChange += dailyPortfolioChange * timeFactor;
      benchmarkChange += dailyBenchmarkChange * timeFactor;
      
      // Format date based on period
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
        portfolioValue: 100 + portfolioChange,
        benchmarkValue: 100 + benchmarkChange,
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
  }, [portfolioId, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
    
    // Calculate total remaining cash from all stocks
    const totalRemainingCash = holdingsWithQuantities.reduce((sum: number, holding: any) => {
      return parseFloat((sum + (holding.remainingCash || 0)).toFixed(2));
    }, 0);
    
    // Cash balance calculation with EXACT precision
    const totalStockAllocation = parseFloat(holdingsWithQuantities.reduce((sum: number, holding: any) => sum + holding.weight, 0).toFixed(2));
    const exactCashPercentage = parseFloat(Math.max(0, 100 - totalStockAllocation).toFixed(2));
    const baseCashBalance = parseFloat(((exactCashPercentage / 100) * minInvestment).toFixed(2));
    const exactCashBalance = parseFloat((baseCashBalance + totalRemainingCash).toFixed(2));
    
    // Total portfolio value with EXACT precision
    const exactTotalPortfolioValue = parseFloat((actualHoldingsValue + exactCashBalance).toFixed(2));
    
    console.log(`📋 Portfolio Metrics (EXACT):`, {
      holdingsValue: actualHoldingsValue,
      cashBalance: exactCashBalance,
      totalValue: exactTotalPortfolioValue,
      cashPercentage: exactCashPercentage,
      totalStockAllocation: totalStockAllocation,
      totalRemainingCash: totalRemainingCash
    });
    
    return {
      holdingsValue: actualHoldingsValue,
      cashBalance: exactCashBalance,
      totalValue: exactTotalPortfolioValue,
      cashPercentage: exactCashPercentage,
      minInvestment: minInvestment,
      pnl: parseFloat((exactTotalPortfolioValue - minInvestment).toFixed(2)),
      pnlPercentage: parseFloat((((exactTotalPortfolioValue - minInvestment) / minInvestment) * 100).toFixed(2)),
      holdingsWithQuantities
    };
  };
  
  const portfolioMetrics = calculatePortfolioMetrics();

  // Trailing Returns data from API
  const trailingReturns = [
    { period: "1 day", value: safeString((portfolio as any)?.dailyReturn || "0.1") },
    { period: "1 Week", value: safeString((portfolio as any)?.weeklyReturn || "0.8") },
    { period: "1 Month", value: safeString((portfolio as any)?.monthlyGains || "1.8") },
    { period: "3 Months", value: safeString((portfolio as any)?.quarterlyReturn || "5.2") },
    { period: "6 Months", value: safeString((portfolio as any)?.halfYearlyReturn || "11.4") },
    { period: "1 year", value: safeString((portfolio as any)?.oneYearGains || "22.5") },
    { period: "3 Years", value: safeString((portfolio as any)?.threeYearReturn || "45.8") },
    { period: "5 Years", value: safeString((portfolio as any)?.fiveYearReturn || "—") },
    { period: "Since Inception", value: safeString((portfolio as any)?.CAGRSinceInception || "15.2") },
  ];

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
          title={safeString(portfolio.name)} 
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
                            const sectionId = "research-reports"; // Replace with the actual ID of the section you want to navigate to
                            const section = document.getElementById(sectionId);
                            if (section) {
                              section.scrollIntoView({ behavior: "smooth" });
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
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  +{safeString((portfolio as any)?.monthlyGains || "0")}%
                </p>
                  </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium leading-tight h-8 flex items-center justify-center">1 Year<br/>Gains</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  +{safeString((portfolio as any)?.oneYearGains || "0")}%
                </p>
                  </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium leading-tight h-8 flex items-center justify-center">CAGR Since<br/>Inception</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  +{safeString((portfolio as any)?.CAGRSinceInception || "0")}%
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
                  
                  return (
                    <div className="tinymce-content">
                      <div 
                        className="text-gray-800 leading-relaxed prose prose-sm max-w-none
                          prose-headings:text-gray-900 prose-headings:font-semibold
                          prose-p:text-gray-700 prose-p:leading-relaxed
                          prose-strong:text-gray-900 prose-strong:font-semibold
                          prose-ul:my-4 prose-ol:my-4
                          prose-li:text-gray-700 prose-li:mb-1
                          prose-a:text-blue-600 prose-a:underline
                        "
                        dangerouslySetInnerHTML={{
                          __html: safeString(htmlContent)
                        }}
                      />
              </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 font-bold font-size-2xl">Portfolio Details</div>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
            <div>
                  <p className="font-semibold text-gray-800">Time Horizon</p>
                  <p className="text-gray-600">{safeString((portfolio as any)?.timeHorizon || "Long term")}</p>
              </div>
                <div>
                  <p className="font-semibold text-gray-800">Rebalancing</p>
                  <p className="text-gray-600">{safeString((portfolio as any)?.rebalancing || "Quarterly")}</p>
            </div>
            <div>
                  <p className="font-semibold text-gray-800">Benchmark Index</p>
                  <p className="text-gray-600">{safeString((portfolio as any)?.index || (portfolio as any)?.compareWith )}</p>
              </div>
          <div>
            <p className="font-semibold text-gray-800">Minimum Investment</p>
            <p className="text-gray-600">₹{safeNumber((portfolio as any)?.minInvestment || 30000).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Monthly Contribution</p>
            <p className="text-gray-600">{safeString((portfolio as any)?.monthlyContribution)}</p>
          </div>
              <div>
                  <p className="font-semibold text-gray-800">Last Rebalancing Date</p>
                  <p className="text-gray-600">{(portfolio as any)?.lastRebalanceDate ? new Date((portfolio as any).lastRebalanceDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                  <p className="font-semibold text-gray-800">Next Rebalancing Date</p>
                  <p className="text-gray-600">{(portfolio as any)?.nextRebalanceDate ? new Date((portfolio as any).nextRebalanceDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
            <p className="font-semibold text-gray-800">Launched At</p>
            <p className="text-gray-600">{(portfolio as any)?.createdAt ? new Date((portfolio as any).createdAt).toLocaleDateString() : "N/A"}</p>
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
                        {item.value}
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
                  <option value="1w">1w</option>
                  <option value="1m">1m</option>
                  <option value="3m">3m</option>
                  <option value="6m">6m</option>
                  <option value="1Yr">1y</option>
                  <option value="Since Inception">all</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-72 md:h-80 lg:h-96 bg-white rounded-lg border border-gray-200 p-4">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
              ) : priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={priceHistory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f3f4f6" 
                    opacity={0.8}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                    interval={0}
                    angle={selectedTimePeriod === '1w' || selectedTimePeriod === '1m' ? -45 : 0}
                    textAnchor={selectedTimePeriod === '1w' || selectedTimePeriod === '1m' ? 'end' : 'middle'}
                    height={selectedTimePeriod === '1w' || selectedTimePeriod === '1m' ? 60 : 40}
                    minTickGap={5}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString()}`,
                      name === 'portfolioValue' 
                        ? (safeString((portfolio as any)?.name || 'Portfolio'))
                        : safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'NIFTY 50')
                    ]}
                    labelFormatter={(label) => label}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="portfolioValue"
                    dot={false}
                    activeDot={{ 
                      r: 5, 
                      fill: '#10B981', 
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmarkValue" 
                    stroke="#6B7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="benchmarkValue"
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      fill: '#6B7280',
                      stroke: '#ffffff',
                      strokeWidth: 1
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px', 
                      paddingTop: '20px',
                      textAlign: 'center'
                    }}
                    iconType="line"
                    formatter={(value) => {
                      if (value === 'portfolioValue') {
                        const name = safeString((portfolio as any)?.name || 'Portfolio');
                        return name.length > 20 ? name.substring(0, 20) + '...' : name;
                      }
                      return safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'NIFTY 50');
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
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
                                {holding.currentPrice.toFixed(2)}
                              </div>
                              {holding.changePercent && (
                                <div className={`text-xs mt-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                                </div>
                              )}
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
                            {holding.changePercent && (
                              <div className={`text-xs mt-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                              </div>
                            )}
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

          

            {/* Portfolio Summary */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-xl border border-gray-200/60 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Portfolio Summary</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                    <span className="text-xs font-bold text-green-700">
                      {portfolioMetrics.pnlPercentage >= 0 ? '+' : ''}{portfolioMetrics.pnlPercentage.toFixed(2)}%
                    </span>
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
                    <span className="text-sm font-bold text-green-700">+{safeString((portfolio as any)?.CAGRSinceInception || "15.2")}% CAGR</span>
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
        <div className="mt-8" id="research-reports">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 leading-tight">
                <span className="block sm:inline">Latest Research Reports</span>
                <span className="block sm:inline text-base sm:text-lg lg:text-xl text-gray-700 font-medium mt-1 sm:mt-0 sm:ml-2">
                  for {safeString((portfolio as any)?.name || 'Portfolio')}
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
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}

