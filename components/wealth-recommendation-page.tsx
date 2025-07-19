"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const displayName = stockData?.title?.replace(/-/g, " ").toUpperCase() || stockData?.stockId?.toUpperCase() || 'RECOMMENDATION';

  // Debug: Check what data we're actually receiving
  console.log('🔍 API Response Debug:', {
    stockData,
    buyRange: stockData?.buyRange,
    targetPrice: stockData?.targetPrice,
    targetPercentage: stockData?.targetPercentage,
    addMoreAt: stockData?.addMoreAt,
    action: stockData?.action,
    horizon: stockData?.horizon,
    description: stockData?.description,
    content: stockData?.content,
  });

  // Get values directly from API response as per documentation
  const buyRange = stockData?.buyRange || 'N/A';
  const targetPrice = stockData?.targetPrice || 'N/A';
  const targetPercentage = stockData?.targetPercentage || 'N/A';
  const addMoreAt = stockData?.addMoreAt || 'N/A';
  const action = stockData?.action || 'Buy'; // Default to Buy if not specified
  const horizon = stockData?.horizon || 'N/A';
  const description = stockData?.description || '';
  const exitPrice = stockData?.exitPrice || '';
  const exitStatus = stockData?.exitStatus || '';
  const exitStatusPercentage = stockData?.exitStatusPercentage || '';

  console.log('🎯 Extracted values:', {
    buyRange,
    targetPrice,
    targetPercentage,
    addMoreAt,
    action,
    horizon,
    description,
  });



  // Format description for TinyMCE content (convert to bullet points)
  const formatDescription = (description: string): string => {
    if (!description) return '';
    
    // Split by bullet points or new lines and create HTML list
    const points = description
      .split(/[•·\n]/)
      .map(point => point.trim())
      .filter(point => point.length > 0 && point !== '…')
      .slice(0, 5); // Limit to 5 points as requested

    if (points.length === 0) return `<p>${description}</p>`;

    return `<ul class="list-disc list-inside space-y-1 text-gray-700">
      ${points.map(point => `<li class="leading-relaxed">${point}</li>`).join('')}
    </ul>`;
  };

  // Get section headings based on action
  const getSectionTitle = () => {
    const actionLower = action?.toLowerCase() || 'buy';
    switch (actionLower) {
      case 'sell':
        return 'Why Sell This?';
      case 'hold':
        return 'Why Hold This?';
      default:
        return 'Why Buy This?';
    }
  };

  const getActionButtonText = () => {
    const actionLower = action?.toLowerCase() || 'buy';
    switch (actionLower) {
      case 'sell':
        return 'View Sell Analysis';
      case 'hold':
        return 'View Hold Analysis';
      default:
        return 'View Detailed Report';
    }
  };

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
              RANGAONE WEALTH - UPDATED ✅
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
                  <Badge className={`text-white ${
                    action?.toLowerCase() === 'sell' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'
                  }`}>
                    {stockData?.category ? stockData.category.charAt(0).toUpperCase() + stockData.category.slice(1) : 'Recommendation'}
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
                        <p>
                          {action?.toLowerCase() === 'sell' 
                            ? 'Sell recommendation with analysis' 
                            : action?.toLowerCase() === 'hold' 
                              ? 'Hold recommendation with analysis' 
                              : 'Buy recommendation with analysis'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                      {horizon}
                    </span>
                  </div>
                  {/* Note: 'Banking' and 'Large Cap' badges are hardcoded in the original design and not provided by the API. They are removed to ensure data purity from API. */}
                </div>
                {/* Removed hardcoded Price, Change, and Volume as they are not from API. */}
                <div className={`rounded-lg p-3 text-center min-w-[100px] ${
                  action?.toLowerCase() === 'sell' 
                    ? 'bg-red-100' 
                    : action?.toLowerCase() === 'hold' 
                      ? 'bg-yellow-100' 
                      : 'bg-green-100'
                }`}>
                  <div className={`text-xs ${
                    action?.toLowerCase() === 'sell' 
                      ? 'text-red-700' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'text-yellow-700' 
                        : 'text-green-700'
                  }`}>
                    Target
                  </div>
                  <div className={`text-2xl font-bold ${
                    action?.toLowerCase() === 'sell' 
                      ? 'text-red-700' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'text-yellow-700' 
                        : 'text-green-700'
                  }`}>
                    {targetPercentage !== 'N/A' ? `${targetPercentage}%` : 'N/A'}
                  </div>
                  <div className={`text-xs ${
                    action?.toLowerCase() === 'sell' 
                      ? 'text-red-700' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'text-yellow-700' 
                        : 'text-green-700'
                  }`}>
                    {action?.toLowerCase() === 'sell' ? 'exit' : action?.toLowerCase() === 'hold' ? 'potential' : 'upside'}
                  </div>
                </div>
              </div>

              {/* Removed Analyst Confidence as it's not from API */}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendation Details */}
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
                  <div className={`font-semibold ${
                    action?.toLowerCase() === 'sell' 
                      ? 'text-red-600' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {buyRange}
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
                  <div className={`font-semibold ${
                    action?.toLowerCase() === 'sell' 
                      ? 'text-red-600' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {targetPrice}
                  </div>
                </div>
                {addMoreAt !== 'N/A' && (
                  <div className="space-y-1">
                    <div className="text-gray-500 text-sm flex items-center">
                      {action?.toLowerCase() === 'sell' ? 'Sell more at' : 'Add more at'}{" "}
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
                            <p>
                              {action?.toLowerCase() === 'sell' 
                                ? 'Price range to sell more shares' 
                                : 'Price range to add more shares'}
                            </p>
                                                  </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className={`font-semibold ${
                    action?.toLowerCase() === 'sell' 
                      ? 'text-red-600' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {addMoreAt}
                  </div>
                </div>
                )}
                                  <div className="space-y-1">
                    <div className="text-gray-500 text-sm">Recommended Date</div>
                    <div className={`font-semibold ${
                      action?.toLowerCase() === 'sell' 
                        ? 'text-red-600' 
                        : action?.toLowerCase() === 'hold' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {stockData?.createdAt ? new Date(stockData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500 text-sm">Horizon</div>
                    <div className={`font-semibold ${
                      action?.toLowerCase() === 'sell' 
                        ? 'text-red-600' 
                        : action?.toLowerCase() === 'hold' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {horizon}
                    </div>
                  </div>
                {/* Removed hardcoded LTP as it's not from API. */}
                {(action && action !== 'N/A') && stockData?.status && ( // Display Action and Status if available
                  <div className="space-y-1">
                    <div className="text-gray-500 text-sm">Action / Status</div>
                    <div className={`font-semibold ${
                      action?.toLowerCase() === 'sell' 
                        ? 'text-red-600' 
                        : action?.toLowerCase() === 'hold' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {action.toUpperCase()} / {stockData.status}
                    </div>
                  </div>
                )}
                                 {(exitPrice && exitPrice !== '') || (exitStatus && exitStatus !== '') || (exitStatusPercentage && exitStatusPercentage !== '') ? (
                  <div className="space-y-1">
                    <div className="text-gray-500 text-sm">Exit Details</div>
                    <div className={`font-semibold ${
                      action?.toLowerCase() === 'sell' 
                        ? 'text-red-600' 
                        : action?.toLowerCase() === 'hold' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {exitPrice && exitPrice !== '' && `Exit: ${exitPrice}`}
                      {exitStatusPercentage && exitStatusPercentage !== '' && ` (${exitStatusPercentage}${exitStatusPercentage.includes('%') ? '' : '%'})`}
                      {exitStatus && exitStatus !== '' && ` - ${exitStatus}`}
                      {!exitPrice && !exitStatusPercentage && !exitStatus && 'Exit details not available'}
                    </div>
                  </div>
                ) : null}
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
                {getSectionTitle()}
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              {/* Dynamic Section Content */}
              <div className="space-y-4">
                {/* Display description if available */}
                {description && description.trim() !== '' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: formatDescription(description) }} />
                  </div>
                )}
                
                {/* Display content array items (excluding technical fields) */}
                {stockData?.content && Array.isArray(stockData.content) && stockData.content.length > 0 && (
                  <div className="space-y-3">
                    {stockData.content
                      .filter((item: { key: string; value: string }) => 
                        !['buyRange', 'targetPrice', 'targetPercentage', 'action', 'addMoreAt', 'addmoreat'].includes(item.key.toLowerCase())
                      )
                      .map((item: { key: string; value: string }, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className={`p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0 ${
                            action?.toLowerCase() === 'sell' 
                              ? 'bg-red-100' 
                              : action?.toLowerCase() === 'hold' 
                                ? 'bg-yellow-100' 
                                : 'bg-green-100'
                          }`}>
                            <TrendingUp className={`h-4 w-4 ${
                              action?.toLowerCase() === 'sell' 
                                ? 'text-red-600' 
                                : action?.toLowerCase() === 'hold' 
                                  ? 'text-yellow-600' 
                                  : 'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 capitalize">
                              {item.key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <p className="text-gray-600 mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                
                {/* Show fallback if no content available */}
                {(!description || description.trim() === '') && 
                 (!stockData?.content || !Array.isArray(stockData.content) || stockData.content.length === 0) && (
                  <p className="text-gray-600">No detailed analysis available for this recommendation.</p>
                )}
              </div>
              <div className="mt-6 border-t pt-6 flex justify-center">
                <Button
                  className={`text-white ${
                    action?.toLowerCase() === 'sell' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : action?.toLowerCase() === 'hold' 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={() => window.open(stockData?.tipUrl, "_blank")}
                >
                  {getActionButtonText()}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download Links Section */}
        {stockData?.downloadLinks && stockData.downloadLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-8"
          >
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-indigo-950 py-2 px-4">
                <h3 className="text-white text-center font-medium">
                  Additional Resources
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {stockData.downloadLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{link.name || link.linkDiscription || `Document ${index + 1}`}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.linkUrl || link.url, "_blank")}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
