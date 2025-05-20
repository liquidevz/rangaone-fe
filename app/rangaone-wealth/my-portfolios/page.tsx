"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MyPortfoliosPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Portfolios</h1>

        <Card>
          <CardHeader>
            <CardTitle>Your Purchased Portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You haven't purchased any portfolios yet. Visit the Model Portfolios page to explore and subscribe to
              portfolios.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
