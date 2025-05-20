"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { purchasePortfolio } from "@/lib/portfolio-service";
import type { Portfolio } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
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
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadPortfolios() {
      try {
        const data = await portfolioService.getAll();
        setPortfolios(data);
      } catch (error) {
        console.error("Failed to load portfolios:", error);
        toast({
          title: "Error",
          description: "Failed to load portfolios. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadPortfolios();
  }, [toast]);

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
          "Failed to subscribe to portfolio?. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (portfolioId: string) => {
    router.push(`/rangaone-wealth/model-portfolios/${portfolioId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#0a2463] text-white rounded-lg p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">MODEL PORTFOLIO</h1>
          <p className="text-lg">YOUR GROWTH OUR PRIORITY</p>
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
        ) : (
          <div className="grid gap-6">
            {portfolios.map((portfolio) => (
              <Card
                key={portfolio?._id}
                className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <h2 className="text-xl font-semibold">
                          {portfolio?.name}
                        </h2>
                        <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {portfolio?.PortfolioCategory}
                        </span>
                      </div>
                      <div>
                        {portfolio?.isPurchased ? (
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
                            portfolio?.monthlyYield >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {portfolio?.monthlyYield >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {portfolio?.monthlyYield?.toFixed(2)}%
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Year-to-Date
                        </div>
                        <div
                          className={`text-lg font-semibold flex items-center ${
                            portfolio?.ytdYield >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {portfolio?.ytdYield >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {portfolio?.ytdYield?.toFixed(2)}%
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
                        // disabled={!portfolio?.isPurchased}
                        onClick={() => handleViewDetails(portfolio?._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      {!portfolio?.isPurchased && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleSubscribe(portfolio?._id)}
                        >
                          Subscribe now
                        </Button>
                      )}

                      {portfolio?.isPurchased && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(portfolio?._id)}
                          >
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            PDF
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {portfolio?.isPurchased && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                          Sign up to view more details
                        </span>
                        <Button
                          variant="link"
                          className="text-blue-600 p-0 h-auto"
                        >
                          <span>Learn more</span>
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
