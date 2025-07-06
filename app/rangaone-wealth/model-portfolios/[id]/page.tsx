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
import { useEffect, useState } from "react";
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
import { TestPortfolio } from './test-portfolio';

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
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<PortfolioAllocationItem | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<PortfolioAllocationItem | null>(null);

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
        
        if (response.data.success && response.data.data.length > 0) {
          const stockData = response.data.data[0];
          const currentPrice = parseFloat(stockData.currentPrice);
          const previousPrice = parseFloat(stockData.previousPrice);
          
          if (!isNaN(currentPrice) && !isNaN(previousPrice)) {
            const change = currentPrice - previousPrice;
            const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
            
            updatedHoldings.push({
              ...holding,
              currentPrice,
              previousPrice,
              change,
              changePercent,
              value: (holding.weight / 100) * minInvestment,
              marketCap: getMarketCapCategory(holding.symbol),
            });
            console.log(`Successfully updated ${holding.symbol} with price ${currentPrice}`);
          } else {
            console.warn(`Invalid price data for ${holding.symbol}:`, stockData);
            updatedHoldings.push({
              ...holding,
              value: (holding.weight / 100) * minInvestment,
              marketCap: getMarketCapCategory(holding.symbol),
            });
          }
        } else {
          console.warn(`No data found for ${holding.symbol}`);
          updatedHoldings.push({
            ...holding,
            value: (holding.weight / 100) * minInvestment,
            marketCap: getMarketCapCategory(holding.symbol),
          });
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${holding.symbol}:`, error);
        updatedHoldings.push({
          ...holding,
          value: (holding.weight / 100) * minInvestment,
          marketCap: getMarketCapCategory(holding.symbol),
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
  const fetchPriceHistory = async (portfolioId: string) => {
    try {
      const token = authService.getAccessToken();
      const response = await axiosApi.get(`/api/portfolios/${portfolioId}/price-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Transform the API data to match our chart format
        const transformedData = response.data.map((item: any) => ({
          date: item.date || item.period || item.timestamp,
          portfolioValue: parseFloat(item.portfolioReturn || item.return || item.value || 0),
          benchmarkValue: parseFloat(item.benchmarkReturn || item.benchmark || item.benchmarkValue || 0),
        }));
        setPriceHistory(transformedData);
      } else {
        // If API doesn't return data, use mock data similar to the image
        const mockData = [
          { date: '15-Mar', portfolioValue: 0, benchmarkValue: 0 },
          { date: '16-Mar', portfolioValue: 0.5, benchmarkValue: 0.3 },
          { date: '17-Mar', portfolioValue: 2.5, benchmarkValue: 1.8 },
          { date: '18-Mar', portfolioValue: 5.2, benchmarkValue: 3.5 },
          { date: '19-Mar', portfolioValue: 6.8, benchmarkValue: 4.2 },
          { date: '21-Mar', portfolioValue: 8.5, benchmarkValue: 5.8 },
          { date: '22-Mar', portfolioValue: 9.2, benchmarkValue: 6.1 },
          { date: '23-Mar', portfolioValue: 9.8, benchmarkValue: 6.8 },
          { date: '28-Mar', portfolioValue: 7.02, benchmarkValue: 5.66 },
          { date: '29-Mar', portfolioValue: 7.5, benchmarkValue: 5.8 },
          { date: '30-Mar', portfolioValue: 8.9, benchmarkValue: 4.8 },
          { date: '31-Mar', portfolioValue: 7.3, benchmarkValue: 4.2 },
          { date: '01-Apr', portfolioValue: 9.1, benchmarkValue: 5.1 },
        ];
        setPriceHistory(mockData);
      }
    } catch (error) {
      console.error("Failed to fetch price history:", error);
      // Fallback to mock data if API fails
      const mockData = [
        { date: '15-Mar', portfolioValue: 0, benchmarkValue: 0 },
        { date: '16-Mar', portfolioValue: 0.5, benchmarkValue: 0.3 },
        { date: '17-Mar', portfolioValue: 2.5, benchmarkValue: 1.8 },
        { date: '18-Mar', portfolioValue: 5.2, benchmarkValue: 3.5 },
        { date: '19-Mar', portfolioValue: 6.8, benchmarkValue: 4.2 },
        { date: '21-Mar', portfolioValue: 8.5, benchmarkValue: 5.8 },
        { date: '22-Mar', portfolioValue: 9.2, benchmarkValue: 6.1 },
        { date: '23-Mar', portfolioValue: 9.8, benchmarkValue: 6.8 },
        { date: '28-Mar', portfolioValue: 7.02, benchmarkValue: 5.66 },
        { date: '29-Mar', portfolioValue: 7.5, benchmarkValue: 5.8 },
        { date: '30-Mar', portfolioValue: 8.9, benchmarkValue: 4.8 },
        { date: '31-Mar', portfolioValue: 7.3, benchmarkValue: 4.2 },
        { date: '01-Apr', portfolioValue: 9.1, benchmarkValue: 5.1 },
      ];
      setPriceHistory(mockData);
    }
  };

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        setLoading(true);
        console.log("Loading portfolio data for ID:", portfolioId);
        
        // Fetch portfolio details
        const portfolioData = await portfolioService.getById(portfolioId);
        console.log("Portfolio data received:", portfolioData);
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
          
          // Create fallback holdings if none exist
          const fallbackHoldings: Holding[] = [
            { symbol: "HDFCBANK", weight: 79.57, sector: "Banking", status: "HOLD", price: 1650 },
            { symbol: "INFY", weight: 20.43, sector: "IT", status: "HOLD", price: 1450 }
          ];
          
          console.log("Using fallback holdings:", fallbackHoldings);
          const fallbackWithPrices = await fetchStockPrices(fallbackHoldings, portfolioData);
          setHoldingsWithPrices(fallbackWithPrices);
        }
        
        // Fetch price history
        await fetchPriceHistory(portfolioId);
        
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

  // Trailing Returns data - this should come from API in real implementation
  const trailingReturns = [
    { period: "1 day", value: safeString((portfolio as any).dailyReturn || "0") },
    { period: "1 Week", value: safeString((portfolio as any).weeklyReturn || "0") },
    { period: "1 Month", value: safeString(portfolio.monthlyGains || "0") },
    { period: "3 Months", value: safeString((portfolio as any).quarterlyReturn || "0") },
    { period: "6 Months", value: safeString((portfolio as any).halfYearlyReturn || "0") },
    { period: "1 year", value: safeString(portfolio.oneYearGains || "0") },
    { period: "3 Years", value: safeString((portfolio as any).threeYearReturn || "0") },
    { period: "5 Years", value: safeString((portfolio as any).fiveYearReturn || "—") },
    { period: "Since Inception", value: safeString(portfolio.cagr || "0") },
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
        {/* Test Component - Remove this after debugging */}
        <TestPortfolio portfolioId={portfolioId} />
        
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
                  <h2 className="text-lg sm:text-xl font-bold truncate">{portfolio.name}</h2>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-2">{safeString(portfolio.description)}</p>
                </div>
              </div>
              <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                <FileText className="h-4 w-4" />
                <Play className="h-4 w-4" />
                <span className="text-sm">Methodology</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">Monthly Gains</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">+{safeString(portfolio.monthlyGains)}%</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">1 Year Gains</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">+{safeString(portfolio.oneYearGains)}%</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">CAGR Since Inception</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">+{safeString(portfolio.cagr)}%</p>
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
                <p className="font-semibold mb-2">Who should refer to this portfolio?</p>
                <p className="text-gray-700 leading-relaxed">
                  This Student and Early Earner Model portfolio is a small denomination model portfolio using which an investor can start building his/her stock portfolio at an early age. The investible amount for this portfolio is between 10000 to 15000 per month.
                </p>
            </div>

            <div>
                <p className="text-gray-700 leading-relaxed">
                  Students get small amounts in the form of pocket money or through part-time income. Also, individuals who are just starting their careers usually have high expenses and low saving rates. Such students and early earners can take up position with their investments as typically the responsibilities are low, and the investment horizon is very high. This model portfolio gives such students and early-earners the opportunity to participate in capital markets and benefit from the edge that they have on their side, i.e., TIME for long-term capital growth.
                </p>
            </div>

            <div>
                <p className="text-gray-700 leading-relaxed">
                  The expected average rate of return from this portfolio is 15-18% over time. In its best year, it might gain 25-30% and in its worst year, it could decline by 20-25%.
                </p>
            </div>

            <div>
                <p className="text-gray-700 font-semibold">These are a typical investor profiles who can refer to this portfolio -</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-700 pl-2">
                  <li>A student with high-risk appetite; typically, 18 to 25-year-old with low savings and low liabilities</li>
                  <li>A young professional who just started working & interested in creating a new stock portfolio</li>
                  <li>A homemaker who wants to utilize a portion of the monthly savings to take first exposure to stock markets for meeting a long-term goal</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="font-semibold text-gray-800">Time Horizon</p>
                  <p className="text-gray-600">Min. 10 years</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Rebalancing</p>
                  <p className="text-gray-600">Quarterly</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Index</p>
                  <p className="text-gray-600">BSE 500 Index</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Important Dates</p>
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Inception Date - August 25th, 2021</p>
                    <p>Launch Date - August 25th, 2021</p>
                    <p>Market Cap Category - Multi Cap</p>
                    <p>Last Market Driven Rebalancing - Oct 28, 2024</p>
                    <p>Last Quarterly Rebalancing Mar 1, 2025</p>
                    <p>Next Quarterly Rebalancing on - June 7, 2025</p>
            </div>
          </div>
        </div>

              <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                <p><strong>Disclaimer:</strong> The information on this site is provided for reference purposes only purposes only and should not be misconstrued as investment advice. Under no circumstances does this information represent a recommendation to buy or sell stocks. All these portfolios are created based on our experts experience in the market. These Model Portfolio are prepared by SEBI Registered RIA.</p>
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
                  variant={period === '1m' ? 'default' : 'outline'}
                  size="sm"
                  className="text-blue-600 text-xs sm:text-sm px-2 sm:px-3"
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
                      name === 'portfolioValue' ? 'Student and Early Earner - Stock Only' : 'BSE 500 - TRI'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Student and Early Earner - Stock Only"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmarkValue" 
                    stroke="#6B7280" 
                    strokeWidth={2}
                    name="BSE 500 - TRI"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-lg font-semibold">Portfolio & Weights</h3>
              <Button variant="outline" className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                <Calculator className="h-4 w-4" />
                <span className="text-sm">Investment calculator</span>
              </Button>
        </div>

          <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm">Stock name</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm">Type</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm">Sector</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Weightage</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">Current Action</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm whitespace-nowrap">LTP(as of 17/06/2025 03:30 pm)</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm whitespace-nowrap">Value As Per Minimum Investment</th>
                </tr>
              </thead>
              <tbody>
                  {holdingsWithPrices.map((holding, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-2 sm:px-4 py-3">
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{holding.symbol}</p>
                          <p className="text-xs text-gray-500">NSE: {holding.symbol}</p>
                      </div>
                    </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{holding.marketCap}</td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{holding.sector}</td>
                      <td className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">{holding.weight.toFixed(1)}</td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <span className="bg-gray-400 text-white px-2 py-1 rounded text-xs">HOLD</span>
                    </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <div>
                          <p className="text-xs sm:text-sm">{holding.currentPrice?.toFixed(2) || holding.price.toFixed(2)}</p>
                          {holding.changePercent !== undefined && (
                            <p className={`text-xs ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)} ({holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%) ▲
                            </p>
                          )}
                        </div>
                    </td>
                      <td className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">
                        {holding.value?.toFixed(2) || holding.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-t">
                <span className="font-semibold">Total Equity Amount</span>
                <span className="font-semibold">29900/-</span>
        </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-blue-600 font-semibold">Cash</span>
                <div className="text-right">
                  <span className="text-blue-600 font-semibold">0.1 %</span>
                  <div className="text-blue-600 font-semibold">100/-</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-blue-600 font-semibold">Total Portfolio Value</span>
                <span className="text-blue-600 font-semibold">30000/-</span>
              </div>
              <div className="text-center py-2 border-t">
                <span className="text-green-600 font-bold text-base sm:text-lg">+1.94% Since Inception</span>
              </div>
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
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-3 text-left font-medium text-sm">Stock name</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Type</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Sector</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Weightage</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Current Action</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">LTP(as of {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })})</th>
                    <th className="px-4 py-3 text-center font-medium text-sm">Value As Per Minimum Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsWithPrices.length > 0 ? holdingsWithPrices.map((holding, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{holding.symbol}</td>
                      <td className="px-4 py-3 text-center text-sm">{holding.marketCap || 'Large Cap'}</td>
                      <td className="px-4 py-3 text-center text-sm">{holding.sector}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium">{holding.weight.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">HOLD</td>
                      <td className="px-4 py-3 text-center text-sm">
                        {holding.currentPrice ? (
                          <div>
                            <div className="font-medium">₹{holding.currentPrice.toFixed(2)}</div>
                            {holding.changePercent && (
                              <div className={`text-xs ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Loading...</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {holding.value ? `₹${holding.value.toFixed(0)}` : 'Calculating...'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Equity Amount</span>
                  <div className="font-bold text-right">₹{(portfolio?.minInvestment || 30000) - 100}/-</div>
                </div>
                <div className="text-blue-600">
                  <span>Cash</span>
                  <div className="font-bold text-right">0.1%</div>
                  <div className="font-bold text-right">₹100/-</div>
                </div>
                <div className="text-blue-600">
                  <span>Total Portfolio Value</span>
                  <div className="font-bold text-right">₹{portfolio?.minInvestment || 30000}/-</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-green-600 font-bold text-lg">+{safeString(portfolio?.cagr || "1.94")}% Since Inception</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Allocation Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 text-gray-800">Portfolio Allocation</h3>
              <div className="relative flex items-center justify-center w-full">
                <div className="w-full h-96 lg:h-[420px] relative">
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
                          innerRadius="50%"
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

                  {/* Smooth center display for donut chart */}
                  {(selectedSegment || hoveredSegment) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-500 ease-out">
                      <div className="text-center max-w-xs transform transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-4xl font-bold text-gray-900 mb-1 transition-all duration-300">
                          {(selectedSegment || hoveredSegment)?.value.toFixed(2)}%
                        </div>
                        <div className="text-gray-700 font-semibold text-lg mb-1 transition-all duration-300">
                          {(selectedSegment || hoveredSegment)?.name}
                        </div>
                        <div className="text-sm text-gray-500 mb-2 transition-all duration-300">
                          {(selectedSegment || hoveredSegment)?.sector}
                        </div>
                        <div className="text-xl font-bold transition-all duration-300" style={{ color: (selectedSegment || hoveredSegment)?.color }}>
                          ₹{(((selectedSegment || hoveredSegment)?.value || 0) / 100 * 30000).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smooth default center display */}
                  {!selectedSegment && !hoveredSegment && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ease-out">
                      <div className="text-center text-gray-400 transform transition-all duration-500 ease-out">
                        <div className="text-2xl font-bold mb-1 transition-all duration-300">Portfolio</div>
                        <div className="text-sm transition-all duration-300">Click segments to explore</div>
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
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-800">Holdings</h3>
                <span className="text-sm text-gray-500 font-semibold">% of portfolio</span>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ease-out ${
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
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div 
                            className={`rounded-full shadow-sm transition-all duration-300 ease-out ${
                              isSelected || isHovered ? 'w-4 h-4 shadow-md' : 'w-3.5 h-3.5'
                            }`}
                            style={{ backgroundColor: stock.color }}
                          ></div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium truncate transition-all duration-300 ease-out ${
                              isSelected ? 'text-blue-800 text-base' : 'text-gray-800 text-sm'
                            }`}>
                              {stock.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 transition-all duration-300">{stock.sector}</div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`font-semibold transition-all duration-300 ease-out ${
                            isSelected ? 'text-blue-800 text-base' : 'text-gray-800 text-sm'
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
      </div>
    </DashboardLayout>
  );
}
