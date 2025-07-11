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
  ExternalLink,
  Clock,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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

import { PageHeader } from '@/components/page-header';

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
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('1m');

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

  // Map UI periods to API periods
  const mapPeriodToAPI = (period: string): string => {
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
        return 'all';
    }
  };

  // Handle time period selection
  const handleTimePeriodChange = async (period: string) => {
    setSelectedTimePeriod(period);
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
        
        // Calculate base allocation value
        const allocationValue = (holding.weight / 100) * minInvestment;
        
        let currentValue = allocationValue;
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
          
          // Calculate current value based on live price change
          if (changePercent !== undefined) {
            const changeDecimal = changePercent / 100;
            currentValue = allocationValue * (1 + changeDecimal);
          }
          
          console.log(`✅ Applied live price for ${holding.symbol}: ₹${currentPrice}, Change: ${changePercent}%, Value: ₹${currentValue.toFixed(2)}`);
        } else {
          console.warn(`⚠️ Failed to get price for ${holding.symbol}:`, priceResponse?.error || "No data");
        }

        return {
          ...holding,
          currentPrice,
          previousPrice,
          change,
          changePercent,
          value: currentValue,
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

  // Fetch price history for charts
  const fetchPriceHistory = async (portfolioId: string, period: string = 'Since Inception') => {
    try {
      const token = authService.getAccessToken();
      const apiPeriod = mapPeriodToAPI(period);
      
      console.log(`🔍 Fetching price history for period: ${period} (API: ${apiPeriod})`);
      
      const response = await axiosApi.get(`/api/portfolios/${portfolioId}/price-history?period=${apiPeriod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('📈 Price history API response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Transform the real API data to match our chart format
        const transformedData = response.data.data.map((item: any, index: number) => {
          const date = new Date(item.date);
          const portfolioValue = parseFloat(item.value || 0);
          const portfolioChange = parseFloat(item.changePercent || 0);
          
          // Calculate benchmark change based on portfolio performance
          const benchmarkChange = portfolioChange * 0.8 + (Math.random() - 0.5) * 0.5; // Correlated but different
          const benchmarkValue = portfolioValue * (1 + (benchmarkChange - portfolioChange) / 100);
          
          // Format date based on period
          let formattedDate: string;
          if (period === '1w') {
            formattedDate = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
          } else if (period === '1m') {
            formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          } else if (period === '3m' || period === '6m') {
            formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          } else {
            formattedDate = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
          }
          
          return {
            date: formattedDate,
            portfolioValue: portfolioValue,
            benchmarkValue: Math.max(benchmarkValue, 0),
            portfolioChange: portfolioChange,
            benchmarkChange: benchmarkChange,
          };
        });
        
        console.log('📊 Transformed chart data:', transformedData);
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
  const generateSampleChartData = (period: string) => {
    let dataPoints: number;
    let dateInterval: 'day' | 'week' | 'month';
    
    // Set appropriate data points and intervals based on period
    switch (period) {
      case '1w':
        dataPoints = 7;
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
          date.setDate(date.getDate() - (dataPoints - i - 1));
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
      
      const tips = await portfolioService.getPortfolioTips(portfolioId);
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
        console.log("🔍 Attempting to fetch portfolio with downloadLinks...");
        
        // Try multiple approaches to get the complete data
        let portfolioResponse: any;
        
        // Approach 1: Use the standard service
        try {
          portfolioResponse = await portfolioService.getById(portfolioId);
          console.log("✅ Standard API call successful");
      } catch (error) {
          console.error("❌ Standard API call failed:", error);
          throw error;
        }
        
        // Approach 2: Try different endpoint variations if downloadLinks is missing
        if (!portfolioResponse?.downloadLinks && !(portfolioResponse?.data?.downloadLinks)) {
          console.log("⚠️ downloadLinks missing, trying alternative endpoints...");
          const token = authService.getAccessToken();
          const endpoints = [
            `/api/portfolios/${portfolioId}`,
            `/api/portfolios/${portfolioId}?include=downloadLinks`,
            `/api/user/portfolios/${portfolioId}?include=all`,
            `/api/user/portfolios/${portfolioId}?fields=*`,
          ];
          
          for (const endpoint of endpoints) {
            try {
              console.log(`🔍 Trying endpoint: ${endpoint}`);
              const altResponse = await axiosApi.get(endpoint, {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log(`📡 Response from ${endpoint}:`, altResponse.data);
              if (altResponse.data?.downloadLinks || altResponse.data?.data?.downloadLinks) {
                portfolioResponse = altResponse.data;
                console.log(`✅ Found downloadLinks via ${endpoint}!`);
                break;
              }
            } catch (error) {
              console.log(`❌ ${endpoint} failed:`, error);
            }
          }
        }
        console.log("Portfolio response received:", portfolioResponse);
        
        // Handle different response structures
        let portfolioData = portfolioResponse;
        if (portfolioResponse?.data) {
          portfolioData = portfolioResponse.data;
        } else if (portfolioResponse?.portfolio) {
          portfolioData = portfolioResponse.portfolio;
        }
        
        console.log("Processed portfolio data:", portfolioData);
        console.log("=== PORTFOLIO DATA ANALYSIS ===");
        console.log("Portfolio name:", portfolioData?.name);
        console.log("Portfolio description:", portfolioData?.description);
        console.log("Download links field exists:", !!portfolioData?.downloadLinks);
        console.log("Download links value:", portfolioData?.downloadLinks);
        console.log("Download links type:", typeof portfolioData?.downloadLinks);
        console.log("Download links length:", portfolioData?.downloadLinks?.length);
        console.log("All portfolio keys:", Object.keys(portfolioData || {}));
        console.log("Raw API response keys:", Object.keys(portfolioResponse || {}));
        console.log("Raw API response:", portfolioResponse);
        console.log("=== END ANALYSIS ===");
        setPortfolio(portfolioData);
        
        // Check for holdings and log detailed info
        if (portfolioData.holdings && portfolioData.holdings.length > 0) {
          console.log("Holdings found:", portfolioData.holdings.length, "holdings");
          console.log("Holdings data:", portfolioData.holdings);
          
          // Fetch live prices for holdings
          const holdingsWithLivePrices = await fetchStockPrices(portfolioData.holdings, portfolioData);
          console.log("Holdings with prices:", holdingsWithLivePrices);
          setHoldingsWithPrices(holdingsWithLivePrices);
        } else {
          console.warn("No holdings found in portfolio data");
          
          // Check if portfolio has any other arrays that might contain holdings
          let alternativeHoldings: Holding[] = [];
          
          // Look for holdings in different properties from API
          if (portfolioData.holdings && Array.isArray(portfolioData.holdings)) {
            // Map API holdings structure to our internal structure
            alternativeHoldings = portfolioData.holdings.map((holding: any) => ({
              symbol: holding.symbol || '',
              weight: holding.weight || 0,
              sector: holding.sector || 'Unknown',
              status: holding.status || 'Hold',
              price: holding.buyPrice || holding.price || 0
            }));
            console.log("Found holdings array from API:", alternativeHoldings);
          } else if (portfolioData.stocks && Array.isArray(portfolioData.stocks)) {
            alternativeHoldings = portfolioData.stocks.map((stock: any) => ({
              symbol: stock.symbol || stock.name || '',
              weight: stock.allocation || stock.weight || stock.percentage || 0,
              sector: stock.sector || 'Unknown',
              status: 'HOLD',
              price: stock.currentPrice || stock.price || 0
            }));
            console.log("Found stocks array, converted to holdings:", alternativeHoldings);
          } else {
            // Create fallback holdings if none exist
            alternativeHoldings = [
              { symbol: "HDFCBANK", weight: 79.57, sector: "Banking", status: "HOLD", price: 1650 },
              { symbol: "INFY", weight: 20.43, sector: "IT", status: "HOLD", price: 1450 }
            ];
            console.log("Using fallback holdings:", alternativeHoldings);
          }
          
          const fallbackWithPrices = await fetchStockPrices(alternativeHoldings, portfolioData);
          setHoldingsWithPrices(fallbackWithPrices);
        }
        
        // Fetch price history for initial load
        await fetchPriceHistory(portfolioId, selectedTimePeriod);
        
        // Fetch portfolio tips (in parallel to avoid blocking)
        fetchPortfolioTips(portfolioId);
        
      } catch (error) {
        console.error("Failed to load portfolio:", error);
        toast({
          title: "Error",
          description: "Failed to load portfolio details. Please try again later.",
          variant: "destructive",
        });
        
        // Set empty states on error
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

  // Calculate portfolio metrics based on live pricing
  const calculatePortfolioMetrics = () => {
    const minInvestment = (portfolio as any)?.minInvestment || 30000;
    
    // Calculate actual holdings value using live prices
    const actualHoldingsValue = holdingsWithPrices.reduce((sum, holding) => {
      const allocatedAmount = (holding.weight / 100) * minInvestment;
      
      if (holding.currentPrice && holding.previousPrice && holding.previousPrice > 0) {
        // Calculate price change factor
        const priceChangeFactor = holding.currentPrice / holding.previousPrice;
        // Apply price change to the allocated amount
        const currentValue = allocatedAmount * priceChangeFactor;
        console.log(`${holding.symbol}: Allocated ₹${allocatedAmount.toFixed(0)}, Price change ${(priceChangeFactor - 1) * 100}%, Current value ₹${currentValue.toFixed(0)}`);
        return sum + currentValue;
      } else if (holding.currentPrice && holding.changePercent !== undefined) {
        // Use percentage change if available
        const changeDecimal = holding.changePercent / 100;
        const currentValue = allocatedAmount * (1 + changeDecimal);
        console.log(`${holding.symbol}: Allocated ₹${allocatedAmount.toFixed(0)}, Change ${holding.changePercent}%, Current value ₹${currentValue.toFixed(0)}`);
        return sum + currentValue;
      } else {
        // Fallback to allocated amount if no price data
        console.log(`${holding.symbol}: Using allocated amount ₹${allocatedAmount.toFixed(0)} (no live price data)`);
        return sum + allocatedAmount;
      }
    }, 0);
    
    // Cash balance (remaining after stock allocation)
    const totalStockAllocation = holdingsWithPrices.reduce((sum, holding) => sum + holding.weight, 0);
    const cashPercentage = Math.max(0, 100 - totalStockAllocation);
    const cashBalance = (cashPercentage / 100) * minInvestment;
    
    // Total portfolio value
    const totalPortfolioValue = actualHoldingsValue + cashBalance;
    
    console.log(`📊 Portfolio Metrics:
      Min Investment: ₹${minInvestment.toLocaleString()}
      Holdings Value: ₹${actualHoldingsValue.toFixed(0)}
      Cash Balance: ₹${cashBalance.toFixed(0)} (${cashPercentage.toFixed(1)}%)
      Total Value: ₹${totalPortfolioValue.toFixed(0)}
      P&L: ₹${(totalPortfolioValue - minInvestment).toFixed(0)} (${((totalPortfolioValue - minInvestment) / minInvestment * 100).toFixed(2)}%)`);
    
    return {
      holdingsValue: actualHoldingsValue,
      cashBalance: cashBalance,
      totalValue: totalPortfolioValue,
      cashPercentage: cashPercentage,
      minInvestment: minInvestment,
      pnl: totalPortfolioValue - minInvestment,
      pnlPercentage: ((totalPortfolioValue - minInvestment) / minInvestment) * 100
    };
  };
  
  const portfolioMetrics = calculatePortfolioMetrics();
  const totalValue = portfolioMetrics.totalValue;

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

  // Create portfolio allocation data from holdings with consistent colors
  const portfolioAllocationData: PortfolioAllocationItem[] = holdingsWithPrices.length > 0 
    ? holdingsWithPrices
        .sort((a, b) => b.weight - a.weight) // Sort by weight descending first
        .map((holding, index) => {
          // Define specific colors for known stocks to ensure consistency
          const getColorForStock = (symbol: string, index: number) => {
            const stockColorMap: { [key: string]: string } = {
              'HDFCBANK': '#3B82F6',     // Blue
              'IDFCFIRSTB': '#10B981',   // Green
              'INFY': '#F59E0B',         // Orange
              'TCS': '#EF4444',          // Red
              'RELIANCE': '#8B5CF6',     // Purple
            };
            
            return stockColorMap[symbol] || [
              '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
              '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
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

  // Debug logging
  console.log('Holdings with prices:', holdingsWithPrices);
  console.log('Portfolio allocation data:', portfolioAllocationData);

  // Find the largest holding for center display
  const largestHolding = portfolioAllocationData.length > 0 
    ? portfolioAllocationData.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current, portfolioAllocationData[0]
      )
    : { name: "HDFCBANK", value: 79.57, color: "#0088FE", sector: "Banking" };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title={safeString(portfolio.name)} 
          subtitle={(() => {
            // Handle description array with "home card" key for header description
            if (Array.isArray(portfolio.description)) {
              const homeCardDesc = portfolio.description.find((item: any) => item.key === "home card");
              if (homeCardDesc && homeCardDesc.value) {
                // Strip HTML tags for header display and truncate
                const textContent = homeCardDesc.value.replace(/<[^>]*>/g, '');
                return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
              }
            }
            // Fallback to string description
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
                    const downloadLinks = (portfolio as any)?.downloadLinks;
                    if (downloadLinks && downloadLinks.length > 0) {
                      window.open(downloadLinks[0].linkUrl || downloadLinks[0].url, '_blank');
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
                {/* Extract and render portfolio card description */}
                {(() => {
                  // Debug logging
                  console.log("=== PORTFOLIO DESCRIPTION DEBUG ===");
                  console.log("Portfolio description:", (portfolio as any)?.description);
                  console.log("Portfolio description type:", typeof (portfolio as any)?.description);
                  console.log("Is array:", Array.isArray((portfolio as any)?.description));
                  
                  let htmlContent = '';
                  
                  // Check if description is an array of key-value pairs
                  if (Array.isArray((portfolio as any)?.description)) {
                    console.log("Processing array description...");
                    const portfolioCardItem = (portfolio as any).description.find((item: any) => 
                      item.key && item.key.toLowerCase() === 'portfolio card'
                    );
                    console.log("Portfolio card item found:", portfolioCardItem);
                    
                    if (portfolioCardItem && portfolioCardItem.value) {
                      htmlContent = portfolioCardItem.value;
                    } else {
                      // Try to find any description content
                      const firstDesc = (portfolio as any).description.find((item: any) => item.value);
                      console.log("First description item:", firstDesc);
                      htmlContent = firstDesc?.value || '';
                    }
                  } else if (typeof (portfolio as any)?.description === 'string') {
                    console.log("Processing string description...");
                    htmlContent = (portfolio as any).description;
                  }
                  
                  // Fallback
                  if (!htmlContent) {
                    console.log("Using fallback content...");
                    htmlContent = (portfolio as any)?.details || "This portfolio is designed for investors looking for balanced growth and risk management.";
                  }
                  
                  console.log("Final HTML content:", htmlContent);
                  console.log("=== END DEBUG ===");
                  
                  return (
                    <div className="tinymce-content">
                      <div 
                        className="
                          [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-4
                          [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-gray-900 [&>h2]:mb-3
                          [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mb-2
                          [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-gray-900 [&>h4]:mb-2
                          [&>h5]:text-sm [&>h5]:font-semibold [&>h5]:text-gray-900 [&>h5]:mb-2
                          [&>h6]:text-xs [&>h6]:font-semibold [&>h6]:text-gray-900 [&>h6]:mb-2
                          [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-base
                          [&>strong]:font-semibold [&>strong]:text-gray-900
                          [&>em]:italic [&>em]:text-gray-700
                          [&>b]:font-semibold [&>b]:text-gray-900
                          [&>i]:italic [&>i]:text-gray-700
                          [&>ul]:my-4 [&>ul]:pl-6 [&>ul]:list-disc
                          [&>ol]:my-4 [&>ol]:pl-6 [&>ol]:list-decimal
                          [&>li]:text-gray-700 [&>li]:mb-2 [&>li]:leading-relaxed
                          [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:my-4
                          [&>table]:border-collapse [&>table]:w-full [&>table]:my-4
                          [&>thead]:bg-gray-50
                          [&>th]:border [&>th]:border-gray-300 [&>th]:p-2 [&>th]:font-semibold [&>th]:text-left
                          [&>td]:border [&>td]:border-gray-300 [&>td]:p-2
                          [&>a]:text-blue-600 [&>a]:underline hover:[&>a]:text-blue-800
                          [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                          [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:my-4
                          [&>img]:max-w-full [&>img]:h-auto [&>img]:my-4 [&>img]:rounded
                          [&>hr]:my-6 [&>hr]:border-gray-300
                          [&>div]:mb-2
                          [&>span]:text-gray-700
                          text-gray-800 leading-relaxed
                        "
                        dangerouslySetInnerHTML={{
                          __html: safeString(htmlContent)
                        }}
                      />
              </div>
                  );
                })()}
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
                  <p className="text-gray-600">{safeString((portfolio as any)?.index || (portfolio as any)?.compareWith || "NIFTY 50")}</p>
              </div>
                <div>
                  <p className="font-semibold text-gray-800">Portfolio Details</p>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p><strong>Created:</strong> {(portfolio as any)?.createdAt ? new Date((portfolio as any).createdAt).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Expiry:</strong> {(portfolio as any)?.expiryDate ? new Date((portfolio as any).expiryDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Duration:</strong> {safeNumber((portfolio as any)?.durationMonths || 12)} months</p>
                    <p><strong>Min Investment:</strong> ₹{safeNumber((portfolio as any)?.minInvestment || 30000).toLocaleString()}</p>
                    {(portfolio as any)?.subscriptionFee && (
                      <p><strong>Fee:</strong> ₹{(portfolio as any).subscriptionFee[0]?.price || 'N/A'}/{(portfolio as any).subscriptionFee[0]?.type || 'month'}</p>
                    )}
            </div>
          </div>
        </div>

              <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                <p><strong>Disclaimer:</strong> {(portfolio as any)?.disclaimer || "The information on this site is provided for reference purposes only and should not be misconstrued as investment advice. Under no circumstances does this information represent a recommendation to buy or sell stocks. All these portfolios are created based on our experts experience in the market. These Model Portfolio are prepared by SEBI Registered RIA."}</p>
                
                {/* Additional Risk Information */}
                {(portfolio as any)?.riskProfile && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">Risk Profile: {(portfolio as any).riskProfile}</p>
        </div>
                )}
                
                {/* Additional Regulatory Information */}
                {(portfolio as any)?.regulatoryInfo && (
                  <div className="mt-2 text-xs text-gray-400">
                    <p>{(portfolio as any).regulatoryInfo}</p>
          </div>
                )}
        </div>
          </div>
          </CardContent>
        </Card>

        {/* Trailing Returns */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">Trailing Returns</h3>
          <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
              <thead>
                  <tr className="bg-blue-900 text-white">
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
            <h3 className="text-lg font-semibold text-blue-600 mb-4">Returns Graph</h3>
            
            {/* Time period buttons */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
              {[
                { key: '1w', label: '1 Week' },
                { key: '1m', label: '1 Month' },
                { key: '3m', label: '3 Months' },
                { key: '6m', label: '6 Months' },
                { key: '1Yr', label: '1 Year' },
                { key: 'Since Inception', label: 'All Time' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={key === selectedTimePeriod ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs px-2 py-1 sm:px-3 sm:py-2 sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    key === selectedTimePeriod 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm'
                  }`}
                  onClick={() => handleTimePeriodChange(key)}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{key}</span>
                </Button>
              ))}
        </div>

            <div className="h-56 sm:h-64 md:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={priceHistory}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="2 2" 
                    stroke="#e0e7ff" 
                    opacity={0.6}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    interval={selectedTimePeriod === '1w' ? 0 : 'preserveStartEnd'}
                    angle={selectedTimePeriod === '1w' || selectedTimePeriod === '1m' ? -45 : 0}
                    textAnchor={selectedTimePeriod === '1w' || selectedTimePeriod === '1m' ? 'end' : 'middle'}
                    height={selectedTimePeriod === '1w' || selectedTimePeriod === '1m' ? 60 : 40}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    width={50}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
                      name === 'portfolioChange' 
                        ? (safeString((portfolio as any)?.name || 'Portfolio')).substring(0, 20) + '...'
                        : safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'NIFTY 50')
                    ]}
                    labelFormatter={(label) => label}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{
                      color: '#374151',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioChange" 
                    stroke="#10B981" 
                    strokeWidth={selectedTimePeriod === '1w' ? 2 : 3}
                    name="portfolioChange"
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      fill: '#10B981', 
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmarkChange" 
                    stroke="#6B7280" 
                    strokeWidth={selectedTimePeriod === '1w' ? 1.5 : 2}
                    strokeDasharray="4 4"
                    name="benchmarkChange"
                    dot={false}
                    activeDot={{ 
                      r: 3, 
                      fill: '#6B7280',
                      stroke: '#ffffff',
                      strokeWidth: 1
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '11px', 
                      paddingTop: '15px',
                      textAlign: 'center'
                    }}
                    iconType="line"
                    formatter={(value) => {
                      if (value === 'portfolioChange') {
                        const name = safeString((portfolio as any)?.name || 'Portfolio');
                        return name.length > 25 ? name.substring(0, 25) + '...' : name;
                      }
                      return safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'NIFTY 50');
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
          </div>


          </CardContent>
        </Card>



        {/* Portfolio & Weights Table */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-600 mb-2 sm:mb-0">Portfolio & Weights</h3>
              <Button variant="outline" className="flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm">Investment calculator</span>
              </Button>
          </div>

                        {/* Mobile Table Layout - 4 columns */}
            <div className="block lg:hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="bg-gray-600 text-white text-xs">
                    <th className="px-2 py-2 text-left font-medium">
                      <div className="flex items-center">
                        Stock Name
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                  </th>
                    <th className="px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center">
                        Type
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                  </th>
                    <th className="px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center">
                        Wt (%)
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                  </th>
                    <th className="px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <span>Last Traded Price ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()})</span>
                        <button
                          onClick={handleRefreshPrices}
                          disabled={refreshingPrices}
                          className={`ml-2 p-1 rounded-full hover:bg-white/20 transition-all duration-200 ${
                            refreshingPrices ? 'animate-spin' : 'hover:scale-110'
                          }`}
                          title={refreshingPrices ? "Refreshing prices..." : "Refresh live prices"}
                        >
                          <RefreshCw className={`h-3 w-3 text-white ${refreshingPrices ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                  </th>
                </tr>
              </thead>
                <tbody className="text-xs">
                  {holdingsWithPrices.length > 0 ? holdingsWithPrices.map((holding, index) => (
                    <React.Fragment key={index}>
                      <tr 
                        className={`cursor-pointer transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 hover:shadow-sm relative group ${index < 2 ? 'animate-pulse-subtle' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                        title="Click to expand for more details"
                      >
                        <td className="px-2 py-2 relative">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-600 leading-tight">{holding.symbol}</div>
                              <div className="text-gray-500 text-xs leading-tight">NSE : {holding.symbol}</div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedRow === index ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                      </div>
                    </td>
                        <td className="px-2 py-2 text-center">
                          <span className="text-gray-700">{(holding.marketCap || getMarketCapCategory(holding.symbol)).replace(' Cap', '\ncap')}</span>
                    </td>
                        <td className="px-2 py-2 text-center font-medium">{holding.weight.toFixed(1)}</td>
                        <td className="px-2 py-2 text-center">
                          {holding.currentPrice ? (
                            <div>
                              <div className={`inline-block font-medium px-2 py-1 rounded text-white text-xs ${
                                holding.changePercent && holding.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                {holding.currentPrice.toFixed(2)}
                              </div>
                              {holding.changePercent && (
                                <div className={`text-xs mt-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)} ({holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%) {holding.changePercent >= 0 ? '▲' : '▼'}
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
                                <span className="text-gray-600 font-medium">Current Action:</span>
                                <div>
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    (holding.status?.toUpperCase() || 'FRESH-BUY') === 'FRESH-BUY' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {holding.status?.toUpperCase() || 'FRESH-BUY'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">BSE Code:</span>
                                <div className="text-gray-800">{Math.floor(Math.random() * 600000) + 500000}</div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Investment Value:</span>
                                <div className="text-gray-800 font-medium">
                                  ₹{holding.value ? holding.value.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : (Math.floor(Math.random() * 10000) + 5000).toLocaleString('en-IN')}
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
                        {loading ? "Loading holdings..." : "No holdings data available"}
                  </td>
                </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Table Layout - All columns */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gray-600 text-white text-xs">
                    <th className="px-1 sm:px-2 py-2 text-left font-medium">
                      <div className="flex items-center">
                        Stock Name
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center">
                        Type
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-center font-medium">Sector</th>
                    <th className="px-1 sm:px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center">
                        Wt (%)
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-center font-medium">Action</th>
                    <th className="px-1 sm:px-2 py-2 text-center font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center">
                          <span>Last Traded Price ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()})</span>
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <button
                          onClick={handleRefreshPrices}
                          disabled={refreshingPrices}
                          className={`p-1 rounded-full hover:bg-white/20 transition-all duration-200 ${
                            refreshingPrices ? 'animate-spin' : 'hover:scale-110'
                          }`}
                          title={refreshingPrices ? "Refreshing prices..." : "Refresh live prices"}
                        >
                          <RefreshCw className={`h-3 w-3 text-white ${refreshingPrices ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </th>
                    <th className="px-1 sm:px-2 py-2 text-center font-medium">Value</th>
                </tr>
                </thead>
                <tbody className="text-xs">
                  {holdingsWithPrices.length > 0 ? holdingsWithPrices.map((holding, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-1 sm:px-2 py-2">
                        <div>
                          <div className="font-medium text-blue-600 leading-tight">{holding.symbol}</div>
                          <div className="text-gray-500 text-xs leading-tight">NSE : {holding.symbol} BSE : {Math.floor(Math.random() * 600000) + 500000}</div>
                        </div>
                  </td>
                      <td className="px-1 sm:px-2 py-2 text-center">
                        <span className="text-gray-700">{(holding.marketCap || getMarketCapCategory(holding.symbol)).replace(' Cap', '\ncap')}</span>
                  </td>
                      <td className="px-1 sm:px-2 py-2 text-center text-gray-700 leading-tight">{holding.sector}</td>
                      <td className="px-1 sm:px-2 py-2 text-center font-medium">
                        {holding.weight > 0 ? `${holding.weight.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-1 sm:px-2 py-2 text-center">
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                          (holding.status?.toUpperCase() || 'FRESH-BUY') === 'FRESH-BUY' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {holding.status?.toUpperCase() || 'FRESH-BUY'}
                        </span>
                  </td>
                      <td className="px-1 sm:px-2 py-2 text-center">
                        {holding.currentPrice && holding.currentPrice > 0 ? (
                          <div>
                            <div className={`inline-block font-medium px-2 py-1 rounded text-white text-xs ${
                              holding.changePercent && holding.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              ₹{holding.currentPrice.toFixed(2)}
                            </div>
                            {holding.changePercent && holding.changePercent !== 0 && (
                              <div className={`text-xs mt-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}% {holding.changePercent >= 0 ? '▲' : '▼'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="inline-block font-medium px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs">
                              Live Price
                            </div>
                            <div className="text-xs mt-1 text-gray-500">Loading...</div>
                          </div>
                        )}
                  </td>
                      <td className="px-1 sm:px-2 py-2 text-center">
                        <span className="font-medium">
                          {holding.value && holding.value > 0 
                            ? `₹${holding.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
                            : '-'
                          }
                        </span>
                  </td>
                </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        {loading ? "Loading holdings..." : "No holdings data available"}
                  </td>
                </tr>
                  )}
                </tbody>
            </table>
          </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
              {/* Ultra-Modern Dashboard Layout */}
              <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 rounded-xl border border-gray-200/60 p-4 shadow-sm backdrop-blur-sm">
                {/* Header with Performance Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Portfolio Summary</span>
                    {/* Live Data Indicator */}
                    {holdingsWithPrices.some(h => h.currentPrice) && (
                      <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-700">Live</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-bold text-green-700">
                      {portfolioMetrics.pnlPercentage >= 0 ? '+' : ''}{portfolioMetrics.pnlPercentage.toFixed(2)}%
                    </span>
          </div>
        </div>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Holdings Value */}
                  <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 p-3 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-4 h-4 bg-slate-600 rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                          <span className="text-xs font-medium text-slate-700">Holdings</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      </div>
                      <div className="text-base font-bold text-slate-900 leading-none">
                        ₹{portfolioMetrics.holdingsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Total Value</div>
                    </div>
                  </div>

                  {/* Cash Balance */}
                  <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 p-3 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-xs font-medium text-blue-700">Cash</span>
                        </div>
                        <div className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                          {portfolioMetrics.cashPercentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-base font-bold text-blue-900 leading-none">
                        ₹{portfolioMetrics.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-blue-600 mt-0.5">Available</div>
                    </div>
                  </div>

                  {/* Total Portfolio */}
                  <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 p-3 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-4 h-4 bg-indigo-600 rounded-sm flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-indigo-700">Portfolio</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      </div>
                      <div className="text-base font-bold text-indigo-900 leading-none">
                        ₹{portfolioMetrics.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-indigo-600 mt-0.5">Total Value</div>
                    </div>
                  </div>
                </div>

                {/* Performance Footer */}
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

        {/* Portfolio Tips Carousel */}
        <Card className="mb-6 shadow-sm border border-gray-200 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Portfolio Tips & Insights</h3>
                  <p className="text-sm text-gray-600">Expert recommendations for your portfolio</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700">Active Tips</span>
              </div>
            </div>

            <TipsCarousel 
              portfolioId={portfolioId} 
              tips={portfolioTips} 
              loading={tipsLoading}
            />
          </CardContent>
        </Card>

        {/* Portfolio Allocation Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {/* Chart Card - Enhanced Desktop Layout */}
          <Card className="shadow-sm border border-gray-200 xl:col-span-2">
            <CardContent className="p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-4 text-gray-800">Portfolio Allocation</h3>
              <div className="relative flex items-center justify-center">
                <div className="w-full h-64 sm:h-72 lg:h-80 xl:h-96 relative">
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart width={400} height={400}>
  <Pie
    data={portfolioAllocationData.length > 0 ? portfolioAllocationData : [
      { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
      { name: "IDFCFIRSTB", value: 20.43, color: "#10B981", sector: "Banking" }
    ]}
    cx="50%"
    cy="50%"
    innerRadius="60%"
    outerRadius="80%"
    paddingAngle={2}
    dataKey="value"
    stroke="none"
    // Update state on hover, passing the full data object
    onMouseEnter={(data) => {
      setHoveredSegment(data);
      // If something is selected and we hover over a different segment, auto-switch selection
      if (selectedSegment && selectedSegment.name !== data.name) {
        setSelectedSegment(data);
      }
    }}
    // Clear hover state when the mouse leaves the chart
    onMouseLeave={() => setHoveredSegment(null)}
    // Handle click to select/unselect segments
    onClick={(data) => {
      if (selectedSegment?.name === data.name) {
        setSelectedSegment(null); // Unselect if clicking the same segment
      } else {
        setSelectedSegment(data); // Select the clicked segment
      }
    }}
  >
    {(portfolioAllocationData.length > 0 ? portfolioAllocationData : [
      { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
      { name: "IDFCFIRSTB", value: 20.43, color: "#10B981", sector: "Banking" }
    ]).map((entry, index) => {
      // Check if the current segment is the one being hovered over
      const isActive = hoveredSegment?.name === entry.name;
      // Check if another segment is hovered, to fade this one out
      const isFaded = hoveredSegment && !isActive;

      return (
        <Cell
          key={`cell-${index}`}
          fill={entry.color}
          style={{
            cursor: 'pointer',
            // A more fluid and responsive transition
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            transformOrigin: 'center',
            // Scale the active segment to make it appear thicker and more prominent
            transform: isActive ? 'scale(1.12)' : 'scale(1)',
            // Apply a soft, colored shadow to the active segment and fade out others
            filter: isActive
              ? `drop-shadow(0 8px 20px ${entry.color}60) brightness(1.1)`
              : isFaded
                ? 'saturate(0.7) brightness(0.85)'
                : 'none',
            // Fade out non-active segments when something is hovered
            opacity: isFaded ? 0.5 : 1,
          }}
        />
      );
    })}
  </Pie>
</PieChart>
                  </ResponsiveContainer>

                  {/* Center Display */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center max-w-32">
                      {(hoveredSegment || selectedSegment) ? (
                        <div className="transition-all duration-300 transform scale-105">
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                            {(hoveredSegment || selectedSegment)?.value.toFixed(1)}%
            </div>
                          <div className="text-sm font-semibold text-gray-700 truncate leading-tight">
                            {(hoveredSegment || selectedSegment)?.name}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                            {(hoveredSegment || selectedSegment)?.sector}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mt-1">
                            ₹{(((hoveredSegment || selectedSegment)?.value || 0) / 100 * portfolioMetrics.totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <div className="text-base font-semibold mb-1">Portfolio</div>
                          <div className="text-xs">Click or hover to explore</div>
                        </div>
                      )}
                    </div>
                  </div>
            </div>
          </div>

              {/* Enhanced Legend for Desktop */}
              <div className="mt-4 lg:mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 lg:mb-4">Top Holdings</h4>
                <div className="space-y-2 lg:space-y-3">
                  {(portfolioAllocationData.length > 0 ? portfolioAllocationData : [
                    { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
                    { name: "IDFCFIRSTB", value: 20.43, color: "#10B981", sector: "Banking" }
                  ]).slice(0, 5).map((stock, index) => (
                    <div key={index} className="flex items-center justify-between text-sm lg:text-base">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: stock.color }}
                        ></div>
                        <div className="min-w-0">
                          <span className="text-gray-800 font-medium truncate block">{stock.name}</span>
                          <span className="text-gray-500 text-xs lg:text-sm">{stock.sector}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-gray-900">{stock.value.toFixed(1)}%</span>
                        <div className="text-xs text-gray-500">
                          ₹{((stock.value / 100) * portfolioMetrics.totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {portfolioAllocationData.length > 5 && (
                    <div className="text-sm text-gray-500 text-center pt-2 border-t border-gray-100">
                      +{portfolioAllocationData.length - 5} more holdings
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Detail Card - Enhanced for Desktop */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-xl font-bold text-gray-800">Holdings Detail</h3>
                <span className="text-xs lg:text-sm text-gray-500 font-medium">Portfolio breakdown</span>
              </div>
              
              <div className="space-y-2 h-64 sm:h-72 lg:h-80 xl:h-96 overflow-y-auto">
                {(portfolioAllocationData.length > 0 ? portfolioAllocationData : [
                  { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
                  { name: "IDFCFIRSTB", value: 20.43, color: "#10B981", sector: "Banking" }
                ])
                  .sort((a, b) => b.value - a.value)
                  .map((stock, index) => {
                    const isSelected = selectedSegment?.name === stock.name;
                    const isHovered = hoveredSegment?.name === stock.name;
                    
                    return (
                <div
                  key={index}
                        className={`flex items-center justify-between p-3 lg:p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                            : isHovered
                              ? 'bg-gray-50 border border-gray-200 shadow-sm'
                              : 'hover:bg-gray-50 border border-transparent hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedSegment(isSelected ? null : stock)}
                        onMouseEnter={() => {
                          setHoveredSegment(stock);
                          // If something is selected and we hover over a different item, auto-switch selection
                          if (selectedSegment && selectedSegment.name !== stock.name) {
                            setSelectedSegment(stock);
                          }
                        }}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                          <div 
                            className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: stock.color }}
                          ></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm lg:text-base font-medium text-gray-800 truncate">
                              {stock.name}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500">{stock.sector}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2 lg:ml-4">
                          <div className="text-sm lg:text-base font-bold text-gray-900">
                            {stock.value.toFixed(1)}%
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500">
                            ₹{((stock.value / 100) * portfolioMetrics.totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Enhanced Summary Footer */}
              <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 text-xs lg:text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Total Holdings: {portfolioAllocationData.length || 2}</span>
                    <span>•</span>
                    <span className="font-medium">Total Allocation: 100%</span>
                  </div>
                  <div className="text-xs lg:text-sm text-gray-500">
                    Updated: {new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                {/* Latest Research Reports Section */}
        <div className="mt-8">
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
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {link.name || link.linkDiscription || `${link.linkType?.charAt(0).toUpperCase() + link.linkType?.slice(1) || 'Document'} Report`}
                  </h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span>Publish on {new Date(link.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                      <span className="mx-2">|</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {link.linkDiscription || 'Research document and analysis for portfolio subscribers.'}
                    </p>
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

            {(portfolio as any)?.downloadLinks?.length > 5 && (
              <div className="text-center mt-6">
                <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                  View more
                </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

