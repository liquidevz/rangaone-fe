import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>

        <Card>
          <CardHeader>
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
