'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Heart,
  ShoppingCart,
  ChevronDown,
  Grid3X3,
  LayoutList,
  Flame,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useI18n } from '@/lib/i18n'
import { useCart, allProducts, type Product } from '@/lib/store'
import { fetchProducts } from '@/lib/products-api'

const categories = ['Tất cả', 'iPhone', 'MacBook', 'Gaming', 'Accessories']
const brands = ['Apple', 'ASUS', 'Samsung', 'HTech Custom']
const priceRanges = [
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 30 triệu', min: 10000000, max: 30000000 },
  { label: '30 - 50 triệu', min: 30000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: Infinity },
]
const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'popular', label: 'Phổ biến nhất' },
]

function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()
  const { t } = useI18n()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <Link href={`/products/${product.id}`}>
      <article className="group relative bg-card rounded-2xl border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/8">
        {product.badge && (
          <span
            className={cn(
              'absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
            product.badge === 'Mới' || product.badge === 'New'
                ? 'bg-accent text-accent-foreground'
                : product.badge === 'Hot'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-400 text-amber-900',
            )}
          >
            {product.badge === 'Hot' && <Flame className="inline w-2.5 h-2.5 mr-0.5" />}
            {(product.badge === 'Mới' || product.badge === 'New') && <Zap className="inline w-2.5 h-2.5 mr-0.5" />}
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished) }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart
            className={cn('w-4 h-4 transition-colors', wished ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
          />
        </button>

        <div className="relative h-52 bg-surface overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-foreground text-background hover:bg-accent',
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              {addedToCart ? t('products.added') : t('products.quickadd')}
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3',
                    i <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-border',
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviews.toLocaleString()})
            </span>
          </div>

          <div>
            <h3 className="font-bold text-foreground text-base leading-snug">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{product.subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-lg font-black text-foreground">{product.priceFormatted}</p>
              {product.originalPriceFormatted && (
                <p className="text-xs text-muted-foreground line-through">{product.originalPriceFormatted}</p>
              )}
            </div>
            {product.stock <= 5 && (
              <p className="text-xs font-semibold text-red-500 animate-pulse">
                {t('products.only')} {product.stock} {t('products.left')}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Tất cả')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [products, setProducts] = useState<Product[]>(allProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const category = searchParams.get('category')
    const badge = searchParams.get('badge')
    const search = searchParams.get('search')
    
    if (category) setSelectedCategory(category)
    if (badge === 'Sale') setSelectedCategory('Tất cả')
    if (search) setSearchQuery(search)
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
      .then((items) => setProducts(items))
      .catch((error) => console.error('Failed to fetch products:', error))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(p => p.category === selectedCategory)
    }

    // Badge filter (from URL)
    if (searchParams.get('badge') === 'Sale') {
      result = result.filter(p => p.badge === 'Sale')
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand))
    }

    // Price filter
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange]
      result = result.filter(p => p.price >= range.min && p.price < range.max)
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        result.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // newest - keep original order
        break
    }

    return result
  }, [products, searchQuery, selectedCategory, selectedBrands, selectedPriceRange, sortBy, searchParams])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Tất cả')
    setSelectedBrands([])
    setSelectedPriceRange(null)
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'Tất cả' || selectedBrands.length > 0 || selectedPriceRange !== null

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
            {selectedCategory === 'Tất cả' ? t('products.title') : selectedCategory}
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Đang tải sản phẩm...' : `${filteredProducts.length} ${t('cart.items')}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t('common.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  {t('filter.category')}
                </label>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedCategory === cat
                          ? 'bg-foreground text-background font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  {t('filter.price')}
                </label>
                <div className="space-y-1">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedPriceRange === i
                          ? 'bg-foreground text-background font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  {t('filter.brand')}
                </label>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand])
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand))
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  {t('filter.clear')}
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Mobile filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('filter.title')}
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground hidden sm:inline">
                  {t('filter.sort')}:
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-background border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* View mode */}
              <div className="flex items-center gap-1 border border-border rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <div className={cn(
                'grid gap-5',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-xl font-semibold text-foreground mb-2">
                  {t('search.noresults')}
                </p>
                <p className="text-muted-foreground mb-6">
                  Thử thay đổi từ khóa hoặc bộ lọc của bạn
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:bg-accent transition-colors"
                >
                  {t('filter.clear')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-background border-l border-border overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('filter.title')}</h2>
              <button onClick={() => setFilterOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Same filters as desktop */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{t('common.search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">{t('filter.category')}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm transition-colors',
                        selectedCategory === cat
                          ? 'bg-foreground text-background font-medium'
                          : 'border border-border hover:bg-muted'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">{t('filter.price')}</label>
                <div className="space-y-2">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors',
                        selectedPriceRange === i
                          ? 'bg-foreground text-background font-medium'
                          : 'border border-border hover:bg-muted'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">{t('filter.brand')}</label>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand])
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand))
                          }
                        }}
                        className="w-5 h-5 rounded border-border text-accent"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-background border-t border-border px-5 py-4 flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  {t('filter.clear')}
                </button>
              )}
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-accent transition-colors"
              >
                {t('filter.apply')} ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <Navbar />
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground sm:px-6 lg:px-8">
            Dang tai san pham...
          </div>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
