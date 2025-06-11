import { ImageTrailHero } from "@/components/image-trail-hero"
import PricingSection from "@/components/pricing-section"
import QuoteSection from "@/components/quote-section"
import Footer from "@/components/footer"
import { ModalPortfolioList } from "@/components/modal-portfolio-list"
import FAQContactSection from "@/components/faq-contact-section"
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <ImageTrailHero />
      <PricingSection />
      <QuoteSection />
      <ModalPortfolioList />
      <FAQContactSection />
      <Footer />
    </main>
  )
}
