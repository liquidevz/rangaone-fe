import DashboardLayout from "@/components/dashboard-layout"
import Banner from "@/components/banner"
import { 
  MarketIndicesSection, 
  ExpertRecommendationsSection, 
  ModelPortfolioSection 
} from "@/components/dashboard-sections"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-4">
        <MarketIndicesSection />
        <Banner />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExpertRecommendationsSection />
          <ModelPortfolioSection />
        </div>
      </div>
    </DashboardLayout>
  )
}
