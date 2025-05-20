"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function PortfolioAllocationChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Sample data
    const data = {
      labels: ["Financial Services", "Energy", "IT", "Consumer Goods", "Healthcare", "Others"],
      datasets: [
        {
          data: [35, 20, 15, 12, 10, 8],
          backgroundColor: [
            "#3b82f6", // blue
            "#10b981", // green
            "#6366f1", // indigo
            "#f59e0b", // amber
            "#ef4444", // red
            "#8b5cf6", // purple
          ],
          borderWidth: 0,
          borderRadius: 5,
        },
      ],
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw as number
                  return `${label}: ${value}%`
                },
              },
            },
          },
        },
      })
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return <canvas ref={chartRef} />
}
