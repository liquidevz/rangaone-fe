import { FiBarChart2, FiShield, FiTrendingUp, FiUsers } from "react-icons/fi"

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose RangaOne FINWALA</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiTrendingUp className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Analysis</h3>
            <p className="text-gray-600">
              Get access to professional market analysis and stock recommendations from our team of experts.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiBarChart2 className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Portfolio Management</h3>
            <p className="text-gray-600">
              Professionally managed portfolios designed to meet your financial goals and risk tolerance.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiUsers className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Personalized Service</h3>
            <p className="text-gray-600">
              Dedicated financial advisors who understand your unique needs and investment objectives.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiShield className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Platform</h3>
            <p className="text-gray-600">
              State-of-the-art security measures to protect your investments and personal information.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
