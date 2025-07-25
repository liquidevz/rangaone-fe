"use client"

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
}

export function PageHeader({ title, subtitle, showBackButton = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-[#131859] text-[#FFFFF0] py-6 px-8 rounded-lg shadow-md mb-6 relative">
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="absolute left-2 top-6   -translate-y-1/2 flex items-center text-[#FFFFF0] hover:text-blue-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium text-base">Back</span>
        </button>
      )}
      <h1 className="font-bold text-center text-7xl">{title}</h1>
      {subtitle && (
        <div className="text-center mt-2">
          <span className="text-lg">{subtitle}</span>
        </div>
      )}
    </div>
  )
}
