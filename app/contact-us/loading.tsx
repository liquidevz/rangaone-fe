import DashboardLayout from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-6 max-w-4xl mx-auto">
        <div className="bg-gray-200 h-32 rounded-lg animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
