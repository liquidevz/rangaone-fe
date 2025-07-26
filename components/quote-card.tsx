export default function QuoteCard() {
  return (
    <div className="w-full max-w-9xl mx-auto md:max-w-none md:relative md:left-1/2 md:-ml-[50vw] md:w-screen">
      {/* Mobile: Card-style banner */}
      <div className="block md:hidden rounded-3xl shadow-xl overflow-hidden h-48">
        <img 
          src="landing-page/quotemobile.png"
          alt="Inspiring quote" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Desktop: Full-width banner */}
      <div className="hidden md:block h-96">
        <img 
          src="landing-page/webquote.png"
          alt="Inspiring quote" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}