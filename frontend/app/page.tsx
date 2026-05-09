import { Navbar } from '@/components/storefront/navbar'
import { Hero } from '@/components/storefront/hero'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { ProductSection } from '@/components/storefront/product-section'
import { TrustSignals } from '@/components/storefront/trust-signals'
import { Footer } from '@/components/storefront/footer'
import { AIConcierge } from '@/components/storefront/ai-concierge'

export default function StorefrontPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <CategoryGrid />
      <ProductSection />
      <TrustSignals />
      <Footer />
      <AIConcierge />
    </main>
  )
}
