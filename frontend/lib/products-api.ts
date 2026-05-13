import api from '@/lib/api'

export type ProductDTO = {
  id: string
  slug: string
  name: { vi?: string; en?: string } | string
  brand: string
  category: string
  tagline?: { vi?: string; en?: string }
  basePrice: number
  is_trade_in?: boolean
  image: string
  gallery?: string[]
  description?: { vi?: string; en?: string } | string
  details?: Record<string, unknown>
  highlightSpecs?: string[]
  available: boolean
  trending: boolean
  isNew: boolean
  stock: number
  rating: number
  reviewCount: number
  discountPercent: number
}

export type ProductSearchRow = {
  id: string
  slug: string
  name: { vi?: string; en?: string } | string
  category: string
  price: number
  is_trade_in?: boolean
  image: string
  available: boolean
  discount: number
  details?: Record<string, unknown>
  search_score?: number
}

export type StoreProduct = {
  id: string
  slug: string
  name: string
  subtitle: string
  price: number
  priceFormatted: string
  originalPrice?: number
  originalPriceFormatted?: string
  image: string
  badge?: 'Mới' | 'New' | 'Hot' | 'Sale'
  rating: number
  reviews: number
  stock: number
  colors: string[]
  category: string
  brand: string
  isTradeIn: boolean
  specs?: Record<string, string>
  description?: string
  raw: ProductDTO
}

export function formatVnd(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

export function localized(value: ProductDTO['name'] | ProductDTO['description'] | undefined, fallback = '', locale: 'vi' | 'en' = 'vi') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[locale] || value.vi || value.en || fallback
}

function normalizeImage(image: string) {
  if (!image) return '/images/placeholder.jpg'
  if (image.startsWith('http') || image.startsWith('/images')) return image
  if (image.startsWith('/static')) {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8000`
    return `${base.replace(/\/$/, '')}${image}`
  }
  return image.startsWith('/') ? image : `/${image}`
}

function specsFromDetails(details?: Record<string, unknown>, highlightSpecs?: string[]) {
  const specs: Record<string, string> = {}
  if (highlightSpecs?.length) {
    highlightSpecs.forEach((spec, index) => {
      specs[`Thông số ${index + 1}`] = spec
    })
  }
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        specs[key] = String(value)
      }
    })
  }
  return specs
}

function normalizeCategory(value?: string | null) {
  const key = (value || '').trim().toLowerCase()
  const aliases: Record<string, string> = {
    all: '',
    iphone: 'phone',
    smartphone: 'phone',
    mobile: 'phone',
    phone: 'phone',
    android: 'phone',
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
    phukien: 'accessory',
    tablet: 'tablet',
  }
  return aliases[key] ?? key
}

export function toStoreProduct(product: ProductDTO, locale: 'vi' | 'en' = 'vi'): StoreProduct {
  const salePrice = product.basePrice
  const originalPrice = product.discountPercent > 0 ? Math.round(salePrice / (1 - product.discountPercent / 100)) : undefined
  return {
    id: product.id,
    slug: product.slug,
    name: localized(product.name, product.slug, locale),
    subtitle: product.tagline?.[locale] || product.tagline?.vi || product.tagline?.en || product.brand || product.category,
    price: salePrice,
    priceFormatted: formatVnd(salePrice),
    originalPrice,
    originalPriceFormatted: originalPrice ? formatVnd(originalPrice) : undefined,
    image: normalizeImage(product.image),
    badge: product.discountPercent > 0 ? 'Sale' : product.isNew ? (locale === 'vi' ? 'Mới' : 'New') : product.trending ? 'Hot' : undefined,
    rating: product.rating || 5,
    reviews: product.reviewCount || 0,
    stock: product.stock || 0,
    colors: ['#111827', '#e5e7eb', '#2563eb'],
    category: product.category,
    brand: product.brand,
    isTradeIn: Boolean(product.is_trade_in),
    specs: specsFromDetails(product.details, product.highlightSpecs),
    description: localized(product.description, '', locale),
    raw: product,
  }
}

export async function fetchProducts(params?: { category?: string; trending?: boolean; locale?: 'vi' | 'en' }) {
  const { locale, ...apiParams } = params || {}
  const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('htech-locale') : null
  const effectiveLocale = locale || (storedLocale === 'en' ? 'en' : 'vi')
  const category = normalizeCategory(apiParams.category)
  const { data } = await api.get<ProductDTO[]>('/products', {
    params: { ...apiParams, category: category || undefined },
  })
  const products = category
    ? data.filter((product) => normalizeCategory(product.category) === category)
    : data
  return products.map((product) => toStoreProduct(product, effectiveLocale))
}

export async function fetchProduct(slugOrId: string, locale?: 'vi' | 'en') {
  const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('htech-locale') : null
  const effectiveLocale = locale || (storedLocale === 'en' ? 'en' : 'vi')
  const { data } = await api.get<ProductDTO>(`/products/${encodeURIComponent(slugOrId)}`)
  return toStoreProduct(data, effectiveLocale)
}

function searchRowToStoreProduct(product: ProductSearchRow, locale: 'vi' | 'en' = 'vi'): StoreProduct {
  return toStoreProduct({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: typeof product.details?.brand === 'string' ? product.details.brand : 'Htech',
    category: product.category,
    tagline: {},
    basePrice: product.price,
    is_trade_in: product.is_trade_in,
    image: product.image,
    gallery: [],
    description: {},
    details: product.details || {},
    highlightSpecs: [],
    available: product.available,
    trending: false,
    isNew: false,
    stock: 0,
    rating: 5,
    reviewCount: 0,
    discountPercent: product.discount || 0,
  }, locale)
}

export async function searchProducts(query: string, params?: { category?: string; locale?: 'vi' | 'en'; limit?: number }) {
  const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('htech-locale') : null
  const effectiveLocale = params?.locale || (storedLocale === 'en' ? 'en' : 'vi')
  const category = normalizeCategory(params?.category)
  const { data } = await api.get<{ products: ProductSearchRow[] }>('/products/search', {
    params: { q: query, category: category || undefined, limit: params?.limit },
  })
  return data.products.map((product) => searchRowToStoreProduct(product, effectiveLocale))
}

export async function fetchAdminProducts() {
  const { data } = await api.get<ProductDTO[]>('/admin/products')
  return data
}
