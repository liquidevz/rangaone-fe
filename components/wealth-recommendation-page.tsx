"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Tip } from "@/services/tip.service";
import { motion } from "framer-motion";
import { ArrowUpRight, Info, TrendingUp } from "lucide-react";
import Link from "next/link";

interface WealthRecommendationPageProps {
  stockData?: Tip;
}

export default function WealthRecommendationPage({
  stockData,
}: WealthRecommendationPageProps) {
  // Capitalize the stock name for display
  const displayName = stockData?.title?.replace(/-/g, " ").toUpperCase();

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="inline-block bg-indigo-950 text-white px-8 py-4 rounded-lg shadow-lg mb-2">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              RANGAONE WEALTH
            </h1>
          </div>
          <div className="flex justify-center">
            <div className="bg-white px-6 py-1.5 rounded-full shadow-sm -mt-2 border border-gray-100">
              <h2 className="text-sm md:text-base font-medium text-gray-700 tracking-wider">
                EXPERT RECOMMENDATIONS
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Premium Stock Card with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 border-2 border-amber-300 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                    Premium
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1"
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Premium stock recommendation with high confidence</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-white text-gray-600 mr-2"
                  >
                    <span className="mr-1">Updated 2 hours ago</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {displayName}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500 mr-2">Horizon:</span>
                    <span className="text-sm font-medium">
                      {stockData?.horizon}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <Badge variant="outline" className="mr-2 bg-gray-50">
                      Banking
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50">
                      Large Cap
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹ 1108.20</div>
                  <div className="text-sm text-green-600 flex items-center justify-end">
                    <TrendingUp className="h-3 w-3 mr-1" /> 0.40%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Volume: 2.4M</div>
                </div>
                <div className="bg-green-100 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xs text-green-700">Target</div>
                  <div className="text-2xl font-bold text-green-700">39%</div>
                  <div className="text-xs text-green-700">upside</div>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    Analyst Confidence
                  </span>
                  <span className="text-sm font-medium">High</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendation Details with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8 border border-gray-200 shadow-sm">
            <CardHeader className="bg-indigo-950 py-2 px-4">
              <h3 className="text-white text-center font-medium">
                Recommendation Details
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm flex items-center">
                    Buy Range{" "}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 p-0"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Recommended price range to buy</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="font-semibold text-green-600">
                    {stockData?.buyRange}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm flex items-center">
                    Target Price{" "}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 p-0"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Expected price target</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="font-semibold text-green-600">
                    {" "}
                    {stockData?.targetPrice}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm flex items-center">
                    Add more at{" "}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 p-0"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Price range to add more shares</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="font-semibold text-green-600">
                    {" "}
                    {stockData?.addMoreAt}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">Recommended Date</div>
                  <div className="font-semibold text-green-600">
                    19 March 2025
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">Horizon</div>
                  <div className="font-semibold text-green-600">
                    {" "}
                    {stockData?.horizon}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">LTP</div>
                  <div className="font-semibold">
                    105.41 <span className="text-red-500">-2.22(2.06%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why Buy This Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-indigo-950 py-2 px-4">
              <h3 className="text-white text-center font-medium">
                Why Buy This?
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              {/* Why Buy This Section Content */}
              <div className="space-y-4">
                {Array.isArray(stockData?.content) ? (
                  stockData?.content.map((item: { key: string; value: string }, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-green-100 p-1.5 rounded-full mr-3 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">{item.key}</span>
                      <p className="text-gray-600 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-gray-600">{stockData?.content}</div>
                )}
              </div>
              <div className="mt-6 border-t pt-6 flex justify-center">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open(stockData?.tipUrl, "_blank")}
                >
                  View Detailed Report
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Similar Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-10"
        >
          <h3 className="text-lg font-medium mb-4 text-center">
            Similar Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "HDFC Bank",
                price: "1642.30",
                change: "+0.8%",
                target: "28%",
              },
              {
                name: "ICICI Bank",
                price: "1024.15",
                change: "+1.2%",
                target: "32%",
              },
              {
                name: "Kotak Bank",
                price: "1752.60",
                change: "-0.3%",
                target: "24%",
              },
            ].map((stock, index) => (
              <Link
                href={`/rangaone-wealth/recommendation/${stock.name.replace(
                  /\s+/g,
                  ""
                )}`}
                key={index}
              >
                <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{stock.name}</h4>
                        <div
                          className={`text-sm ${
                            stock.change.startsWith("+")
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {stock.change}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{stock.price}</div>
                        <div className="text-xs text-green-600">
                          Target: {stock.target}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center mb-8">
          Disclaimer: All recommendations are based on technical and fundamental
          analysis. Investments in the securities market are subject to market
          risks. Please read all the related documents carefully before
          investing.
        </div>
      </div>
    </div>
  );
}
