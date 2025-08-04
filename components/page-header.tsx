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
    <div className="bg-[#131859] text-[#FFFFF0] py-4 px-8 rounded-lg shadow-md mb-4 relative">
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="absolute left-2 top-6   -translate-y-1/2 flex items-center text-[#FFFFF0] hover:text-blue-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2 md:w-10 md:h-10 md:mt-3" />
        </button>
      )}
      <h1 className="font-bold text-center lg:text-7xl md:text-7xl text-5xl">{title}</h1>
      {subtitle && (
        <div className="text-center md:mt-2 mt-0 ">
          <span className="md:text-lg text-xs font-bold">{subtitle}</span>
        </div>
      )}
    </div>
  )
}
