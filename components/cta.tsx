export default function CTA() {
  return (
    <section className="py-20 bg-[#051838] text-[#FFFFF0]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Investing?</h2>
        <p className="max-w-2xl mx-auto mb-10 text-gray-300">
          Join thousands of investors who trust RangaOne FINWALA for their financial future. Get access to expert
          recommendations, portfolio management, and personalized advice.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-[#051838] font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors">
            Create Account
          </button>
          <button className="border-2 border-white text-[#FFFFF0] font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
