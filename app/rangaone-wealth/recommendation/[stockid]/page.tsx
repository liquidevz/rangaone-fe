"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { tipsService, type Tip } from "@/services/tip.service";
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service";
import { stockPriceService, type StockPriceData } from "@/services/stock-price.service";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";

// Color scheme function from tips-carousel
const getTipColorScheme = (category: "basic" | "premium") => {
  if (category === "premium") {
    return {
      gradient: "linear-gradient(90deg, #FFD700 30%, #3333330A 90%)",
      textColor: "#92400E",
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      borderColor: "#F59E0B",
      badge: {
        bg: "#92400E",
        text: "#FEF3C7",
      },
    };
  } else {
    return {
      gradient: "linear-gradient(90deg, #595CFF 30%, #3333330A 90%)",
      textColor: "#1E40AF",
      bgGradient: "linear-gradient(135deg, #18657B 0%, #131859 100%)",
      borderColor: "#595CFF",
      badge: {
        bg: "#18657B",
        text: "#DBEAFE",
      },
    };
  }
};

export default function StockRecommendationPage() {
  const params = useParams();
  const stockId = params.stockid as string;
  const { toast } = useToast();
  const [tipData, setTipData] = useState<Tip | undefined>();
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockPriceData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load both tip data and subscription access in parallel
        const [tipResult, accessResult] = await Promise.all([
          tipsService.getById(stockId),
          subscriptionService.getSubscriptionAccess()
        ]);
        
        setTipData(tipResult);
        setSubscriptionAccess(accessResult);
        
        // Fetch stock data if stockId is available
        if (tipResult?.stockId) {
          try {
            // First try the stock symbols API for current price
            const symbolResponse = await fetch(`/api/stock-symbols/${tipResult.stockId}`);
            if (symbolResponse.ok) {
              const stockSymbolData = await symbolResponse.json();
              setStockData(stockSymbolData);
            } else {
              // Fallback to stockPriceService for symbol extraction
              const stockResponse = await stockPriceService.getStockPriceById(tipResult.stockId);
              if (stockResponse.success && stockResponse.data) {
                setStockData(stockResponse.data);
              }
            }
          } catch (symbolError) {
            console.error("Failed to fetch stock data:", symbolError);
            // Continue without stock data - we'll use fallbacks
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error",
          description: "Failed to load tip details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [stockId, toast]);

  // Check if user has access to this tip
  const hasAccess = () => {
    if (!subscriptionAccess || !tipData) return false;
    
    if (tipData.category === 'premium') {
      return subscriptionAccess.hasPremium;
    } else if (tipData.category === 'basic') {
      return subscriptionAccess.hasBasic || subscriptionAccess.hasPremium;
    }
    
    return true; // Default access for uncategorized tips
  };

  const canAccessTip = hasAccess();

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

  if (!tipData) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Tip Not Found</h2>
            <Link href="/rangaone-wealth/all-recommendations">
              <Button>Back to Recommendations</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user doesn't have access, show access denied screen
  if (!canAccessTip) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-6">
            <Link
              href="/rangaone-wealth/all-recommendations"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Recommendations
            </Link>
          </div>
          
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Lock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                <p className="text-gray-600">
                  This {tipData.category || 'premium'} tip requires a subscription to view.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href={tipData.category === 'premium' ? '/premium-subscription' : '/basic-subscription'}>
                  <Button 
                    className={
                      tipData.category === 'premium'
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-[#FFFFF0]"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-[#FFFFF0]"
                    }
                  >
                    {tipData.category === 'premium' ? 'Upgrade to Premium' : 'Get Basic Plan'}
                  </Button>
                </Link>
                <div>
                  <Link href="/rangaone-wealth/all-recommendations">
                    <Button variant="outline">Back to Recommendations</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const recommendedDate = tipData.createdAt ? format(new Date(tipData.createdAt), 'dd MMMM yyyy') : 'N/A';
  const colorScheme = getTipColorScheme(tipData.category as "basic" | "premium" || "basic");

  return (
    <DashboardLayout>
      <PageHeader title="RANGAONE WEALTH" subtitle="" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">EXPERT RECOMMENDATIONS</h2>
          </div>

          {/* Box 1 - Stock Info */}
          <div 
            className="p-[3px] rounded-lg mb-6 mx-auto max-w-[18rem]"
            style={{ background: colorScheme.gradient }}
          >
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-start"> 
                <div>
                  <div className={`p-[2px] rounded inline-block mb-2 ${
                    tipData.category === 'premium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-700' 
                      : 'bg-gradient-to-r from-blue-400 to-blue-700'
                  }`}>
                    <div className={`text-xs font-semibold rounded px-2 py-1 text-white ${
                      tipData.category === 'premium' 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {tipData.category === 'premium' ? 'Premium' : 'Basic'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{stockData?.symbol || tipData.stockId || 'STOCK'}</h3>
                  <p className="text-sm text-gray-600">{stockData?.exchange || 'NSE'}</p>
                  {tipData.analysistConfidence && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">Analyst Confidence</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(tipData.analysistConfidence || 0) * 10}%`,
                            backgroundColor: colorScheme.textColor 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1" style={{ color: colorScheme.textColor }}>High</p>
                    </div>
                  )}
                </div>
                
                {(tipData.status?.toLowerCase() === 'closed' || tipData.exitStatus || tipData.exitStatusPercentage) ? (
                  (tipData.exitStatus || tipData.exitStatusPercentage) && (
                    <div className={`p-[2px] rounded-lg ${
                      (tipData.exitStatus?.toLowerCase().includes('loss') || (tipData.exitStatusPercentage && parseFloat(tipData.exitStatusPercentage.replace('%', '')) < 0))
                        ? 'bg-gradient-to-r from-[#627281] to-[#A6AFB6]' 
                        : 'bg-[#219612]'
                    }`}>
                      <div className={`rounded-md px-4 py-2 text-center min-w-[80px] ${
                        (tipData.exitStatus?.toLowerCase().includes('loss') || (tipData.exitStatusPercentage && parseFloat(tipData.exitStatusPercentage.replace('%', '')) < 0))
                          ? 'bg-gradient-to-tr from-[#A6AFB6] to-[#627281]' 
                          : 'bg-gradient-to-r from-green-50 to-green-100'
                      }`}>
                        <p className={`text-xl mb-1 font-semibold ${
                          (tipData.exitStatus?.toLowerCase().includes('loss') || (tipData.exitStatusPercentage && parseFloat(tipData.exitStatusPercentage.replace('%', '')) < 0)) ? 'text-white' : 'text-black'
                        }`}>{tipData.exitStatus || 'Exit Status'}</p>
                        <p className={`text-2xl font-bold ${
                          (tipData.exitStatus?.toLowerCase().includes('loss') || (tipData.exitStatusPercentage && parseFloat(tipData.exitStatusPercentage.replace('%', '')) < 0)) ? 'text-white' : 'text-black'
                        }`}>{tipData.exitStatusPercentage?.includes('%') ? tipData.exitStatusPercentage : `${tipData.exitStatusPercentage || '0'}%`}</p>
                      </div>
                    </div>
                  )
                ) : (
                  tipData.targetPercentage && (
                    <div className="bg-[#219612] p-[2px] rounded-lg">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-md px-4 py-2 text-center min-w-[80px]">
                        <p className="text-sm mb-1 text-black font-bold">Target</p>
                        <p className="text-2xl font-bold text-black">{tipData.targetPercentage?.includes('%') ? tipData.targetPercentage : `${tipData.targetPercentage || '0'}%`}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {tipData.title && (
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold">Title:- {tipData.title}</h2>
            </div>
          )}

          {/* Box 2 - Recommendation Details */}
          <div 
            className="p-[3px] rounded-lg mb-6 mx-auto max-w-2xl"
            style={{ background: colorScheme.gradient }}
          >
            <div className="bg-white rounded-lg p-6">
              <div className="text-center mb-4">
                <div 
                  className="text-white rounded-lg px-6 py-2 inline-block"
                  style={{ background: colorScheme.bgGradient }}
                >
                  <h3 className="text-lg font-bold">Recommendation Details</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Common fields */}
                {tipData.buyRange && (
                  <div className="text-center">
                    <p className="font-bold mb-2">Buy Range</p>
                    <p className="text-xl font-bold text-green-600">{tipData.buyRange}</p>
                  </div>
                )}
                
                {tipData.createdAt && (
                  <div className="text-center">
                    <p className="font-bold mb-2">Recommended Date</p>
                    <p className="text-xl font-bold text-green-600">{recommendedDate}</p>
                  </div>
                )}
                
                {tipData.horizon && (
                  <div className="text-center">
                    <p className="font-bold mb-2">Horizon</p>
                    <p className="text-xl font-bold text-green-600">{tipData.horizon}</p>
                  </div>
                )}
                
                {/* Closed tip fields */}
                {(tipData.status?.toLowerCase() === 'closed' || tipData.exitStatus) ? (
                  <>
                    {tipData.exitPrice && (
                      <div className="text-center">
                        <p className="font-bold mb-2">Exited Price</p>
                        <p className="text-xl font-bold text-green-600">{tipData.exitPrice}</p>
                      </div>
                    )}
                    
                    {tipData.updatedAt && (
                      <div className="text-center">
                        <p className="font-bold mb-2">Exit Date</p>
                        <p className="text-xl font-bold text-green-600">{format(new Date(tipData.updatedAt), 'dd MMMM yyyy')}</p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Active tip fields */
                  <>
                    {tipData.targetPrice && (
                      <div className="text-center">
                        <p className="font-bold mb-2">Target Price</p>
                        <p className="text-xl font-bold text-green-600">{tipData.targetPrice}</p>
                      </div>
                    )}
                    
                    {tipData.addMoreAt && (
                      <div className="text-center">
                        <p className="font-bold mb-2">Add More At</p>
                        <p className="text-xl font-bold text-green-600">{tipData.addMoreAt}</p>
                      </div>
                    )}
                    
                    {stockData?.currentPrice && (
                      <div className="text-center">
                        <p className="font-bold mb-2">Live Price</p>
                        <p className="text-xl font-bold text-blue-600">₹{stockData.currentPrice}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Box 3 - Why Buy This */}
          <div 
            className="p-[3px] rounded-lg mx-auto max-w-4xl"
            style={{ background: colorScheme.gradient }}
          >
            <div className="bg-white rounded-lg p-6">
              <div className="mb-4">
                <div 
                  className="text-white rounded-lg px-6 py-2 inline-block"
                  style={{ background: colorScheme.bgGradient }}
                >
                  <h3 className="text-lg font-bold">Why Buy This?</h3>
                </div>
              </div>
              
              {tipData.description && (
                <div className="mb-6">
                  <div 
                    className="text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: tipData.description }} 
                  />
                </div>
              )}

              {tipData.downloadLinks && tipData.downloadLinks.length > 0 && (
                <>
                  <hr className="my-6" />
                  <div className="text-center">
                    <button
                      onClick={() => window.open(tipData.downloadLinks[0].linkUrl || tipData.downloadLinks[0].url, "_blank")}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-bold rounded-lg inline-flex items-center"
                    >
                      View Detailed Report
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}