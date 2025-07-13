"use client";

import { PageHeader } from "@/components/page-header";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { purchasePortfolio } from "@/lib/portfolio-service";
import type { Portfolio } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
import { subscriptionService, SubscriptionAccess } from "@/services/subscription.service";
import { useAuth } from "@/components/auth/auth-context";
import { MethodologyModal } from "@/components/methodology-modal";
import {
  ArrowUpRight,
  FileText,
  Eye,
  Lock,
  TrendingDown,
  TrendingUp,
  Unlock,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModelPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [userAccessiblePortfolios, setUserAccessiblePortfolios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(null);
  const [methodologyModal, setMethodologyModal] = useState<{
    isOpen: boolean;
    portfolioId: string;
    portfolioName: string;
  }>({
    isOpen: false,
    portfolioId: "",
    portfolioName: "",
  });
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Helper function to safely render description
  const renderDescription = (desc: any): string => {
    if (!desc) return 'No description available';
    if (typeof desc === 'string') return desc;
    if (Array.isArray(desc)) {
      // Look for "home card" key specifically
      const homeCardDesc = desc.find((item: any) => item.key === "home card");
      if (homeCardDesc && homeCardDesc.value) {
        // Strip HTML tags and return clean text
        const textContent = homeCardDesc.value.replace(/<[^>]*>/g, '');
        return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
      }
      
      // Fallback to original logic if no "home card" found
      return desc.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.value) {
          // Strip HTML tags from any value
          const textContent = String(item.value).replace(/<[^>]*>/g, '');
          return textContent;
        }
        if (item?.key) return item.key;
        return String(item);
      }).filter(Boolean).join(', ');
    }
    return String(desc);
  };

  // Helper function to safely convert values to strings
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    return String(value);
  };

  // Helper function to safely convert to number
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to check if user has access to a portfolio
  const hasPortfolioAccess = (portfolioId: string): boolean => {
    if (!subscriptionAccess) return false;
    
    // Premium users have access to all portfolios
    if (subscriptionAccess.hasPremium) return true;
    
    // Check individual portfolio access
    return Array.isArray(subscriptionAccess.portfolioAccess) && 
           subscriptionAccess.portfolioAccess.includes(portfolioId);
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
      if (authLoading) return;

      try {
        setLoading(true);
        
        // First try to get portfolios from authenticated endpoint
        if (isAuthenticated) {
          try {
            const [authPortfolios, accessData] = await Promise.all([
              portfolioService.getAll(),
              subscriptionService.getSubscriptionAccess()
            ]);
            
            if (authPortfolios && authPortfolios.length > 0) {
              setPortfolios(authPortfolios);
              setSubscriptionAccess(accessData);
              
              // Extract IDs of portfolios user has access to
              const accessibleIds = authPortfolios
                .filter(p => !p.isPurchased === false) // User has access if isPurchased is not false
                .map(p => p._id);
              setUserAccessiblePortfolios(accessibleIds);
            } else {
              // Fallback to public endpoint
              const publicPortfolios = await portfolioService.getPublic();
              setPortfolios(publicPortfolios);
              setSubscriptionAccess(accessData);
            }
          } catch (error) {
            console.error("Failed to fetch authenticated portfolios:", error);
            // Fallback to public endpoint
            const publicPortfolios = await portfolioService.getPublic();
            setPortfolios(publicPortfolios);
          }
        } else {
          // Not authenticated - use public endpoint
          const publicPortfolios = await portfolioService.getPublic();
          setPortfolios(publicPortfolios);
        }
      } catch (error: any) {
        console.error("Failed to load data:", error);
        
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
        description: "Failed to subscribe to portfolio. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (portfolioId: string) => {
    router.push(`/model-portfolios/${portfolioId}`);
  };

  const handleMethodologyClick = (portfolioId: string, portfolioName: string) => {
    setMethodologyModal({
      isOpen: true,
      portfolioId,
      portfolioName,
    });
  };

  const handleViewReports = (portfolioId: string) => {
    router.push(`/model-portfolios/${portfolioId}/reports`);
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <PageHeader 
            title="Model Portfolios" 
            subtitle="Discover our expertly crafted investment strategies" 
          />
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
        <PageHeader 
          title="Model Portfolios" 
          subtitle="Discover our expertly crafted investment strategies" 
        />
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {portfolios.map((portfolio) => {
              const hasAccess = userAccessiblePortfolios.includes(portfolio._id);
              const isLocked = !isAuthenticated || !hasAccess;
              
              return (
              <Card key={portfolio._id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {/* Mobile-responsive header section */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg sm:text-xl font-semibold leading-tight">{portfolio.name}</h3>
                          {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{renderDescription(portfolio.description)}</p>
                      </div>
                    </div>
                    
                    {/* Side by side button layout */}
                    <div className="flex flex-row gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center space-x-2 flex-1 sm:flex-none sm:w-auto"
                        onClick={() => handleMethodologyClick(portfolio._id, portfolio.name)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Methodology</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center space-x-2 flex-1 sm:flex-none sm:w-auto"
                        onClick={() => handleViewDetails(portfolio._id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">View Details</span>
                      </Button>
                    </div>
                  </div>

                  {/* Mobile-responsive metrics grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className={`p-3 sm:p-4 bg-gray-50 rounded-lg relative ${isLocked ? 'overflow-hidden' : ''}`}>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Monthly Gains</p>
                      <div className="relative">
                        <p className={`text-lg sm:text-xl font-semibold ${isLocked ? 'blur-sm text-green-600' : safeNumber(portfolio.monthlyGains) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {isLocked ? `+${Math.floor(Math.random() * 20) + 5}.${Math.floor(Math.random() * 99)}%` : `${safeString(portfolio.monthlyGains)}%`}
                        </p>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 sm:p-4 bg-gray-50 rounded-lg relative ${isLocked ? 'overflow-hidden' : ''}`}>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">1 Year Gains</p>
                      <div className="relative">
                        <p className={`text-lg sm:text-xl font-semibold ${isLocked ? 'blur-sm text-green-600' : safeNumber(portfolio.oneYearGains) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {isLocked ? `+${Math.floor(Math.random() * 15) + 2}.${Math.floor(Math.random() * 99)}%` : `${safeString(portfolio.oneYearGains)}%`}
                        </p>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 sm:p-4 bg-gray-50 rounded-lg relative ${isLocked ? 'overflow-hidden' : ''}`}>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">CAGR Since Inception</p>
                      <div className="relative">
                        <p className={`text-lg sm:text-xl font-semibold ${isLocked ? 'blur-sm text-green-600' : safeNumber(portfolio.cagr) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {isLocked ? `+${Math.floor(Math.random() * 25) + 10}.${Math.floor(Math.random() * 99)}%` : `${safeString(portfolio.cagr)}%`}
                        </p>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 sm:p-4 bg-gray-50 rounded-lg relative ${isLocked ? 'overflow-hidden' : ''}`}>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Min. Investment Stocks</p>
                      <div className="relative">
                        <p className={`text-lg sm:text-xl font-semibold ${isLocked ? 'blur-sm text-gray-900' : 'text-gray-900'}`}>
                          {isLocked ? `₹${Math.floor(Math.random() * 50000) + 10000}` : `₹${safeString(portfolio.minInvestment)}`}
                        </p>
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action section */}
                  {isLocked ? (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-900">
                          {!isAuthenticated ? "Sign in to access portfolio details" : "Subscribe to unlock full portfolio data"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => !isAuthenticated ? router.push('/login') : handleViewDetails(portfolio._id)}
                      >
                        {!isAuthenticated ? "Sign In" : "Subscribe"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                      onClick={() => handleViewReports(portfolio._id)}
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span className="text-sm">Reports</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>

      <MethodologyModal
        isOpen={methodologyModal.isOpen}
        onClose={() => setMethodologyModal({ isOpen: false, portfolioId: "", portfolioName: "" })}
        portfolioId={methodologyModal.portfolioId}
        portfolioName={methodologyModal.portfolioName}
      />
    </DashboardLayout>
  );
}