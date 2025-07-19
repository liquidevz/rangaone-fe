"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import WealthRecommendationPage from "@/components/wealth-recommendation-page";
import { tipsService, type Tip } from "@/services/tip.service";
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service";
import { useAuth } from "@/components/auth/auth-context";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StockRecommendationPage() {
  const params = useParams();
  const sockId = params.sockId as string;
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tipData, setTipData] = useState<Tip>();
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          throw new Error('User must be authenticated to view tip details');
        }
        
        // Clear cache to ensure fresh data
        subscriptionService.clearCache();
        
        console.log('🚀 Making API call for tip ID:', sockId);
        
        // Load both tip data and subscription access in parallel
        const [tipResult, accessResult] = await Promise.all([
          tipsService.getById(sockId),
          subscriptionService.getSubscriptionAccess(true)
        ]);
        
        console.log('📥 API Response received:', tipResult);
        console.log('🔑 API fields check:', {
          _id: tipResult?._id,
          title: tipResult?.title,
          buyRange: tipResult?.buyRange,
          targetPrice: tipResult?.targetPrice,
          targetPercentage: tipResult?.targetPercentage,
          action: tipResult?.action,
          horizon: tipResult?.horizon,
          description: tipResult?.description,
          status: tipResult?.status,
          content: tipResult?.content
        });
        
        if (!tipResult) {
          throw new Error('Tip not found');
        }

        setTipData(tipResult);
        setSubscriptionAccess(accessResult);
        
        // If access is not what we expect, try to diagnose the issue
        if (accessResult.subscriptionType === 'none' || (!accessResult.hasPremium && !accessResult.hasBasic)) {
          // In a production environment, you might log this to a monitoring system
          // console.log('Potential subscription access issue detected, running diagnosis...');
          // await subscriptionService.diagnoseSubscriptionIssue(); // This is for diagnosis, not production runtime
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        
        // Handle different error types
        if (error instanceof Error) {
          if (error.message.includes('404') || error.message.includes('not found')) {
            setError('Tip not found');
          } else if (error.message.includes('403') || error.message.includes('unauthorized')) {
            setError('Access denied');
          } else if (error.message.includes('500') || error.message.includes('server')) {
            setError('Server error. Please try again later.');
          } else {
            setError(error.message);
          }
        } else {
          setError('Failed to load recommendation details');
        }
        
        toast({
          title: "Error",
          description: "Failed to load recommendation details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (sockId && !authLoading) {
      loadData();
    }
  }, [sockId, isAuthenticated, authLoading, toast]);

  // Check if user has access to this tip
  const hasAccess = () => {
    // If authentication is still loading, or critical data is missing, we can't determine access yet.
    // The main loading and authentication checks outside this function will handle the initial states.
    if (!subscriptionAccess || !tipData) {
      return false;
    }

    // If user has premium access, they can access any tip
    if (subscriptionAccess.hasPremium) {
      return true;
    }

    // Access control based on tip category for non-premium users
    if (tipData.category === 'premium') {
      // Premium tips are only accessible with premium subscription (already handled by above check)
      return false; // Should not reach here if hasPremium is false
    } else if (tipData.category === 'basic') {
      // Basic tips are accessible if user has basic subscription (and not premium)
      return subscriptionAccess.hasBasic;
    } 
    
    // If the tip has a portfolio associated with it (meaning it's a "portfolio tip")
    // and requires portfolio access based on the subscription service.
    // This assumes `tipData.portfolio` being present implies it's a "portfolio tip"
    // and `subscriptionAccess.portfolioAccess` controls access to such tips.
    if (tipData.portfolio && (typeof tipData.portfolio === 'string' || typeof tipData.portfolio === 'object')) {
        // Check if the specific portfolio ID is in portfolioAccess
        const portfolioIdToCheck = typeof tipData.portfolio === 'string' ? tipData.portfolio : tipData.portfolio?._id;
        return portfolioIdToCheck ? subscriptionAccess.portfolioAccess.includes(portfolioIdToCheck) : false;
    }

    // Default: If no specific category or portfolio requirement, grant access (e.g., uncategorized free tips)
    return true;
  };

  const canAccessTip = hasAccess();
  
  // Show loading while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout userId="1">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <DashboardLayout userId="1">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view tip details.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout userId="1">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading recommendation details...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the latest data</p>
        </div>
      </DashboardLayout>
    );
  }

  // Consolidated check: If there's an error OR no tipData (after loading), show not found/error.
  // This handles 404s and other fetch errors, ensuring a consistent message.
  if (error || !tipData) {
    const getErrorTitle = () => {
      if (!error && !tipData) return "Recommendation Not Found";
      if (error?.includes('not found')) return "Recommendation Not Found";
      if (error?.includes('Access denied') || error?.includes('unauthorized')) return "Access Denied";
      if (error?.includes('Server error')) return "Server Error";
      return "Error Loading Recommendation";
    };

    const getErrorMessage = () => {
      if (error?.includes('not found')) return "The requested recommendation could not be found or may have been removed.";
      if (error?.includes('Access denied') || error?.includes('unauthorized')) return "You don't have permission to view this recommendation.";
      if (error?.includes('Server error')) return "Our servers are experiencing issues. Please try again in a few moments.";
      if (error) return error;
      return "The requested recommendation could not be found or is not available.";
    };

    const getButtonText = () => {
      if (error?.includes('Server error')) return "Try Again";
      return "Back to Recommendations";
    };

    const getButtonAction = () => {
      if (error?.includes('Server error')) {
        return () => window.location.reload();
      }
      return undefined;
    };

    return (
      <DashboardLayout userId="1">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{getErrorTitle()}</h2>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {getErrorMessage()}
          </p>
          <div className="space-y-2">
            <Link href="/rangaone-wealth">
              <Button onClick={getButtonAction()}>
                {getButtonText()}
              </Button>
            </Link>
            {error?.includes('Server error') && (
              <div>
                <Link href="/rangaone-wealth">
                  <Button variant="outline">Back to Recommendations</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user doesn't have access, show access denied screen
  if (!canAccessTip) {
    return (
      <DashboardLayout userId="1">
        <div className="mb-4">
          <Link
            href="/rangaone-wealth"
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
                This {(tipData as any).category || 'premium'} recommendation requires a subscription to view.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href={(tipData as any).category === 'premium' ? '/premium-subscription' : '/basic-subscription'}>
                <Button 
                  className={
                    (tipData as any).category === 'premium'
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  }
                >
                  {(tipData as any).category === 'premium' ? 'Upgrade to Premium' : 'Get Basic Plan'}
                </Button>
              </Link>
              <div>
                <Link href="/rangaone-wealth">
                  <Button variant="outline">Back to Recommendations</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If all checks pass, render the WealthRecommendationPage with the tipData
  return (
    <DashboardLayout userId="1">
      <div className="mb-4">
        <Link
          href="/rangaone-wealth"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Recommendations
        </Link>
      </div>
      <PageHeader
        title={`${tipData?.title?.replace(/([A-Z])/g, " $1")?.trim()}`}
        subtitle="Expert Stock Recommendation"
      />
      <WealthRecommendationPage stockData={tipData} />
    </DashboardLayout>
  );
}
