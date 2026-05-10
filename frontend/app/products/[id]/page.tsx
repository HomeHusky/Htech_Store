'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronLeft,
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  Share2,
  Zap,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useI18n } from '@/lib/i18n'
import { useCart, type Product } from '@/lib/store'
import { fetchProduct, fetchProducts } from '@/lib/products-api'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [wished, setWished] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState<'specs' | 'description'>('specs')
  
  const { locale, t } = useI18n()
  const { addItem } = useCart()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')

    fetchProduct(id, locale)
      .then(async (item) => {
        if (cancelled) return
        setProduct(item)
        const products = await fetchProducts({ locale })
        if (!cancelled) {
          setRelatedProducts(
            products
              .filter((candidate) => candidate.category === item.category && candidate.id !== item.id)
              .slice(0, 4),
          )
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Không tìm thấy sản phẩm này.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, locale])

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-sm text-muted-foreground sm:px-6 lg:px-8">
          Đang tải chi tiết sản phẩm...
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-lg font-semibold text-foreground">{loadError || 'Không tìm thấy sản phẩm.'}</p>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
            <ChevronLeft className="h-4 w-4" />
            Quay lại sản phẩm
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">Sản phẩm</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Back button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>

        {/* Product details */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square rounded-3xl bg-surface overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Badge */}
            {product.badge && (
              <span
                className={cn(
                  'absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider',
                  product.badge === 'New'
                    ? 'bg-accent text-accent-foreground'
                    : product.badge === 'Hot'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-400 text-amber-900',
                )}
              >
                {product.badge === 'Hot' && <Flame className="inline w-4 h-4 mr-1" />}
                {product.badge === 'New' && <Zap className="inline w-4 h-4 mr-1" />}
                {product.badge}
              </span>
            )}
            {/* Actions */}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
              <button
                onClick={() => setWished(!wished)}
                className={cn(
                  'w-12 h-12 rounded-full bg-background/90 backdrop-blur shadow-lg flex items-center justify-center transition-all hover:scale-105',
                  wished && 'bg-red-50'
                )}
                aria-label="Add to wishlist"
              >
                <Heart
                  className={cn('w-5 h-5', wished ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
                />
              </button>
              <button
                className="w-12 h-12 rounded-full bg-background/90 backdrop-blur shadow-lg flex items-center justify-center transition-all hover:scale-105"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews.toLocaleString()} {t('products.reviews')})
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{product.subtitle}</p>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-black text-foreground">{product.priceFormatted}</span>
              {product.originalPriceFormatted && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPriceFormatted}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold dark:bg-red-900/30 dark:text-red-400">
                    -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">
                {t('product.color')}
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 relative',
                      selectedColor === i ? 'border-accent scale-110' : 'border-transparent',
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Color option ${i + 1}`}
                  >
                    {selectedColor === i && (
                      <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">
                {t('product.quantity')}
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-16 h-12 text-center border border-border rounded-xl font-semibold bg-background"
                  min={1}
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className={cn(
                  'ml-4 text-sm font-medium',
                  product.stock <= 5 ? 'text-red-500' : 'text-green-600'
                )}>
                  {product.stock <= 5 ? (
                    <>{t('products.only')} {product.stock} {t('products.left')}</>
                  ) : (
                    <>{t('product.instock')}: {product.stock}</>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className={cn(
                  'flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg transition-all duration-200',
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-foreground text-background hover:bg-accent'
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t('products.added')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {t('product.addtocart')}
                  </>
                )}
              </button>
              <Link
                href="/cart"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                {t('product.buynow')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-surface border border-border">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-xs font-medium text-foreground">{t('product.shipping')}</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-xs font-medium text-foreground">{t('product.warranty')}</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-xs font-medium text-foreground">{t('product.return')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('specs')}
              className={cn(
                'px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                activeTab === 'specs'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t('product.specs')}
            </button>
            <button
              onClick={() => setActiveTab('description')}
              className={cn(
                'px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                activeTab === 'description'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t('product.description')}
            </button>
          </div>
          <div className="py-8">
            {activeTab === 'specs' && product.specs && (
              <div className="max-w-2xl">
                <dl className="divide-y divide-border">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="py-4 flex justify-between gap-4">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="font-medium text-foreground text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || 'Không có mô tả cho sản phẩm này.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-foreground mb-8">
              {t('product.related')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/products/${p.slug || p.id}`}>
                  <article className="group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-44 bg-surface overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground truncate">{p.name}</h3>
                      <p className="text-sm text-muted-foreground truncate mb-2">{p.subtitle}</p>
                      <p className="font-black text-foreground">{p.priceFormatted}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
