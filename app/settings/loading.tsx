import DashboardLayout from "@/components/dashboard-layout"

export default function SettingsLoading() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-6 max-w-6xl mx-auto">
        <div className="bg-indigo-900 text-[#FFFFF0] py-6 px-8 rounded-lg shadow-md mb-6">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-4 w-64 bg-white/20 rounded animate-pulse mx-auto"></div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>

            <div className="h-[600px] bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
