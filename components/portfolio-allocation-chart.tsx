"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables, ChartData, ChartOptions } from "chart.js"

Chart.register(...registerables)

type DoughnutChartOptions = ChartOptions<'doughnut'>

export default function PortfolioAllocationChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Sample data
    const data: ChartData<'doughnut'> = {
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
          borderRadius: 2,
          hoverOffset: 0,
          offset: 4, // Small default separation between segments
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
      const options: DoughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        layout: {
          padding: 10
        },
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 15,
              padding: 15,
              font: {
                size: 12,
                weight: 500
              },
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                const colors = datasets[0].backgroundColor as string[];
                return (chart.data.labels as string[])?.map((label, i) => ({
                  text: `${label} (${datasets[0].data[i]}%)`,
                  fillStyle: colors[i],
                  hidden: false,
                  lineCap: 'round',
                  lineDash: [],
                  lineDashOffset: 0,
                  lineJoin: 'round',
                  lineWidth: 1,
                  strokeStyle: colors[i],
                  pointStyle: 'rect',
                  rotation: 0,
                })) || []
              },
            },
            onHover: (event, legendItem) => {
              if (event && chartInstance.current) {
                const index = legendItem?.index ?? -1;
                const activeSegments = chartInstance.current.getActiveElements();
                if (activeSegments.length > 0) {
                  chartInstance.current.setActiveElements([]);
                } else if (index > -1) {
                  chartInstance.current.setActiveElements([{
                    datasetIndex: 0,
                    index: index
                  }]);
                }
                chartInstance.current.update();
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                return `${label}: ${value}%`
              },
            },
          },
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        animation: {
          duration: 200,
          easing: 'easeOutQuart'
        },
        elements: {
          arc: {
            borderWidth: 2,
            borderColor: '#fff',
            hoverBorderColor: '#fff',
            hoverBorderWidth: 2,
            borderRadius: 2,
            // Remove individual segment offset on hover
            hoverOffset: 0,
          }
        },
        transitions: {
          active: {
            animation: {
              duration: 150,
              easing: 'easeOutCubic'
            }
          }
        }
      }

      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: data,
        options: options,
        plugins: [{
          id: 'hoverEffect',
          beforeDraw: (chart) => {
            const activeElements = chart.getActiveElements();
            if (activeElements.length > 0) {
              const ctx = chart.ctx;
              const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
              const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
              const meta = chart.getDatasetMeta(0);
              const arc = meta.data[activeElements[0].index];
              
              // Add shadow effect for lifted appearance
              ctx.save();
              ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 4;
              
              // Redraw the active arc with shadow
              ctx.beginPath();
              // @ts-ignore - arc has draw method
              arc.draw(ctx);
              ctx.restore();
            }
          }
        }]
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
