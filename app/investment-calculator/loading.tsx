"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Investment Calculator" 
          subtitle="Calculate your potential investment returns based on portfolio allocation and investment amount."
        />
        
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}