"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, RefreshCw, TrendingUp, Download, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { portfolioService } from "@/services/portfolio.service";
import { stockPriceService } from "@/services/stock-price.service";
import { useToast } from "@/components/ui/use-toast";
import type { Portfolio, Holding } from "@/lib/types";

interface HoldingWithCalculations extends Holding {
  currentPrice?: number;
  previousPrice?: number;
  change?: number;
  changePercent?: number;
  value?: number;
  marketCap?: string;
  calculatedQuantity?: number;
  calculatedValue?: number;
  calculatedAllocation?: number;
}

interface PortfolioWithCalculations extends Portfolio {
  calculatedHoldings: HoldingWithCalculations[];
  totalValue: number;
  cashBalance: number;
  cashPercentage: number;
}

export function InvestmentCalculator() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioWithCalculations | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(30000);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculatingInvestment, setCalculatingInvestment] = useState<boolean>(false);
  const [refreshingPrices, setRefreshingPrices] = useState<boolean>(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [subscriptionPortfolio, setSubscriptionPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    async function fetchPortfolios() {
      try {
        setLoading(true);
        const response = await portfolioService.getAll();
        if (response && Array.isArray(response)) {
          setPortfolios(response);
          
          // Check if portfolio ID is in URL params
          const portfolioId = searchParams.get('portfolio');
          if (portfolioId) {
            setSelectedPortfolioId(portfolioId);
            const portfolioFromUrl = response.find(p => p._id === portfolioId);
            if (portfolioFromUrl) {
              await selectPortfolio(portfolioFromUrl);
            } else {
              // If portfolio ID from URL not found, select first portfolio
              if (response.length > 0) {
                await selectPortfolio(response[0]);
              }
            }
          } else if (response.length > 0) {
            // If no portfolio ID in URL, select first portfolio
            await selectPortfolio(response[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch portfolios:", error);
        toast({
          title: "Error",
          description: "Failed to load portfolios. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolios();
  }, [toast, searchParams]);

  const selectPortfolio = async (portfolio: Portfolio) => {
    try {
      setLoading(true);
      
      // Fetch portfolio details with holdings
      const portfolioDetails = await portfolioService.getById(portfolio._id);
      
      if (portfolioDetails) {
        // Get the portfolio data from the response
        let portfolioData = portfolioDetails;
        if (portfolioDetails?.data) {
          portfolioData = portfolioDetails.data;
        } else if (portfolioDetails?.portfolio) {
          portfolioData = portfolioDetails.portfolio;
        }
        
        // Check if portfolio has a message property indicating subscription required
        if (portfolioData.message) {
          console.log("Subscription required for portfolio:", portfolioData.message);
          setSubscriptionPortfolio(portfolioData);
          setShowSubscriptionModal(true);
          setSelectedPortfolio(null);
          return;
        }
        
        // Validate holdings data
        const validatedHoldings = validateHoldingsData(portfolioData.holdings || [], portfolio._id);
        
        if (validatedHoldings.length > 0) {
          // Fetch stock prices for holdings
          const holdingsWithPrices = await fetchStockPrices(validatedHoldings, portfolioData);
          
          // Calculate investment based on amount
          const calculatedPortfolio = calculateInvestment(portfolioData, holdingsWithPrices, investmentAmount);
          setSelectedPortfolio(calculatedPortfolio);
        } else {
          // No holdings data means user isn't subscribed
          console.log("No holdings data found - subscription required");
          setSubscriptionPortfolio(portfolioData);
          setShowSubscriptionModal(true);
          setSelectedPortfolio(null);
        }
      }
    } catch (error) {
      console.error("Failed to select portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolio details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateHoldingsData = (holdings: any[], portfolioId: string): Holding[] => {
    if (!holdings || !Array.isArray(holdings)) {
      return [];
    }

    const validHoldings: Holding[] = holdings
      .filter((holding: any) => {
        // Validate required fields
        if (!holding.symbol || !holding.weight || !holding.sector) {
          return false;
        }
        
        // Ensure weight is a valid number
        if (isNaN(holding.weight) || holding.weight <= 0) {
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
    
    return validHoldings;
  };

  const fetchStockPrices = async (holdings: Holding[], portfolioData: Portfolio): Promise<HoldingWithCalculations[]> => {
    if (!holdings || holdings.length === 0) {
      return [];
    }
    
    // Extract symbols for bulk fetching
    const symbols = holdings.map(holding => holding.symbol).filter(Boolean);
    
    if (symbols.length === 0) {
      return holdings.map(holding => ({
        ...holding,
        value: (holding.weight / 100) * (portfolioData.minInvestment || 30000),
        marketCap: getMarketCapCategory(holding.symbol),
      }));
    }

    try {
      // Fetch prices for all symbols using the stock price service
      const priceResults = await stockPriceService.getMultipleStockPrices(symbols);
      
      // Map results back to holdings
      const updatedHoldings: HoldingWithCalculations[] = holdings.map(holding => {
        const priceResponse = priceResults.get(holding.symbol);
        
        // Calculate base allocation value with exact precision
        const exactWeight = holding.weight;
        const allocationValue = parseFloat(((exactWeight / 100) * (portfolioData.minInvestment || 30000)).toFixed(2));
        
        let currentPrice: number | undefined;
        let previousPrice: number | undefined;
        let change: number | undefined;
        let changePercent: number | undefined;

        if (priceResponse?.success && priceResponse.data) {
          currentPrice = priceResponse.data.currentPrice;
          previousPrice = priceResponse.data.previousPrice;
          change = priceResponse.data.change;
          changePercent = priceResponse.data.changePercent;
        }

        return {
          ...holding,
          currentPrice,
          previousPrice,
          change,
          changePercent,
          value: allocationValue,
          marketCap: getMarketCapCategory(holding.symbol),
        };
      });
      
      return updatedHoldings;
    } catch (error) {
      console.error("Failed to fetch stock prices:", error);
      
      // Return holdings with fallback data if bulk fetch fails
      return holdings.map(holding => ({
        ...holding,
        value: (holding.weight / 100) * (portfolioData.minInvestment || 30000),
        marketCap: getMarketCapCategory(holding.symbol),
      }));
    }
  };

  const getMarketCapCategory = (symbol: string): string => {
    // Simplified categorization
    const largeCap = ['HDFCBANK', 'RELIANCE', 'TCS', 'INFY', 'ICICIBANK', 'AXIS', 'TATAPWR'];
    const midCap = ['IDFCFIRSTB', 'KALYAN', 'NYKAA'];
    const smallCap = ['YATHARTH', 'FIVESTAR', 'EIH', 'CROMPTON', 'AVALON'];
    
    if (largeCap.some(stock => symbol.includes(stock))) return 'Large Cap';
    if (midCap.some(stock => symbol.includes(stock))) return 'Mid cap';
    if (smallCap.some(stock => symbol.includes(stock))) return 'Small cap';
    return 'Mid cap';
  };

  const calculateInvestment = (
    portfolio: Portfolio, 
    holdings: HoldingWithCalculations[], 
    amount: number
  ): PortfolioWithCalculations => {
    setCalculatingInvestment(true);
    
    try {
      // Get the minimum investment amount from the portfolio
      const minInvestment = portfolio.minInvestment || 30000;
      
      // Calculate the investment ratio (user investment / minimum investment)
      const investmentRatio = amount / minInvestment;
      console.log(`Investment ratio: ${investmentRatio} (${amount} / ${minInvestment})`);
      
      // Calculate holdings with quantities based on investment ratio
      const calculatedHoldings = holdings.map(holding => {
        // Calculate allocation based on weight and user's investment amount
        const allocation = (holding.weight / 100) * amount;
        
        let quantity = 0;
        let calculatedValue = 0;
        
        if (holding.currentPrice && holding.currentPrice > 0) {
          // If the holding has a quantity from the portfolio, scale it by the investment ratio
          if (holding.quantity && holding.quantity > 0) {
            quantity = Math.floor(holding.quantity * investmentRatio);
            // Ensure at least 1 share if the user is investing enough
            quantity = investmentRatio >= 0.5 && quantity === 0 ? 1 : quantity;
          } else {
            // Otherwise calculate based on allocation and current price
            quantity = Math.floor(allocation / holding.currentPrice);
          }
          
          // Calculate the actual value based on quantity and current price
          calculatedValue = quantity * holding.currentPrice;
        } else {
          // Fallback if no price available - scale the original value by investment ratio
          if (holding.value) {
            calculatedValue = holding.value * investmentRatio;
          } else {
            calculatedValue = allocation;
          }
        }
        
        return {
          ...holding,
          calculatedQuantity: quantity,
          calculatedValue: parseFloat(calculatedValue.toFixed(2)),
          calculatedAllocation: parseFloat(allocation.toFixed(2)),
        };
      });
      
      // Calculate total stock value
      const totalStockValue = calculatedHoldings.reduce(
        (sum, holding) => sum + (holding.calculatedValue || 0), 
        0
      );
      
      // Calculate cash balance
      const totalStockAllocation = calculatedHoldings.reduce(
        (sum, holding) => sum + holding.weight, 
        0
      );
      const cashPercentage = Math.max(0, 100 - totalStockAllocation);
      const cashBalance = parseFloat(((cashPercentage / 100) * amount).toFixed(2));
      
      // Calculate total portfolio value
      const totalValue = parseFloat((totalStockValue + cashBalance).toFixed(2));
      
      return {
        ...portfolio,
        calculatedHoldings,
        totalValue,
        cashBalance,
        cashPercentage,
      };
    } catch (error) {
      console.error("Error calculating investment:", error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate investment details.",
        variant: "destructive",
      });
      return {
        ...portfolio,
        calculatedHoldings: [],
        totalValue: amount,
        cashBalance: amount,
        cashPercentage: 100,
      };
    } finally {
      setCalculatingInvestment(false);
    }
  };

  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setInvestmentAmount(value);
    }
  };

  const handleCalculate = () => {
    if (selectedPortfolio && investmentAmount > 0) {
      const recalculated = calculateInvestment(
        selectedPortfolio,
        selectedPortfolio.calculatedHoldings,
        investmentAmount
      );
      setSelectedPortfolio(recalculated);
      
      toast({
        title: "Calculation Complete",
        description: `Investment calculated for ₹${investmentAmount.toLocaleString()}`,
        variant: "default",
      });
    }
  };

  const handleRefreshPrices = async () => {
    if (!selectedPortfolio || refreshingPrices) return;
    
    setRefreshingPrices(true);
    
    try {
      // Clear cache to force fresh data
      stockPriceService.clearCache();
      
      // Get current holdings
      const currentHoldings = selectedPortfolio.calculatedHoldings || [];
      if (currentHoldings.length === 0) {
        toast({
          title: "No Holdings",
          description: "No holdings found to refresh prices for.",
          variant: "default",
        });
        return;
      }

      // Fetch fresh prices
      const updatedHoldings = await fetchStockPrices(currentHoldings, selectedPortfolio);
      
      // Recalculate with fresh prices
      const recalculated = calculateInvestment(selectedPortfolio, updatedHoldings, investmentAmount);
      setSelectedPortfolio(recalculated);
      
      const successCount = updatedHoldings.filter(h => h.currentPrice !== undefined).length;
      
      toast({
        title: "Prices Refreshed",
        description: `Successfully updated ${successCount}/${currentHoldings.length} stock prices.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to refresh prices:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh stock prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingPrices(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Subscription Modal */}
      <Dialog open={showSubscriptionModal} onOpenChange={(open) => !open && setShowSubscriptionModal(false)}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lock className="h-5 w-5 text-blue-600" />
              Subscription Required
            </DialogTitle>
            <DialogDescription>
              {subscriptionPortfolio?.message || "You need to subscribe to this portfolio to view its holdings and use the investment calculator."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Benefits of subscribing:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Access to detailed portfolio holdings</li>
                <li>• Real-time investment calculations</li>
                <li>• Portfolio performance tracking</li>
                <li>• Expert recommendations and insights</li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => window.location.href = `/model-portfolios/${subscriptionPortfolio?._id}`}
                className="bg-blue-600 hover:bg-blue-700 text-[#FFFFF0]"
              >
                View Portfolio Details
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowSubscriptionModal(false)}
              >
                Continue browsing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Calculator Controls */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="portfolio-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Select Portfolio
              </Label>
              <select
                id="portfolio-select"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const selected = portfolios.find(p => p._id === e.target.value);
                  if (selected) {
                    setSelectedPortfolioId(selected._id);
                    selectPortfolio(selected);
                  }
                }}
                value={selectedPortfolio?._id || selectedPortfolioId || ""}
                disabled={loading || portfolios.length === 0}
              >
                {portfolios.length === 0 ? (
                  <option value="">No portfolios available</option>
                ) : (
                  portfolios.map((portfolio) => (
                    <option key={portfolio._id} value={portfolio._id}>
                      {portfolio.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="investment-amount" className="text-sm font-medium text-gray-700 mb-1 block">
                Investment Amount (₹)
              </Label>
              <Input
                id="investment-amount"
                type="number"
                min="1000"
                step="1000"
                value={investmentAmount}
                onChange={handleInvestmentAmountChange}
                className="w-full"
              />
            </div>
            
            <div className="flex-none">
              <Button 
                onClick={handleCalculate}
                disabled={calculatingInvestment || !selectedPortfolio}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Calculator className="h-4 w-4" />
                <span>Calculate</span>
              </Button>
            </div>
          </div>
          
          {selectedPortfolio && (
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
                    ₹{(selectedPortfolio.totalValue - selectedPortfolio.cashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500">Total Value</div>
                </div>

                <div className="bg-white/70 rounded-lg border border-gray-200/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-700">Cash</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      {selectedPortfolio.cashPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-base font-bold text-blue-900">
                  ₹{((investmentAmount - (selectedPortfolio.totalValue - selectedPortfolio.cashBalance)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                  </div>
                  <div className="text-xs text-blue-600">Available</div>
                </div>

                <div className="bg-white/70 rounded-lg border border-gray-200/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-indigo-700">Portfolio</span>
                  </div>
                  <div className="text-base font-bold text-indigo-900">
                    ₹{investmentAmount}
                  </div>
                  <div className="text-xs text-indigo-600">Total Value</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio & Weights Table */}
      {selectedPortfolio && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-600 mb-2 sm:mb-0">Portfolio & Weights</h3>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={handleRefreshPrices}
                disabled={refreshingPrices}
              >
                <RefreshCw className={`h-4 w-4 ${refreshingPrices ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh Prices</span>
              </Button>
            </div>

            {/* Mobile Table Layout */}
            <div className="block lg:hidden overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-600 text-[#FFFFF0] text-xs">
                    <th className="px-2 py-2 text-left font-medium">Stock Name</th>
                    <th className="px-2 py-2 text-center font-medium">Wt (%)</th>
                    <th className="px-2 py-2 text-center font-medium">Price</th>
                    <th className="px-2 py-2 text-center font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {selectedPortfolio.calculatedHoldings.map((holding, index) => (
                    <tr 
                      key={index}
                      className={`transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                    >
                      <td className="px-2 py-2">
                        <div className="font-medium text-blue-600">{holding.symbol}</div>
                        <div className="text-gray-500 text-xs">NSE : {holding.symbol}</div>
                      </td>
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
                      <td className="px-2 py-2 text-center font-medium">
                        {holding.calculatedQuantity || 0}
                      </td>
                    </tr>
                  ))}
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
                    <th className="px-2 py-2 text-center font-medium">Last Traded Price</th>
                    <th className="px-2 py-2 text-center font-medium">Quantity</th>
                    <th className="px-2 py-2 text-center font-medium">Allocation</th>
                    <th className="px-2 py-2 text-center font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {selectedPortfolio.calculatedHoldings.map((holding, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-2 py-2">
                        <div className="font-medium text-blue-600">{holding.symbol}</div>
                        <div className="text-gray-500 text-xs">NSE : {holding.symbol}</div>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-700">{holding.marketCap || 'Mid cap'}</td>
                      <td className="px-2 py-2 text-center text-gray-700">{holding.sector}</td>
                      <td className="px-2 py-2 text-center font-medium">{holding.weight.toFixed(2)}%</td>
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
                        <div className="font-medium text-blue-600">{holding.calculatedQuantity || 0}</div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="font-medium">
                          ₹{(holding.calculatedAllocation || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="font-medium">
                          ₹{(holding.calculatedValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}