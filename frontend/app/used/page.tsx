'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Heart, Search, ShieldCheck, ShoppingCart, Star } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { AIConcierge } from '@/components/storefront/ai-concierge'
import { ProductGridSkeleton } from '@/components/loading-skeletons'
import { cn } from '@/lib/utils'
import { useCart, type Product } from '@/lib/store'
import { fetchProducts } from '@/lib/products-api'
import { useI18n } from '@/lib/i18n'

function isUsedDevice(product: Product) {
  const name = product.name.toLowerCase()
  return Boolean(product.isTradeIn) || name.includes('used') || name.includes('trade')
}

function UsedProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()
  const { t } = useI18n()

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault()
    addItem(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <Link href={`/products/${product.slug || product.id}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/8">
        <div className="relative h-56 overflow-hidden bg-surface">
          <Image src={product.image} alt={product.name} fill className="object-contain p-5 transition duration-500 group-hover:scale-105" />
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950">
            Máy cũ
          </span>
          <button
            onClick={(event) => {
              event.preventDefault()
              setWished(!wished)
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:scale-110"
            aria-label="Wishlist"
          >
            <Heart className={cn('h-4 w-4', wished ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star key={item} className={cn('h-3 w-3', item <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border')} />
              ))}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Đã kiểm tra
            </span>
          </div>

          <div>
            <h2 className="line-clamp-2 text-base font-bold leading-snug text-foreground">{product.name}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.subtitle}</p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-black text-foreground">{product.priceFormatted}</p>
              {product.originalPriceFormatted && <p className="text-xs text-muted-foreground line-through">{product.originalPriceFormatted}</p>}
            </div>
            <p className="text-xs font-semibold text-accent">{product.stock} {t('products.left')}</p>
          </div>

          <button
            onClick={handleAddToCart}
            className={cn('mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition', addedToCart ? 'bg-green-500 text-white' : 'bg-foreground text-background hover:bg-accent')}
          >
            <ShoppingCart className="h-4 w-4" />
            {addedToCart ? t('products.added') : t('products.quickadd')}
          </button>
        </div>
      </article>
    </Link>
  )
}

export default function UsedDevicesPage() {
  const { locale } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProducts({ locale })
      .then((items) => setProducts(items))
      .catch((error) => console.error('Failed to load used devices:', error))
      .finally(() => setLoading(false))
  }, [locale])

  const usedProducts = useMemo(() => products.filter(isUsedDevice), [products])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-surface-alt">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">HTech Certified Used</p>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Máy cũ đã kiểm tra.</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Chọn thiết bị đã qua kiểm tra tình trạng, minh bạch tồn kho và vẫn có hỗ trợ tư vấn trước khi đặt cọc.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {['Kiểm tra ngoại hình', 'Test pin và hiệu năng', 'Hỗ trợ đặt cọc'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
            <div className="relative h-full min-h-64">
              <Image src="/images/macbook-air.jpg" alt="Used devices" fill className="object-contain p-8" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{loading ? 'Đang tải' : `${usedProducts.length} sản phẩm`}</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Danh sách máy cũ</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">
            Xem tất cả sản phẩm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : usedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {usedProducts.map((product) => (
              <UsedProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-xl font-bold text-foreground">Chưa có máy cũ đang bán</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Khi backend có sản phẩm `is_trade_in`, trang này sẽ tự hiển thị đúng danh sách.
            </p>
          </div>
        )}
      </section>

      <Footer />
      <AIConcierge />
    </main>
  )
}
