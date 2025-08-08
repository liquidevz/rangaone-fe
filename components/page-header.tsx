"use client"

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  size?: "hero" | "lg" | "md" | "sm"
}

export function PageHeader({ title, subtitle, showBackButton = true, size = "hero" }: PageHeaderProps) {
  const router = useRouter();

  const sizeToClasses: Record<Required<PageHeaderProps>["size"], { container: string; title: string; subtitle: string }> = {
    hero: {
      container: "py-4 px-8",
      title: "lg:text-7xl md:text-7xl text-4xl",
      subtitle: "md:text-lg text-xs font-bold",
    },
    lg: {
      container: "py-4 px-8",
      title: "lg:text-5xl md:text-5xl text-3xl",
      subtitle: "md:text-base text-xs font-bold",
    },
    md: {
      container: "py-3 px-6",
      title: "lg:text-3xl md:text-3xl text-2xl",
      subtitle: "md:text-sm text-xs font-bold",
    },
    sm: {
      container: "py-2.5 px-5",
      title: "lg:text-2xl md:text-2xl text-xl",
      subtitle: "text-xs font-bold",
    },
  };

  const classes = sizeToClasses[size];

  return (
    <div className={`bg-[#131859] text-[#FFFFF0] ${classes.container} rounded-lg shadow-md mb-4 relative`}>
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="absolute left-2 top-6   -translate-y-1/2 flex items-center text-[#FFFFF0] hover:text-blue-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2 md:w-10 md:h-10 md:mt-3" />
        </button>
      )}
      <h1 className={`font-bold text-center ${classes.title}`}>{title}</h1>
      {subtitle && (
        <div className="text-center md:mt-2 mt-0 ">
          <span className={classes.subtitle}>{subtitle}</span>
        </div>
      )}
    </div>
  )
}
