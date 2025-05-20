import DashboardLayout from "@/components/dashboard-layout"
import MarketIndices from "@/components/market-indices"
import Banner from "@/components/banner"
import ExpertRecommendations from "@/components/expert-recommendations"
import ModelPortfolioSection from "@/components/model-portfolio-section"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-4">
        <MarketIndices />
        <Banner />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExpertRecommendations />
          <ModelPortfolioSection />
        </div>
      </div>
    </DashboardLayout>
  )
}
