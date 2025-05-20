"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function PortfolioPerformanceChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Sample data
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const portfolioData = [2.3, 2.5, 2.8, 3.2, 3.5, 3.8, 4.0, 3.8, 4.2, 4.5, 4.8, 5.0]

    const benchmarkData = [2.0, 2.1, 2.3, 2.5, 2.7, 2.9, 3.0, 2.8, 3.0, 3.2, 3.4, 3.5]

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Portfolio",
              data: portfolioData,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              pointRadius: 3,
              pointBackgroundColor: "#10b981",
            },
            {
              label: "Benchmark (Nifty 50)",
              data: benchmarkData,
              borderColor: "#6b7280",
              backgroundColor: "rgba(107, 114, 128, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              pointRadius: 3,
              pointBackgroundColor: "#6b7280",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: {
                boxWidth: 15,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || ""
                  if (label) {
                    label += ": "
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toFixed(2) + "%"
                  }
                  return label
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                callback: (value) => value + "%",
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
