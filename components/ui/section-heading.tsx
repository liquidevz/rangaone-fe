import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  className?: string
  subtitleClassName?: string
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  subtitleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center", align === "right" && "text-right", className)}>
      {subtitle && <p className={cn("text-sm text-gray-600 mb-2", subtitleClassName)}>{subtitle}</p>}
      <h2 className="text-7xl md:text-7xl font-bold text-gray-900">{title}</h2>
    </div>
  )
}
