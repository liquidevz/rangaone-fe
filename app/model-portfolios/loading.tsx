import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#0a2463] text-[#FFFFF0] rounded-lg p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">MODEL PORTFOLIO</h1>
          <p className="text-lg">YOUR GROWTH OUR PRIORITY</p>
        </div>

        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
