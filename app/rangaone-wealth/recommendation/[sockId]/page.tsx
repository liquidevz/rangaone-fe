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
        // Load both tip data and subscription access in parallel
        const [tipResult, accessResult] = await Promise.all([
          tipsService.getById(sockId),
          subscriptionService.getSubscriptionAccess()
        ]);
        
        setTipData(tipResult);
        setSubscriptionAccess(accessResult);
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
    if (!subscriptionAccess || !tipData) return false;
    
    const tipCategory = (tipData as any).category || 'basic'; // Handle missing category property
    
    if (tipCategory === 'premium') {
      return subscriptionAccess.hasPremium;
    } else if (tipCategory === 'basic') {
      return subscriptionAccess.hasBasic || subscriptionAccess.hasPremium;
    }
    
    return true; // Default access for uncategorized tips
  };

  const canAccessTip = hasAccess();

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
