"use client";

import DashboardLayout from "@/components/dashboard-layout";
import PortfolioAllocationChart from "@/components/portfolio-allocation-chart";
import PortfolioPerformanceChart from "@/components/portfolio-performance-chart";
import RecommendationSlider from "@/components/recommendation-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Portfolio, Tip } from "@/lib/types";
import { portfolioService } from "@/services/portfolio.service";
import { tipsService } from "@/services/tip.service";
import {
  ChevronRight,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PortfolioDetailsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<Tip[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await portfolioService.getById(portfolioId);
        setPortfolio(data);

        const tipData = await tipsService.getByPortfolioId(portfolioId);
        setTips(tipData);

        console.log("Portfolio Data:", data);
        console.log("Tips Data:", tipData);
      } catch (error) {
        console.error("Failed to load portfolio or tips:", error);
        toast({
          title: "Error",
          description:
            "Failed to load portfolio details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [portfolioId, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse bg-gray-200 h-16 rounded-lg mb-8"></div>
          <div className="animate-pulse bg-gray-200 h-64 rounded-lg mb-8"></div>
          <div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-8"></div>
          <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
          <p className="text-gray-600 mb-6">
            The portfolio you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Mock data for the portfolio details page
  const portfolioReturns = [
    { period: "1M", portfolio: 3.45, benchmark: 2.87 },
    { period: "3M", portfolio: 8.32, benchmark: 7.15 },
    { period: "6M", portfolio: 12.68, benchmark: 10.45 },
    { period: "1Y", portfolio: 18.75, benchmark: 15.32 },
    { period: "3Y", portfolio: 45.62, benchmark: 38.75 },
    { period: "5Y", portfolio: 87.45, benchmark: 72.18 },
    { period: "Since Inception", portfolio: 112.35, benchmark: 95.42 },
  ];

  const portfolioHoldings = [
    {
      name: "HDFC Bank",
      symbol: "HDFCBANK",
      sector: "Financial Services",
      allocation: 12.5,
      currentPrice: 1650.75,
      purchasePrice: 1520.3,
      change: 8.58,
      value: 206250,
    },
    {
      name: "Reliance Industries",
      symbol: "RELIANCE",
      sector: "Energy",
      allocation: 10.2,
      currentPrice: 2450.6,
      purchasePrice: 2100.45,
      change: 16.67,
      value: 168300,
    },
    {
      name: "Infosys",
      symbol: "INFY",
      sector: "Information Technology",
      allocation: 8.7,
      currentPrice: 1450.25,
      purchasePrice: 1350.8,
      change: 7.36,
      value: 143550,
    },
    {
      name: "TCS",
      symbol: "TCS",
      sector: "Information Technology",
      allocation: 7.5,
      currentPrice: 3450.4,
      purchasePrice: 3200.15,
      change: 7.82,
      value: 123750,
    },
    {
      name: "ICICI Bank",
      symbol: "ICICIBANK",
      sector: "Financial Services",
      allocation: 6.8,
      currentPrice: 950.3,
      purchasePrice: 880.25,
      change: 7.96,
      value: 112200,
    },
    {
      name: "Hindustan Unilever",
      symbol: "HINDUNILVR",
      sector: "Consumer Goods",
      allocation: 5.4,
      currentPrice: 2650.15,
      purchasePrice: 2500.75,
      change: 5.97,
      value: 89100,
    },
    {
      name: "Axis Bank",
      symbol: "AXISBANK",
      sector: "Financial Services",
      allocation: 4.9,
      currentPrice: 1105.2,
      purchasePrice: 980.45,
      change: 12.72,
      value: 80850,
    },
  ];

  const topHoldings = [
    { name: "HDFC Bank", value: 206250, allocation: 12.5 },
    { name: "Reliance Industries", value: 168300, allocation: 10.2 },
    { name: "Infosys", value: 143550, allocation: 8.7 },
  ];

  const creditRatings = [
    { rating: "U.S. Government", percentage: 0 },
    { rating: "AAA", percentage: 0 },
    { rating: "AA", percentage: 0 },
    { rating: "A", percentage: 15.8 },
    { rating: "BBB", percentage: 37.0 },
    { rating: "BB", percentage: 22.5 },
    { rating: "B", percentage: 7.2 },
    { rating: "CCC or Lower", percentage: 0 },
    { rating: "NR", percentage: 17.5 },
  ];

  const researchReports = [
    {
      title:
        "Live Session for Early Growth Portfolio Subscribers on 12th May 2023",
      date: "May 10, 2023",
      description:
        "Exclusive live session for subscribers to discuss market trends and portfolio adjustments.",
    },
    {
      title:
        "Growth and Early Stage - Stock Only Model Portfolio Major News & Events - February 2023",
      date: "February 28, 2023",
      description:
        "Monthly update on major news and events affecting the Growth and Early Stage portfolio.",
    },
    {
      title:
        "Growth and Early Stage - Stock Only Model Portfolio Monthly Rebalancing March 2023",
      date: "March 5, 2023",
      description:
        "Monthly rebalancing report with detailed analysis and recommendations.",
    },
    {
      title:
        "Growth and Early Stage - Stock Only Model Portfolio Major News & Events - January 2023",
      date: "January 31, 2023",
      description:
        "Monthly update on major news and events affecting the Growth and Early Stage portfolio?.",
    },
    {
      title:
        "Special Update for Growth Model Portfolio Subscribers for Market Instability and Trader View Analysis",
      date: "January 15, 2023",
      description:
        "Special update addressing market volatility and providing strategic guidance for portfolio holders.",
    },
  ];

  // Sample recommendations for the slider
  const recommendations = [
    {
      id: "1",
      type: "RECOMMENDED",
      name: "IDFC FIRST B",
      ticker: "IDFCFIRSTB",
      price: 108.2,
      returnPercentage: 5.4,
    },
    {
      id: "2",
      type: "MODEL PORTFOLIO",
      name: "AXIS BANK",
      ticker: "AXISBANK",
      price: 1108.2,
      totalValue: 110820,
      returnPercentage: 4.0,
    },
    {
      id: "3",
      type: "RECOMMENDED",
      name: "IDFC FIRST B",
      ticker: "IDFCFIRSTB",
      price: 108.2,
      returnPercentage: 5.4,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#0a2463] text-white rounded-lg p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">MODEL PORTFOLIO</h1>
          <p className="text-lg">YOUR GROWTH OUR PRIORITY</p>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center mb-2 md:mb-0">
                <h2 className="text-xl font-semibold">{portfolio?.name}</h2>
                <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {portfolio?.PortfolioCategory}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Monthly Yield</div>
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
              <div className="text-sm text-gray-500 mb-1">Year-to-Date</div>
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
              <div className="text-sm text-gray-500 mb-1">Total Investment</div>
              <div className="text-lg font-semibold">
                ₹{portfolio?.totalInvestment?.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Current Value</div>
              <div className="text-lg font-semibold">
                ₹{portfolio?.currentValue?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Slider */}
        <RecommendationSlider recommendations={recommendations} />

        {/* Portfolio Description */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-500 mb-8 p-6">
          <h3 className="text-lg font-semibold mb-4">About this portfolio</h3>

          {portfolio?.details || "No Details Available"}
        </div>

        {/* Portfolio Returns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Portfolio Returns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Portfolio
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Benchmark
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    +/-
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolioReturns.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.period}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {item.portfolio?.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.benchmark.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      +{(item.portfolio - item.benchmark).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-4">
          <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
          <div className="h-80">
            <PortfolioPerformanceChart />
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Portfolio Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Allocation
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Purchase Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Change (%)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Value (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolioHoldings.map((stock, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {stock.name}
                      <div className="text-xs text-gray-500">
                        {stock.symbol}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {stock.sector}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {stock.allocation.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ₹{stock.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ₹{stock.purchasePrice.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-medium ${
                        stock.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      ₹{stock.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-medium text-gray-800"
                  >
                    Total Equity Amount
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    100%
                  </td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    ₹
                    {portfolioHoldings
                      .reduce((sum, stock) => sum + stock.value, 0)
                      .toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-medium text-gray-800"
                  >
                    Cash
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    0.1%
                  </td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    ₹1,000
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-medium text-gray-800"
                  >
                    Total Portfolio Value
                  </td>
                  <td colSpan={4}></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    ₹
                    {(
                      portfolioHoldings.reduce(
                        (sum, stock) => sum + stock.value,
                        0
                      ) + 1000
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-3 text-sm font-medium text-green-600"
                  >
                    +{Number(portfolio?.oneYearGains)?.toFixed(2)}% Since
                    Inception
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Top Holdings and Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topHoldings.map((holding, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{holding.name}</h4>
                  <span
                    className={`text-sm font-medium ${
                      index === 0
                        ? "text-green-600"
                        : index === 1
                        ? "text-blue-600"
                        : "text-purple-600"
                    }`}
                  >
                    {holding.allocation.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Value</span>
                  <span className="font-medium">
                    ₹{holding.value.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Allocation Chart and Credit Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
            <div className="h-64">
              <PortfolioAllocationChart />
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold">49.80%</div>
              <div className="text-sm text-gray-500">Equity Investments</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4">Credit rating*</h3>
            <div className="space-y-2">
              {creditRatings.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full mr-2 ${
                        index === 0
                          ? "bg-green-500"
                          : index === 1
                          ? "bg-blue-500"
                          : index === 2
                          ? "bg-cyan-500"
                          : index === 3
                          ? "bg-teal-500"
                          : index === 4
                          ? "bg-yellow-500"
                          : index === 5
                          ? "bg-orange-500"
                          : index === 6
                          ? "bg-red-500"
                          : index === 7
                          ? "bg-pink-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-700">{item.rating}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-4">
              * Credit ratings are based on the latest available data and are
              subject to change.
            </div>
          </div>
        </div>

        {/* Research Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Latest Research Reports on Early Bird Investor Portfolio
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {researchReports.map((report, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <h4 className="font-medium text-blue-600 mb-1">
                    {report.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {report.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Published on {report.date}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-blue-600 p-0 h-auto"
                    >
                      Read More <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
