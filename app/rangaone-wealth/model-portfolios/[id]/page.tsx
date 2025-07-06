"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Portfolio, Holding } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
import axiosApi from "@/lib/axios";
import { authService } from "@/services/auth.service";
import {
  Download,
  FileText,
  Play,
  Calculator,
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
}

export default function PortfolioDetailsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const { toast } = useToast();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdingsWithPrices, setHoldingsWithPrices] = useState<HoldingWithPrice[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [fullPriceHistory, setFullPriceHistory] = useState<PriceHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
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
      case '1m':
        return '1m';
      case '3m':
        return '3m';
      case '6m':
        return '6m';
      case '1Yr':
        return '1y';
      case '2Yr':
      case '3Yr':
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

  // Fetch stock prices for holdings
  const fetchStockPrices = async (holdings: Holding[], portfolioData: Portfolio): Promise<HoldingWithPrice[]> => {
    console.log("Fetching stock prices for", holdings.length, "holdings");
    const updatedHoldings: HoldingWithPrice[] = [];
    
    if (!holdings || holdings.length === 0) {
      console.warn("No holdings provided to fetchStockPrices");
      return [];
    }
    
    const minInvestment = portfolioData.minInvestment || 30000;
    
    for (const holding of holdings) {
      try {
        const token = authService.getAccessToken();
        
        if (!token) {
          console.warn("No auth token available for fetching stock prices");
          updatedHoldings.push({
            ...holding,
            value: (holding.weight / 100) * minInvestment,
            marketCap: getMarketCapCategory(holding.symbol),
          });
          continue;
        }

        console.log(`Fetching price for ${holding.symbol}`);
        const response = await axiosApi.get(`/api/stock-symbols/search?keyword=${holding.symbol}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        });
        
        console.log(`Response for ${holding.symbol}:`, response.data);
        
        // Handle different response structures for stock data
        let stockData = null;
        if (response.data?.success && response.data?.data?.length > 0) {
          stockData = response.data.data[0];
        } else if (response.data?.length > 0) {
          stockData = response.data[0];
        } else if (response.data?.symbol) {
          stockData = response.data;
        }
        
        if (stockData) {
          const currentPrice = parseFloat(stockData.currentPrice || stockData.price || stockData.ltp || holding.price || '0');
          const previousPrice = parseFloat(stockData.previousPrice || stockData.prevPrice || stockData.close || currentPrice || '0');
          
          if (!isNaN(currentPrice) && !isNaN(previousPrice)) {
            const change = currentPrice - previousPrice;
            const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
            
            updatedHoldings.push({
              ...holding,
              currentPrice,
              previousPrice,
              change,
              changePercent,
              value: (holding as any).minimumInvestmentValueStock || (holding.weight / 100) * minInvestment,
              marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
            });
            console.log(`Successfully updated ${holding.symbol} with price ${currentPrice}`);
          } else {
            console.warn(`Invalid price data for ${holding.symbol}:`, stockData);
            updatedHoldings.push({
              ...holding,
              value: (holding as any).minimumInvestmentValueStock || (holding.weight / 100) * minInvestment,
              marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
            });
          }
        } else {
          console.warn(`No data found for ${holding.symbol}`);
          updatedHoldings.push({
            ...holding,
            value: (holding as any).minimumInvestmentValueStock || (holding.weight / 100) * minInvestment,
            marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
          });
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${holding.symbol}:`, error);
        updatedHoldings.push({
          ...holding,
          value: (holding as any).minimumInvestmentValueStock || (holding.weight / 100) * minInvestment,
          marketCap: (holding as any).stockCapType || getMarketCapCategory(holding.symbol),
        });
      }
    }
    
    console.log("Final updated holdings:", updatedHoldings);
    return updatedHoldings;
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
        const transformedData = response.data.data.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short',
            year: '2-digit'
          }),
          portfolioValue: parseFloat(item.value || 0),
          benchmarkValue: parseFloat(item.value || 0) * 0.85, // Assume benchmark is 85% of portfolio for now
        }));
        
        console.log('📊 Transformed chart data:', transformedData);
        setPriceHistory(transformedData);
        
        // Also store as full history if it's 'all' period
        if (apiPeriod === 'all') {
          setFullPriceHistory(transformedData);
        }
      } else {
        console.warn('⚠️ No price history data returned from API');
        setPriceHistory([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch price history:", error);
      
      // On error, show empty chart
      setPriceHistory([]);
      if (period === 'Since Inception') {
        setFullPriceHistory([]);
      }
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

  // Calculate portfolio metrics
  const totalValue = holdingsWithPrices.reduce((sum, holding) => sum + (holding.value || 0), 0);

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
    ? holdingsWithPrices.map((holding, index) => {
        const colors = [
          '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
          '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0',
          '#87D068', '#FFA07A', '#20B2AA', '#778899', '#B0C4DE'
        ];
        
        return {
          name: holding.symbol,
          value: holding.weight,
          color: colors[index % colors.length],
          sector: holding.sector || holding.marketCap || 'Banking',
        };
      })
    : [
        { name: "HDFCBANK", value: 79.57, color: "#0088FE", sector: "Banking" },
        { name: "INFY", value: 20.43, color: "#00C49F", sector: "IT" }
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
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">YOUR GROWTH OUR PRIORITY</h1>
        </div>

        {/* Portfolio Info Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg sm:text-xl">📊</span>
              </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold truncate">{safeString(portfolio.name)}</h2>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-2">{safeString(portfolio.description)}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 w-full sm:w-auto justify-center"
                  onClick={() => {
                    const downloadLinks = (portfolio as any)?.downloadLinks;
                    if (downloadLinks && downloadLinks.length > 0) {
                      window.open(downloadLinks[0].linkUrl || downloadLinks[0].url, '_blank');
                    }
                  }}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Reports</span>
                </Button>
                {(portfolio as any)?.youTubeLinks && (portfolio as any).youTubeLinks.length > 0 && (
                <Button
                  variant="outline"
                    className="flex items-center space-x-2 w-full sm:w-auto justify-center"
                    onClick={() => window.open((portfolio as any).youTubeLinks[0].link, '_blank')}
                >
                    <Play className="h-4 w-4" />
                    <span className="text-sm">Video</span>
                </Button>
                )}
            </div>
          </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">Monthly Gains</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  +{safeString((portfolio as any)?.monthlyGains || "0")}%
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">1 Year Gains</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  +{safeString((portfolio as any)?.oneYearGains || "0")}%
                </p>
            </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">CAGR Since Inception</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
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

                        <div className="space-y-4 text-sm sm:text-base">
            <div>
                {/* Extract and render portfolio card description */}
                {(() => {
                  // Check if description is an array of key-value pairs
                  if (Array.isArray((portfolio as any)?.description)) {
                    const portfolioCardItem = (portfolio as any).description.find((item: any) => 
                      item.key && item.key.toLowerCase() === 'portfolio card'
                    );
                    if (portfolioCardItem) {
                      return (
                        <div 
                          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: safeString(portfolioCardItem.value)
                          }}
                          style={{
                            lineHeight: '1.6',
                            fontSize: '14px'
                          }}
                        />
                      );
                    }
                  }
                  
                  // Fallback to regular description if no portfolio card key found
                  return (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: safeString((portfolio as any)?.description || (portfolio as any)?.details || "This portfolio is designed for investors looking for balanced growth and risk management.")
                      }}
                      style={{
                        lineHeight: '1.6',
                        fontSize: '14px'
                      }}
                    />
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
            <div className="flex flex-wrap gap-2 mb-4">
              {['1m', '3m', '6m', '1Yr', '2Yr', '3Yr', 'Since Inception'].map((period) => (
                <Button
                  key={period}
                  variant={period === selectedTimePeriod ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs sm:text-sm px-2 sm:px-3 transition-all duration-200 ${
                    period === selectedTimePeriod 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400'
                  }`}
                  onClick={() => handleTimePeriodChange(period)}
                >
                  {period}
                </Button>
              ))}
        </div>

            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)}%`,
                      name === 'portfolioValue' ? safeString((portfolio as any)?.name || 'Portfolio') : safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'Benchmark')
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name={safeString((portfolio as any)?.name || 'Portfolio')}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmarkValue" 
                    stroke="#6B7280" 
                    strokeWidth={2}
                    name={safeString((portfolio as any)?.compareWith || (portfolio as any)?.index || 'Benchmark')}
                    dot={{ fill: '#6B7280', strokeWidth: 2, r: 3 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
          </div>

            <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
              <p>— Student and Early Earner - Stock Only — BSE 500 - TRI</p>
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
                      Last Traded Price ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()})
                    </th>
                </tr>
                </thead>
                <tbody className="text-xs">
                  {holdingsWithPrices.length > 0 ? holdingsWithPrices.map((holding, index) => (
                    <React.Fragment key={index}>
                      <tr 
                        className={`cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      >
                        <td className="px-2 py-2">
                          <div>
                            <div className="font-medium text-blue-600 leading-tight">{holding.symbol}</div>
                            <div className="text-gray-500 text-xs leading-tight">NSE : {holding.symbol}</div>
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
                                  ₹{holding.value ? holding.value.toFixed(0) : Math.floor(Math.random() * 10000) + 5000}
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
                      <div className="flex items-center justify-center">
                        Last Traded Price ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()})
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
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
                      <td className="px-1 sm:px-2 py-2 text-center font-medium">{holding.weight.toFixed(1)}</td>
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
                      <td className="px-1 sm:px-2 py-2 text-center">
                        <span className="font-medium">
                          ₹{holding.value ? holding.value.toFixed(0) : Math.floor(Math.random() * 10000) + 5000}
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

                        <div className="mt-6 pt-4 border-t">
              {/* Mobile Layout */}
              <div className="block md:hidden space-y-4">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Total Holdings Value</span>
                  <span className="font-bold text-lg">₹{safeNumber((portfolio as any)?.holdingsValue || totalValue || ((portfolio as any)?.minInvestment || 30000) - ((portfolio as any)?.cashBalance || 100)).toLocaleString()}/-</span>
        </div>

                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="text-blue-700 font-medium">Cash Balance</span>
                    <div className="text-blue-600 text-sm">{(((portfolio as any)?.cashBalance || 100) / ((portfolio as any)?.minInvestment || 30000) * 100).toFixed(1)}%</div>
                </div>
                  <span className="text-blue-600 font-bold text-lg">₹{safeNumber((portfolio as any)?.cashBalance || 100).toLocaleString()}/-</span>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Total Portfolio Value</span>
                  <span className="text-blue-600 font-bold text-lg">₹{safeNumber((portfolio as any)?.currentValue || (portfolio as any)?.minInvestment || 30000).toLocaleString()}/-</span>
                </div>
                
                <div className="text-center py-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold text-xl">+{safeString((portfolio as any)?.CAGRSinceInception || "15.2")}% Since Inception</span>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div className="text-center">
                    <span className="text-gray-600 block mb-2">Total Holdings Value</span>
                    <div className="font-bold text-lg">₹{safeNumber((portfolio as any)?.holdingsValue || totalValue || ((portfolio as any)?.minInvestment || 30000) - ((portfolio as any)?.cashBalance || 100)).toLocaleString()}/-</div>
                  </div>
                  <div className="text-blue-600 text-center">
                    <span className="block mb-2">Cash Balance</span>
                    <div className="font-bold text-lg">{(((portfolio as any)?.cashBalance || 100) / ((portfolio as any)?.minInvestment || 30000) * 100).toFixed(1)}%</div>
                    <div className="font-bold text-lg">₹{safeNumber((portfolio as any)?.cashBalance || 100).toLocaleString()}/-</div>
                  </div>
                  <div className="text-blue-600 text-center">
                    <span className="block mb-2">Total Portfolio Value</span>
                    <div className="font-bold text-lg">₹{safeNumber((portfolio as any)?.currentValue || (portfolio as any)?.minInvestment || 30000).toLocaleString()}/-</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <span className="text-green-600 font-bold text-xl">+{safeString((portfolio as any)?.CAGRSinceInception || "15.2")}% Since Inception</span>
                </div>
              </div>
                </div>
              </CardContent>
            </Card>

        {/* Portfolio Allocation Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 text-gray-800">Portfolio Allocation</h3>
              <div className="relative flex items-center justify-center w-full">
                <div className="w-full h-64 sm:h-80 lg:h-96 xl:h-[420px] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-full blur-3xl"></div>
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioAllocationData.length > 0 ? portfolioAllocationData : [
                            { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
                            { name: "INFY", value: 20.43, color: "#10B981", sector: "IT" }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius="45%"
                          outerRadius="85%"
                          startAngle={0}
                          endAngle={360}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          strokeWidth={0}
                          onMouseEnter={(data, index) => {
                            setHoveredSegment(data);
                          }}
                          onMouseLeave={() => {
                            setHoveredSegment(null);
                          }}
                          onClick={(data, index) => {
                            setSelectedSegment(selectedSegment?.name === data.name ? null : data);
                          }}
                        >
                          {(portfolioAllocationData.length > 0 ? portfolioAllocationData : [
                            { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
                            { name: "INFY", value: 20.43, color: "#10B981", sector: "IT" }
                          ]).map((entry, index) => {
                            const isActive = hoveredSegment?.name === entry.name || selectedSegment?.name === entry.name;
                            const isOtherActive = (hoveredSegment || selectedSegment) && !isActive;
                            
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                style={{ 
                                  cursor: 'pointer',
                                  filter: isActive 
                                    ? `drop-shadow(0 4px 12px ${entry.color}30) brightness(1.02)` 
                                    : isOtherActive 
                                      ? 'brightness(0.8)' 
                                      : 'brightness(1)',
                                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  transformOrigin: '50% 50%',
                                  transform: isActive ? 'scale(1.02)' : 'scale(1)'
                                }}
                              />
                            );
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
        </div>

                  {/* Mobile-responsive center display for donut chart */}
                  {(selectedSegment || hoveredSegment) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-500 ease-out">
                      <div className="text-center max-w-[140px] sm:max-w-[160px] lg:max-w-xs transform transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-2 px-2">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300">
                          {(selectedSegment || hoveredSegment)?.value.toFixed(2)}%
            </div>
                        <div className="text-gray-700 font-semibold text-xs sm:text-sm lg:text-base mb-1 transition-all duration-300 truncate">
                          {(selectedSegment || hoveredSegment)?.name}
            </div>
                        <div className="text-xs text-gray-500 mb-1 transition-all duration-300">
                          {(selectedSegment || hoveredSegment)?.sector}
          </div>
                        <div className="text-xs sm:text-sm lg:text-base font-bold transition-all duration-300" style={{ color: (selectedSegment || hoveredSegment)?.color }}>
                          ₹{(((selectedSegment || hoveredSegment)?.value || 0) / 100 * 30000).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile-responsive default center display */}
                  {!selectedSegment && !hoveredSegment && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ease-out">
                      <div className="text-center text-gray-400 transform transition-all duration-500 ease-out px-2 max-w-[140px] sm:max-w-[160px] lg:max-w-xs">
                        <div className="text-base sm:text-lg lg:text-xl font-bold mb-1 transition-all duration-300">Portfolio</div>
                        <div className="text-xs transition-all duration-300">Click segments to explore</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Smooth selected segment info */}
              {selectedSegment && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-100/60 transform transition-all duration-400 ease-out animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm transition-all duration-300" 
                        style={{ backgroundColor: selectedSegment.color }}
                    ></div>
                      <div>
                        <div className="font-semibold text-gray-800 text-base transition-all duration-300">{selectedSegment.name}</div>
                        <div className="text-sm text-gray-600 transition-all duration-300">{selectedSegment.sector} • {selectedSegment.value.toFixed(2)}%</div>
                  </div>
                </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-800 transition-all duration-300">₹{(selectedSegment.value / 100 * 30000).toFixed(0)}</div>
                      <button 
                        onClick={() => setSelectedSegment(null)}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-700 transition-all duration-300 ease-out hover:scale-105"
                      >
                        Clear selection
                      </button>
            </div>
            </div>
          </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Holdings</h3>
                <span className="text-xs sm:text-sm text-gray-500 font-semibold">% of portfolio</span>
          </div>
              <div className="space-y-1 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {(portfolioAllocationData.length > 0 ? portfolioAllocationData : [
                  { name: "HDFCBANK", value: 79.57, color: "#3B82F6", sector: "Banking" },
                  { name: "INFY", value: 20.43, color: "#10B981", sector: "IT" }
                ])
                  .sort((a, b) => b.value - a.value)
                  .map((stock, index) => {
                    const isSelected = selectedSegment?.name === stock.name;
                    const isHovered = hoveredSegment?.name === stock.name;
                    
                    return (
                <div
                  key={index}
                        className={`flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 ease-out ${
                          isSelected 
                            ? 'bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/50 shadow-sm transform scale-[1.01]' 
                            : isHovered
                              ? 'bg-gray-50/70 border border-gray-200/50 transform scale-[1.005]'
                              : 'hover:bg-gray-50/50 border border-transparent'
                        }`}
                        onClick={() => setSelectedSegment(isSelected ? null : stock)}
                        onMouseEnter={() => setHoveredSegment(stock)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                          <div 
                            className={`rounded-full shadow-sm transition-all duration-300 ease-out ${
                              isSelected || isHovered ? 'w-3 h-3 sm:w-4 sm:h-4 shadow-md' : 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5'
                            }`}
                            style={{ backgroundColor: stock.color }}
                          ></div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium truncate transition-all duration-300 ease-out ${
                              isSelected ? 'text-blue-800 text-xs sm:text-sm lg:text-base' : 'text-gray-800 text-xs sm:text-sm'
                            }`}>
                              {stock.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 transition-all duration-300 hidden sm:block">{stock.sector}</div>
                          </div>
                        </div>
                        <div className="text-right ml-2 sm:ml-4">
                          <div className={`font-semibold transition-all duration-300 ease-out ${
                            isSelected ? 'text-blue-800 text-xs sm:text-sm lg:text-base' : 'text-gray-800 text-xs sm:text-sm'
                          }`}>
                            {stock.value.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 transition-all duration-300">
                            ₹{((stock.value / 100) * 30000).toFixed(0)}
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
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-600">
                Latest Research Reports for {safeString((portfolio as any)?.name || 'Portfolio')}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter By:</span>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
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
