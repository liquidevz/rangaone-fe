"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/ui/use-toast";
import WealthRecommendationPage from "@/components/wealth-recommendation-page";
import { portfolioService } from "@/services/portfolio.service";
import { tipsService, type Tip } from "@/services/tip.service";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PortfolioTipDetailsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const tipId = params.tipId as string;
  const { toast } = useToast();
  const [tipData, setTipData] = useState<Tip | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTipData() {
      try {
        setLoading(true);
        const data = await tipsService.getById(tipId);
        setTipData(data);
      } catch (error) {
        console.error("Failed to load tip:", error);
        toast({
          title: "Error",
          description: "Failed to load tip details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTipData();
  }, [tipId, toast]);

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

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          href={`/model-portfolios/${portfolioId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Portfolio Details
        </Link>
      </div>
      <PageHeader
        title={`${tipData?.title?.replace(/([A-Z])/g, " $1")?.trim()}`}
        subtitle="Portfolio Stock Recommendation"
      />
      <WealthRecommendationPage stockData={tipData} />
    </DashboardLayout>
  );
} 