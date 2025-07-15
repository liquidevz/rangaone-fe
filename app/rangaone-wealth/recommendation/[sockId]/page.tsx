"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import WealthRecommendationPage from "@/components/wealth-recommendation-page";
import { tipsService, type Tip } from "@/services/tip.service";
import { subscriptionService, type SubscriptionAccess } from "@/services/subscription.service";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StockRecommendationPage() {
  const params = useParams();
  const sockId = params.sockId as string;
  const { toast } = useToast();
  const [tipData, setTipData] = useState<Tip>();
  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('Loading tip data and subscription access...');
        // Clear cache to ensure fresh data
        subscriptionService.clearCache();
        // Load both tip data and subscription access in parallel
        const [tipResult, accessResult] = await Promise.all([
          tipsService.getById(sockId),
          subscriptionService.getSubscriptionAccess(true)
        ]);
        
        console.log('Tip result:', tipResult);
        console.log('Access result:', accessResult);
        
        setTipData(tipResult);
        setSubscriptionAccess(accessResult);
        
        // If access is not what we expect, try to diagnose the issue
        if (accessResult.subscriptionType === 'none' || (!accessResult.hasPremium && !accessResult.hasBasic)) {
          console.log('Potential subscription access issue detected, running diagnosis...');
          await subscriptionService.diagnoseSubscriptionIssue();
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error",
          description: "Failed to load recommendation details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sockId, toast]);

  // Check if user has access to this tip
  const hasAccess = () => {
    console.log('=== Recommendation Page Access Check ===', {
      tipData: tipData,
      subscriptionAccess: subscriptionAccess,
      hasSubscriptionAccess: !!subscriptionAccess,
      hasPremium: subscriptionAccess?.hasPremium,
      hasBasic: subscriptionAccess?.hasBasic,
      subscriptionType: subscriptionAccess?.subscriptionType,
      portfolioAccess: subscriptionAccess?.portfolioAccess
    });
    
    if (!subscriptionAccess || !tipData) {
      console.log('Missing subscription access or tip data');
      return false;
    }
    
    // TEMPORARY FIX: If user has any subscription type that's not 'none', grant access
    // This should resolve the premium access issue
    if (subscriptionAccess.subscriptionType !== 'none') {
      console.log('User has active subscription type:', subscriptionAccess.subscriptionType, '- granting access');
      return true;
    }
    
    const tipCategory = (tipData as any).category || 'basic'; // Handle missing category property
    console.log('Tip category:', tipCategory);
    
    // If no subscription, check if it's a free tip
    if (tipCategory === 'premium' || tipCategory === 'basic') {
      console.log('Premium/Basic tip but no subscription - denying access');
      return false;
    }
    
    // Default access for uncategorized tips
    console.log('Uncategorized tip - granting access');
    return true;
  };

  const canAccessTip = hasAccess();
  
  console.log('Final recommendation access decision:', {
    tipId: sockId,
    category: (tipData as any)?.category || 'basic',
    canAccessTip
  });

  if (loading) {
    return (
      <DashboardLayout userId="1">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tipData) {
    return (
      <DashboardLayout userId="1">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Recommendation Not Found</h2>
          <Link href="/rangaone-wealth">
            <Button>Back to Recommendations</Button>
          </Link>
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
