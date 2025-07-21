"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { PageHeader } from '@/components/page-header';
import { InvestmentCalculator } from "@/components/investment-calculator";

export default function InvestmentCalculatorPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Investment Calculator" 
          subtitle="Calculate your potential investment returns based on portfolio allocation and investment amount."
        />
        <InvestmentCalculator />
      </div>
    </DashboardLayout>
  );
}