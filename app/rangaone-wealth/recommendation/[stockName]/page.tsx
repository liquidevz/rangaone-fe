"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import WealthRecommendationPage from "@/components/wealth-recommendation-page";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StockRecommendationPage() {
  const params = useParams();
  const stockName = params.stockName as string;

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
        title={`${stockName.replace(/([A-Z])/g, " $1").trim()}`}
        subtitle="Expert Stock Recommendation"
      />
      <WealthRecommendationPage stockName={stockName} />
    </DashboardLayout>
  );
}
