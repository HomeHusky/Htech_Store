'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Flame, Heart, ShoppingCart, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart, allProducts, type Product } from '@/lib/store'
import { fetchProducts } from '@/lib/products-api'
import { useI18n } from '@/lib/i18n'
import { ProductGridSkeleton } from '@/components/loading-skeletons'

const filters = ['all', 'iphone', 'android', 'macbook', 'windows', 'pc', 'tablet', 'accessory', 'used']

function normalizeCategory(value?: string | null) {
  const key = (value || '').trim().toLowerCase()
  const aliases: Record<string, string> = {
    iphone: 'phone',
    android: 'phone',
    smartphone: 'phone',
    mobile: 'phone',
    phone: 'phone',
    macbook: 'laptop',
    windows: 'laptop',
    window: 'laptop',
    lapwindow: 'laptop',
    windowslaptop: 'laptop',
    laptop: 'laptop',
    gaming: 'pc',
    pcgaming: 'pc',
    pc: 'pc',
    accessories: 'accessory',
    accessory: 'accessory',
    tablet: 'tablet',
    all: 'all',
  }
  return aliases[key] || key
}

function productMatchesFilter(product: Product, filter: string) {
  if (filter === 'all') return true
  const category = normalizeCategory(product.category)
  const name = product.name.toLowerCase()
  const brand = product.brand.toLowerCase()
  const isApple = brand.includes('apple') || name.includes('iphone') || name.includes('macbook')

  if (filter === 'iphone') return category === 'phone' && (brand.includes('apple') || name.includes('iphone'))
  if (filter === 'android') return category === 'phone' && !isApple
  if (filter === 'macbook') return category === 'laptop' && (brand.includes('apple') || name.includes('macbook'))
  if (filter === 'windows') return category === 'laptop' && !isApple
  if (filter === 'used') return Boolean(product.isTradeIn) || name.includes('used') || name.includes('trade')

  return category === filter
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n()
  const [wished, setWished] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/8">
      {product.badge && (
        <span
          className={cn(
            'absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
            product.badge === 'Mới' || product.badge === 'New'
              ? 'bg-accent text-accent-foreground'
              : product.badge === 'Hot'
                ? 'bg-red-500 text-white'
                : 'bg-amber-400 text-amber-900',
          )}
        >
          {product.badge === 'Hot' && <Flame className="mr-0.5 inline h-2.5 w-2.5" />}
          {(product.badge === 'Mới' || product.badge === 'New') && <Zap className="mr-0.5 inline h-2.5 w-2.5" />}
          {product.badge}
        </span>
      )}

      <button
        onClick={() => setWished(!wished)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur transition hover:scale-110 group-hover:opacity-100"
        aria-label={t('common.add')}
      >
        <Heart className={cn('h-4 w-4', wished ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
      </button>

      <Link href={`/products/${product.slug || product.id}`} className="relative h-52 overflow-hidden bg-surface">
        <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn('h-3 w-3', i <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border')} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviews.toLocaleString()})
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold leading-snug text-foreground">{product.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.subtitle}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black text-foreground">{product.priceFormatted}</p>
            {product.originalPriceFormatted && <p className="text-xs text-muted-foreground line-through">{product.originalPriceFormatted}</p>}
          </div>
          {product.stock <= 5 && <p className="text-xs font-semibold text-red-500">{t('products.only')} {product.stock} {t('products.left')}</p>}
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
  )
}

export function ProductSection() {
  const { locale, t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [products, setProducts] = useState<Product[]>(allProducts)
  const [loading, setLoading] = useState(true)

  const filterLabels: Record<string, string> = {
    all: t('products.all'),
    iphone: t('nav.iphone'),
    android: t('nav.android'),
    macbook: t('nav.macbook'),
    windows: t('nav.windows'),
    pc: t('nav.gaming'),
    tablet: 'Tablet',
    accessory: t('nav.accessories'),
    used: t('nav.used'),
  }

  useEffect(() => {
    setLoading(true)
    fetchProducts({ locale })
      .then((items) => setProducts(items))
      .catch((error) => console.error('Failed to load featured products:', error))
      .finally(() => setLoading(false))
  }, [locale])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible')),
      { threshold: 0.05 },
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const filteredProducts = (activeFilter === 'all'
    ? products
    : products.filter((product) => productMatchesFilter(product, activeFilter))
  ).slice(0, 8)
  const viewAllHref =
    activeFilter === 'all'
      ? '/products'
      : activeFilter === 'used'
        ? '/used'
        : ['iphone', 'android', 'macbook', 'windows'].includes(activeFilter)
          ? `/products?segment=${activeFilter}`
          : `/products?category=${activeFilter}`

  return (
    <section ref={sectionRef} id="products" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">{t('products.featured')}</p>
            <h2 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl">{t('products.title')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn('rounded-lg px-4 py-2 text-sm font-medium transition', activeFilter === filter ? 'bg-foreground text-background' : 'border border-border bg-secondary text-secondary-foreground hover:bg-muted')}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton className="reveal delay-100" count={8} />
        ) : (
          <div className="reveal delay-100 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="reveal delay-200 mt-10 flex justify-center">
          <Link href={viewAllHref} className="rounded-lg border border-border px-8 py-3 text-sm font-semibold text-muted-foreground transition hover:border-foreground hover:text-foreground">
            {t('products.viewall')}
          </Link>
        </div>
      </div>
    </section>
  )
}
