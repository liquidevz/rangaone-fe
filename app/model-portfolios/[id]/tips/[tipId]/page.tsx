"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { tipsService, type Tip } from "@/services/tip.service";
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PortfolioTipDetailsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const tipId = params.tipId as string;
  const { toast } = useToast();
  const [tipData, setTipData] = useState<Tip | undefined>();
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load both tip data and subscription access in parallel
        const [tipResult, accessResult] = await Promise.all([
          tipsService.getById(tipId),
          subscriptionService.getSubscriptionAccess()
        ]);
        
        setTipData(tipResult);
        setSubscriptionAccess(accessResult);
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
  }, [tipId, toast]);

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
            <Link href={`/model-portfolios/${portfolioId}`}>
              <Button>Back to Portfolio</Button>
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
          href={`/model-portfolios/${portfolioId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Portfolio
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
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    }
                  >
                    {tipData.category === 'premium' ? 'Upgrade to Premium' : 'Get Basic Plan'}
                  </Button>
                </Link>
                <div>
                  <Link href={`/model-portfolios/${portfolioId}`}>
                    <Button variant="outline">Back to Portfolio</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Better stock name extraction logic
  const extractStockName = () => {
    // First try to extract from title (before colon, dash, or parenthesis)
    if (tipData.title) {
      const titleParts = tipData.title.split(/[:|\-|\(]/);
      if (titleParts.length > 0) {
        const extractedName = titleParts[0].trim();
        // Only use if it's not too long and looks like a stock name
        if (extractedName.length > 0 && extractedName.length < 20 && !/^[0-9a-f]{20,}$/i.test(extractedName)) {
          return extractedName.toUpperCase();
        }
      }
    }
    
    // Fallback to stockId if it exists and is not an ObjectId
    if (tipData.stockId && tipData.stockId.length < 20 && !/^[0-9a-f]{20,}$/i.test(tipData.stockId)) {
      return tipData.stockId.toUpperCase();
    }
    
    // Last fallback
    return 'STOCK';
  };

  const stockName = extractStockName();
  const weightage = tipData.targetPercentage || '4%';
  const buyRange = tipData.buyRange || '₹ 1000 - 1050';
  const addMoreAt = tipData.addMoreAt || 'N/A';
  const action = tipData.action || 'HOLD';
  const recommendedDate = tipData.createdAt ? format(new Date(tipData.createdAt), 'dd MMMM yyyy') : 'N/A';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with Blue Background */}
          <div 
            className="text-white p-4 sm:p-6"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/model-portfolios/${portfolioId}`}
                className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Portfolio Details
        </Link>
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-wide">
                MODEL PORTFOLIO
              </h1>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-4 sm:px-6 pb-6">
            {/* Expert Recommendations Label */}
            <div className="text-center py-4 sm:py-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">EXPERT RECOMMENDATIONS</h2>
            </div>

            {/* Small Card - Stock Info */}
            <div 
              className="p-1 rounded-xl shadow-lg mb-4 sm:mb-6 mx-auto max-w-2xl"
              style={{
                background: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)"
              }}
            >
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="bg-black text-white text-sm font-medium rounded-md px-3 py-2 text-center sm:text-left">
                      Model Portfolio
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-black">{stockName}</h3>
                      <p className="text-sm text-gray-600">NSE</p>
                    </div>
                  </div>
                  <div 
                    className="p-1 rounded-lg self-center sm:self-auto"
                    style={{ background: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)" }}
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-md px-4 py-3 text-center min-w-[100px]">
                      <p className="text-xs text-gray-600">Weightage</p>
                      <p className="text-xl sm:text-2xl font-bold text-black">{weightage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Card - Title */}
            {tipData.title && (
              <div className="mb-4 sm:mb-6 px-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                  Title:- {tipData.title}
                </h2>
              </div>
            )}

            {/* Large Card - Recommendation Details */}
            <div 
              className="p-1 rounded-xl shadow-lg mb-4 sm:mb-6"
              style={{
                background: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)"
              }}
            >
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <div className="text-center mb-6">
                  <div className="bg-slate-800 text-white rounded-lg px-4 sm:px-6 py-3 inline-block">
                    <h3 className="text-base sm:text-lg font-semibold">Recommendation Details</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Buy Range</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{buyRange}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Add more at</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{addMoreAt}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Action</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{action}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Recommended Date</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">{recommendedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biggest Card - Why Buy This */}
            <div 
              className="p-1 rounded-xl shadow-lg"
              style={{
                background: "linear-gradient(90deg, #00B7FF 0%, #85D437 100%)"
              }}
            >
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <div className="mb-6">
                  <div className="bg-slate-800 text-white rounded-lg px-4 sm:px-6 py-3 inline-block">
                    <h3 className="text-base sm:text-lg font-semibold">Why Buy This?</h3>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {Array.isArray(tipData.content) ? (
                    tipData.content.map((item: { key: string; value: string }, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-black font-bold text-lg sm:text-xl mt-1 flex-shrink-0">•</span>
                        <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                          <span className="font-medium">{item.key}</span>
                          {item.key && item.value && ': '}
                          {item.value}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="text-black font-bold text-lg sm:text-xl mt-1 flex-shrink-0">•</span>
                      <p className="text-gray-800 text-base sm:text-lg leading-relaxed">{tipData.content}</p>
                    </div>
                  )}
                  
                  {tipData.description && (
                    <div className="flex items-start gap-3">
                      <span className="text-black font-bold text-lg sm:text-xl mt-1 flex-shrink-0">•</span>
                      <p className="text-gray-800 text-base sm:text-lg leading-relaxed">{tipData.description}</p>
                    </div>
                  )}
                </div>

                {/* Divider Line */}
                <div className="border-t-2 border-gray-300 my-6"></div>

                {/* View Detailed Report Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => window.open(tipData.tipUrl, "_blank")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-lg w-full sm:w-auto"
                  >
                    View Detailed Report
                    <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Download Links Section */}
          {tipData.downloadLinks && tipData.downloadLinks.length > 0 && (
            <div className="px-4 sm:px-6 pb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
                  <div className="space-y-2">
                    {tipData.downloadLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2">
                        <span className="font-medium text-sm sm:text-base">{link.name || `Document ${index + 1}`}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link.linkUrl, "_blank")}
                          className="w-full sm:w-auto"
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 