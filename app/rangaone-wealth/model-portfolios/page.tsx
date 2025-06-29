"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { purchasePortfolio } from "@/lib/portfolio-service";
import type { Portfolio } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
import { subscriptionService, SubscriptionAccess } from "@/services/subscription.service";
import { useAuth } from "@/components/auth/auth-context";
import {
  ArrowUpRight,
  Eye,
  Lock,
  TrendingDown,
  TrendingUp,
  Unlock,
  Crown,
  Star,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModelPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Helper function to check if user has access to a portfolio
  const hasPortfolioAccess = (portfolioId: string): boolean => {
    if (!subscriptionAccess) return false;
    
    // Premium users have access to all portfolios
    if (subscriptionAccess.hasPremium) return true;
    
    // Check individual portfolio access
    return subscriptionAccess.portfolioAccess.includes(portfolioId);
  };

  // Helper function to get subscription upgrade message
  const getUpgradeMessage = (portfolioId: string): string => {
    if (!subscriptionAccess) return "Sign in to access this portfolio";
    
    if (subscriptionAccess.subscriptionType === 'none') {
      return "Subscribe to access this portfolio";
    } else if (subscriptionAccess.subscriptionType === 'basic') {
      return "Upgrade to Premium to access all portfolios";
    } else {
      return "Purchase this portfolio individually";
    }
  };

  useEffect(() => {
    async function loadPortfolios() {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Note: We now show portfolios to all users (authenticated or not)
      // Locked/unlocked state will be determined by subscription status

      try {
        setLoading(true);
        
        // Fetch both portfolios and subscription access in parallel
        const [portfoliosData, accessData] = await Promise.all([
          portfolioService.getAll(), // Always fetch all portfolios
          isAuthenticated ? subscriptionService.getSubscriptionAccess() : Promise.resolve(null)
        ]);
        
        setPortfolios(portfoliosData || []);
        setSubscriptionAccess(accessData);
        
        console.log("Loaded portfolios:", portfoliosData?.length || 0);
        console.log("Subscription access:", accessData);
        
        // Show info message if no portfolios found
        if (!portfoliosData || portfoliosData.length === 0) {
          toast({
            title: "No Portfolios Available",
            description: "No portfolios are currently available. Please contact support if this is unexpected.",
            variant: "default",
          });
        }
      } catch (error: any) {
        console.error("Failed to load data:", error);
        
        // Handle specific error cases
        if (error?.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          router.push("/login");
        } else {
          toast({
            title: "Error",
            description: "Failed to load portfolios. Please try again later.",
            variant: "destructive",
          });
        }
        
        // Set empty array to prevent crashes
        setPortfolios([]);
        setSubscriptionAccess(null);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolios();
  }, [toast, router, isAuthenticated, authLoading]);

  const handleSubscribe = async (portfolioId: string) => {
    try {
      const result = await purchasePortfolio(portfolioId);
      if (result.success) {
        // Update the local state to reflect the purchase
        setPortfolios(
          portfolios.map((portfolio) =>
            portfolio?._id === portfolioId
              ? { ...portfolio, isPurchased: true }
              : portfolio
          )
        );
        toast({
          title: "Success",
          description: "Portfolio subscription successful!",
        });
      }
    } catch (error) {
      console.error("Failed to subscribe to portfolio:", error);
      toast({
        title: "Error",
        description:
          "Failed to subscribe to portfolio. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (portfolioId: string) => {
    router.push(`/rangaone-wealth/model-portfolios/${portfolioId}`);
  };

  const handleRefreshSubscription = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to refresh subscription data.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Manually refreshing both subscription and portfolio data...");
      
      // Force refresh both subscription and portfolio data
      const [newAccessData, newPortfolios] = await Promise.all([
        subscriptionService.forceRefresh(),
        portfolioService.getAll()
      ]);
      
      setSubscriptionAccess(newAccessData);
      setPortfolios(newPortfolios);
      
      console.log("Subscription data refreshed:", newAccessData);
      console.log("Portfolios refreshed:", newPortfolios.length);
      
      toast({
        title: "Access Refreshed",
        description: `Subscription: ${newAccessData?.subscriptionType || 'none'}, Portfolios: ${newPortfolios.length} loaded`,
      });
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0a2463] text-white rounded-lg p-6 mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">MODEL PORTFOLIO</h1>
            <p className="text-lg">YOUR GROWTH OUR PRIORITY</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#0a2463] text-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold mb-2">MODEL PORTFOLIO</h1>
              <p className="text-lg">YOUR GROWTH OUR PRIORITY</p>
              {isAuthenticated && subscriptionAccess && (
                <div className="mt-2 text-sm opacity-80">
                  {subscriptionAccess.hasPremium ? (
                    <span className="flex items-center justify-center">
                      <Crown className="h-4 w-4 mr-1 text-yellow-300" />
                      Premium Access Active
                    </span>
                  ) : subscriptionAccess.hasBasic ? (
                    <span>Basic Plan Active</span>
                  ) : subscriptionAccess.portfolioAccess.length > 0 ? (
                    <span>Individual Portfolio Access ({subscriptionAccess.portfolioAccess.length})</span>
                  ) : (
                    <span>No Active Subscription</span>
                  )}
                </div>
              )}
            </div>
            {isAuthenticated && (
              <div className="flex space-x-2">
                <Button
                  onClick={handleRefreshSubscription}
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-[#0a2463]"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Access
                </Button>
                
                {/* Emergency Fix Button - if user paid for premium but doesn't have access */}
                {subscriptionAccess && subscriptionAccess.subscriptionType !== 'premium' && (
                  <Button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        console.log("Emergency premium grant initiated...");
                        
                        const emergencyAccess = await subscriptionService.emergencyGrantPremium();
                        setSubscriptionAccess(emergencyAccess);
                        
                        toast({
                          title: emergencyAccess.hasPremium ? "Premium Access Granted!" : "Grant Failed",
                          description: emergencyAccess.hasPremium 
                            ? "You now have premium access to all portfolios. This is a temporary fix."
                            : "Could not grant premium access. No active subscriptions found.",
                          variant: emergencyAccess.hasPremium ? "default" : "destructive"
                        });
                      } catch (error) {
                        console.error("Emergency grant failed:", error);
                        toast({
                          title: "Error",
                          description: "Failed to grant premium access. Check console for details.",
                          variant: "destructive"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-yellow-300 border-yellow-300 hover:bg-yellow-300 hover:text-[#0a2463]"
                    disabled={loading}
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Fix Premium
                  </Button>
                )}

                {/* Emergency Portfolio Fix - if portfolios aren't loading due to 403 */}
                {portfolios.length === 0 && isAuthenticated && (
                  <Button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        console.log("Emergency portfolio reload initiated...");
                        
                        // Debug the portfolio API first
                        await portfolioService.debugPortfolioAccess();
                        
                        // Force reload portfolios
                        const newPortfolios = await portfolioService.getAll();
                        setPortfolios(newPortfolios);
                        
                        toast({
                          title: newPortfolios.length > 0 ? "Portfolios Loaded!" : "Load Failed",
                          description: newPortfolios.length > 0 
                            ? `Successfully loaded ${newPortfolios.length} portfolios.`
                            : "Could not load portfolios. Check console for API debug info.",
                          variant: newPortfolios.length > 0 ? "default" : "destructive"
                        });
                      } catch (error) {
                        console.error("Emergency portfolio reload failed:", error);
                        toast({
                          title: "Error",
                          description: "Failed to reload portfolios. Check console for details.",
                          variant: "destructive"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-300 border-red-300 hover:bg-red-300 hover:text-[#0a2463]"
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Fix Portfolios
                  </Button>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Button
                      onClick={async () => {
                        console.log("=== COMPREHENSIVE DIAGNOSIS ===");
                        console.log("Current subscription access:", subscriptionAccess);
                        console.log("Current portfolios:", portfolios);
                        
                        // Debug both subscription and portfolio APIs
                        await subscriptionService.diagnoseSubscriptionIssue();
                        await portfolioService.debugPortfolioAccess();
                        await subscriptionService.debugSubscriptions();
                        
                        // Force refresh both
                        console.log("Force refreshing subscription...");
                        const freshAccess = await subscriptionService.forceRefresh();
                        console.log("Fresh subscription access:", freshAccess);
                        
                        console.log("Force refreshing portfolios...");
                        const freshPortfolios = await portfolioService.getAll();
                        console.log("Fresh portfolios:", freshPortfolios);
                        
                        setSubscriptionAccess(freshAccess);
                        setPortfolios(freshPortfolios);
                        
                        toast({
                          title: "Full Diagnosis Complete",
                          description: `Subscription: ${freshAccess?.subscriptionType || 'none'}, Portfolios: ${freshPortfolios.length}. Check console for details.`,
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white hover:text-[#0a2463]"
                    >
                      Full Diagnosis
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-blue-600 mb-4">
                <Lock className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Portfolios Available
              </h3>
              <p className="text-gray-600 mb-4">
                {isAuthenticated 
                  ? "You may need a subscription to view available portfolios."
                  : "Please log in to view available investment portfolios."
                }
              </p>
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <Button 
                    onClick={() => router.push("/login")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button 
                      onClick={() => router.push("/basic-subscription")}
                      variant="outline"
                    >
                      Basic Plan - ₹300/month
                    </Button>
                    <Button 
                      onClick={() => router.push("/premium-subscription")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Premium Plan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {portfolios.map((portfolio) => {
              const hasAccess = hasPortfolioAccess(portfolio?._id);
              const upgradeMessage = getUpgradeMessage(portfolio?._id);
              
              return (
                <Card
                  key={portfolio?._id}
                  className={`overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 ${
                    !hasAccess ? 'relative' : ''
                  }`}
                >
                  {/* Lock overlay for inaccessible portfolios */}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-gray-100 rounded-full">
                            <Lock className="h-8 w-8 text-gray-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Portfolio Locked
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          {upgradeMessage}
                        </p>
                        <div className="space-y-2">
                          {subscriptionAccess?.subscriptionType === 'basic' ? (
                            <Button 
                              onClick={() => router.push("/premium-subscription")}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Upgrade to Premium
                            </Button>
                          ) : subscriptionAccess?.subscriptionType === 'none' ? (
                            <div className="space-x-2">
                              <Button 
                                onClick={() => router.push("/basic-subscription")}
                                variant="outline"
                                size="sm"
                              >
                                Basic - ₹300/month
                              </Button>
                              <Button 
                                onClick={() => router.push("/premium-subscription")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                <Crown className="h-4 w-4 mr-1" />
                                Premium
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleSubscribe(portfolio?._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Purchase Portfolio
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className={`p-0 ${!hasAccess ? 'filter blur-sm' : ''}`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <h2 className="text-xl font-semibold">
                            {portfolio?.name}
                          </h2>
                          <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {portfolio?.PortfolioCategory}
                          </span>
                          {subscriptionAccess?.hasPremium && (
                            <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                          )}
                        </div>
                        <div>
                          {hasAccess ? (
                            <div className="flex items-center text-green-600">
                              <Unlock className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">
                                Unlocked
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Lock className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">Locked</span>
                            </div>
                          )}
                        </div>
                      </div>

                    <p className="text-gray-600 mb-4 text-sm">
                      {portfolio?.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Monthly Yield
                        </div>
                        <div
                          className={`text-lg font-semibold flex items-center ${
                            Number(portfolio?.monthlyGains) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Number(portfolio?.monthlyGains) >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {Number(portfolio?.monthlyGains)?.toFixed(2)}%
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Year-to-Date
                        </div>
                        <div
                          className={`text-lg font-semibold flex items-center ${
                            Number(portfolio?.oneYearGains) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Number(portfolio?.oneYearGains) >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {Number(portfolio?.oneYearGains)?.toFixed(2)}%
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Total Investment
                        </div>
                        <div className="text-lg font-semibold">
                          ₹{portfolio?.totalInvestment?.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Current Value
                        </div>
                        <div className="text-lg font-semibold">
                          ₹{portfolio?.currentValue?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-gray-600"
                        disabled={!hasAccess}
                        onClick={() => hasAccess ? handleViewDetails(portfolio?._id) : undefined}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      {hasAccess && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(portfolio?._id)}
                          >
                            Full Details
                          </Button>
                          <Button variant="outline" size="sm">
                            PDF Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {hasAccess && subscriptionAccess?.hasPremium && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <Crown className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm text-purple-700 mr-2">
                          Premium Access - Full portfolio insights available
                        </span>
                        <Button
                          variant="link"
                          className="text-purple-600 p-0 h-auto"
                          onClick={() => handleViewDetails(portfolio?._id)}
                        >
                          <span>Explore Now</span>
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
