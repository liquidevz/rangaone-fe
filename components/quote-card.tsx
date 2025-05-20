export default function QuoteCard() {
  return (
    <div className="w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 p-8 md:p-12 shadow-xl">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Transforming today&apos;s
            <br />
            opportunities
            <div className="relative">
              <span className="inline-block">into tomorrow&apos;s success</span>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400"></div>
            </div>
          </h2>

          <p className="text-2xl md:text-3xl text-white mt-4">
            Partner with someone who puts <span className="font-bold">you first.</span>
          </p>

          <div className="mt-6">
            <button className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm border border-gray-700 rounded-full px-6 py-2 transition-all">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span> COMING SOON
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-500/20 blur-xl"></div>
        <div className="absolute top-10 -right-6 w-16 h-16 rounded-full bg-indigo-400/20 blur-xl"></div>
      </div>
    </div>
  )
}
