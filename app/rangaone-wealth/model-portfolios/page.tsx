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

  // Helper function to safely render description
  const renderDescription = (desc: any): string => {
    if (!desc) return 'No description available';
    if (typeof desc === 'string') return desc;
    if (Array.isArray(desc)) {
      return desc.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.value) return item.value;
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
        const [portfoliosData, accessData] = await Promise.all([
          portfolioService.getAll(),
          isAuthenticated ? subscriptionService.getSubscriptionAccess() : Promise.resolve(null)
        ]);
        
        const safePortfolios = Array.isArray(portfoliosData) ? portfoliosData : [];
        setPortfolios(safePortfolios);
        setSubscriptionAccess(accessData);
        
        if (safePortfolios.length === 0) {
          toast({
            title: "No Portfolios Available",
            description: "No portfolios are currently available. Please contact support if this is unexpected.",
            variant: "default",
          });
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
    router.push(`/rangaone-wealth/model-portfolios/${portfolioId}`);
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1e1b4b] text-white rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">Model Portfolios</h1>
            <p className="text-lg opacity-90">Discover our expertly crafted investment strategies</p>
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
        <div className="bg-[#1e1b4b] text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Model Portfolios</h1>
          <p className="text-lg opacity-90">Discover our expertly crafted investment strategies</p>
        </div>

        {/* Rest of the content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <Card key={portfolio._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{portfolio.name}</h3>
                      <p className="text-sm text-gray-600">{renderDescription(portfolio.description)}</p>
                  </div>
                    {hasPortfolioAccess(portfolio._id) ? (
                      <Unlock className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">CAGR</span>
                      <div className="flex items-center gap-1">
                        {safeNumber(portfolio.cagr) >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={safeNumber(portfolio.cagr) >= 0 ? "text-green-600" : "text-red-600"}>
                          {safeString(portfolio.cagr)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Returns</span>
                      <div className="flex items-center gap-1">
                        {safeNumber(portfolio.returns) >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={safeNumber(portfolio.returns) >= 0 ? "text-green-600" : "text-red-600"}>
                          {safeString(portfolio.returns)}%
                        </span>
                      </div>
                      </div>
                    </div>

                  <div className="flex flex-col gap-2">
                    {hasPortfolioAccess(portfolio._id) ? (
                          <Button
                        className="w-full bg-[#1e1b4b] hover:bg-[#2d2a5a]"
                            onClick={() => handleViewDetails(portfolio._id)}
                          >
                        View Details
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleSubscribe(portfolio._id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {getUpgradeMessage(portfolio._id)}
                          </Button>
                    )}
                  </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}