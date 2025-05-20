import DashboardLayout from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-6">
        <div className="bg-gray-200 h-32 rounded-lg animate-pulse mb-6"></div>

        {/* Featured Video Placeholder */}
        <div className="bg-gray-200 rounded-lg animate-pulse mb-6">
          <div className="aspect-video w-full"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>

        {/* Video Library Placeholder */}
        <div className="bg-gray-200 rounded-lg animate-pulse">
          <div className="p-4 border-b border-gray-300">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>

          <div className="p-4">
            <div className="h-10 bg-gray-300 rounded mb-6"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-300 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
