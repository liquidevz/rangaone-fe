"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/ui/use-toast";
import WealthRecommendationPage from "@/components/wealth-recommendation-page";
import { Tip } from "@/lib/types";
import { tipsService } from "@/services/tip.service";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StockRecommendationPage() {
  const params = useParams();
  const sockId = params.sockId as string;
  const { toast } = useToast();
  const [tipData, setTipData] = useState<Tip>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTipData() {
      try {
        const data = await tipsService.getById(sockId);
        setTipData(data);
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

    loadTipData();
  }, [toast]);

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
