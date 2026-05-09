import api from '@/lib/api'

export type ProductDTO = {
  id: string
  slug: string
  name: { vi?: string; en?: string } | string
  brand: string
  category: string
  tagline?: { vi?: string; en?: string }
  basePrice: number
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
  badge?: 'Mới' | 'Hot' | 'Sale'
  rating: number
  reviews: number
  stock: number
  colors: string[]
  category: string
  brand: string
  specs?: Record<string, string>
  description?: string
  raw: ProductDTO
}

export function formatVnd(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

export function localized(value: ProductDTO['name'] | ProductDTO['description'] | undefined, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.vi || value.en || fallback
}

function normalizeImage(image: string) {
  if (!image) return '/images/placeholder.jpg'
  if (image.startsWith('http') || image.startsWith('/images')) return image
  if (image.startsWith('/static')) {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'
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

export function toStoreProduct(product: ProductDTO): StoreProduct {
  const salePrice = product.basePrice
  const originalPrice = product.discountPercent > 0 ? Math.round(salePrice / (1 - product.discountPercent / 100)) : undefined
  return {
    id: product.id,
    slug: product.slug,
    name: localized(product.name, product.slug),
    subtitle: product.tagline?.vi || product.tagline?.en || product.brand || product.category,
    price: salePrice,
    priceFormatted: formatVnd(salePrice),
    originalPrice,
    originalPriceFormatted: originalPrice ? formatVnd(originalPrice) : undefined,
    image: normalizeImage(product.image),
    badge: product.discountPercent > 0 ? 'Sale' : product.isNew ? 'Mới' : product.trending ? 'Hot' : undefined,
    rating: product.rating || 5,
    reviews: product.reviewCount || 0,
    stock: product.stock || 0,
    colors: ['#111827', '#e5e7eb', '#2563eb'],
    category: product.category,
    brand: product.brand,
    specs: specsFromDetails(product.details, product.highlightSpecs),
    description: localized(product.description, ''),
    raw: product,
  }
}

export async function fetchProducts(params?: { category?: string; trending?: boolean }) {
  const { data } = await api.get<ProductDTO[]>('/products', { params })
  return data.map(toStoreProduct)
}

export async function fetchAdminProducts() {
  const { data } = await api.get<ProductDTO[]>('/admin/products')
  return data
}
