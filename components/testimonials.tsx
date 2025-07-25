export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">What Our Clients Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">RK</span>
              </div>
              <div>
                <h4 className="font-bold">Rajesh Kumar</h4>
                <p className="text-gray-500 text-sm">Investor since 2019</p>
              </div>
            </div>
            <p className="text-gray-600">
              "RangaOne FINWALA has transformed my investment strategy. Their expert recommendations have consistently
              outperformed the market."
            </p>
            <div className="flex text-yellow-400 mt-4">★★★★★</div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">SP</span>
              </div>
              <div>
                <h4 className="font-bold">Sunita Patel</h4>
                <p className="text-gray-500 text-sm">Investor since 2020</p>
              </div>
            </div>
            <p className="text-gray-600">
              "The personalized attention I receive from my advisor is exceptional. They understand my goals and have
              helped me build a solid portfolio."
            </p>
            <div className="flex text-yellow-400 mt-4">★★★★★</div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">AM</span>
              </div>
              <div>
                <h4 className="font-bold">Amit Mehta</h4>
                <p className="text-gray-500 text-sm">Investor since 2018</p>
              </div>
            </div>
            <p className="text-gray-600">
              "I've tried several investment platforms, but RangaOne FINWALA stands out for their research quality and
              customer service."
            </p>
            <div className="flex text-yellow-400 mt-4">★★★★★</div>
          </div>
        </div>
      </div>
    </section>
  )
}
