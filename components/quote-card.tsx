export default function QuoteCard() {
  return (
    <div className="w-full max-w-2xl md:max-w-7xl">
      <div className="relative overflow-hidden rounded-xl bg-trasnparent md:p-12 shadow-xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/Quote.jpg)' }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80" />
        
        <div className="relative z-10 flex flex-col py-10 md:py-20 px-5 md:px-12">
          <h2 className="text-3xl md:text-7xl font-bold text-[#FFFFF0] leading-tight">
            Transforming today&apos;s opportunities
            <div className="relative">
              <span className="inline-block">into tomorrow&apos;s success</span>
              <div className="absolute top-20 left-0 w-full h-[2px] bg-blue-400"></div>
            </div>
          </h2>

          <p className="text-xm md:text-3xl text-[#FFFFF0] mt-4">
            Partner with someone who puts <span className="font-bold">you first.</span>
          </p>

        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-500/20 blur-xl z-5"></div>
        <div className="absolute top-10 -right-6 w-16 h-16 rounded-full bg-indigo-400/20 blur-xl z-5"></div>
      </div>
    </div>
  )
}
