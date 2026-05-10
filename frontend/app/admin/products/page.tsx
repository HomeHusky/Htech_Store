'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { ProductEditModal } from '@/components/admin/product-edit-modal'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { fetchAdminProducts, formatVnd, localized, type ProductDTO } from '@/lib/products-api'
import { useI18n } from '@/lib/i18n'

type Category = {
  id: string
  slug: string
  name: { vi: string; en: string }
}

const emptyProduct: ProductDTO = {
  id: '',
  slug: '',
  name: { vi: '', en: '' },
  brand: 'Htech',
  category: 'laptop',
  tagline: { vi: '', en: '' },
  basePrice: 1000000,
  is_trade_in: false,
  image: '/images/placeholder.jpg',
  gallery: [],
  description: { vi: '', en: '' },
  details: {},
  highlightSpecs: [],
  available: true,
  trending: false,
  isNew: false,
  stock: 10,
  rating: 5,
  reviewCount: 0,
  discountPercent: 0,
}

function statusOf(product: ProductDTO, t: any) {
  if (!product.available) return t('admin.draft')
  if (product.stock <= 0) return t('admin.out_stock')
  return t('admin.selling')
}

function statusClass(product: ProductDTO) {
  if (!product.available) return 'border-slate-200 bg-slate-100 text-slate-500'
  if (product.stock <= 0) return 'border-red-200 bg-red-50 text-red-600'
  return 'border-green-200 bg-green-50 text-green-700'
}

export default function ProductsPage() {
  const { t } = useI18n()
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const [productRows, categoryRows] = await Promise.all([
        fetchAdminProducts(),
        api.get<Category[]>('/admin/categories').then((response) => response.data).catch(() => []),
      ])
      setProducts(productRows)
      setCategories(categoryRows)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openCreateModal = () => {
    setSelectedProduct({
      ...emptyProduct,
      category: categories[0]?.id || emptyProduct.category,
    })
    setProductModalOpen(true)
  }

  const openEditModal = (product: ProductDTO) => {
    setSelectedProduct({
      ...emptyProduct,
      ...product,
      tagline: product.tagline || { vi: '', en: '' },
      gallery: product.gallery || [],
      description: product.description || { vi: '', en: '' },
      details: product.details || {},
      highlightSpecs: product.highlightSpecs || [],
      is_trade_in: product.is_trade_in || false,
    })
    setProductModalOpen(true)
  }

  const saveProduct = async (product: ProductDTO) => {
    const payload = { ...product, id: product.id || undefined } as any
    if (product.id) {
      await api.put(`/admin/products/${product.id}`, payload)
    } else {
      await api.post('/admin/products', payload)
    }
    setProductModalOpen(false)
    setSelectedProduct(null)
    await loadProducts()
  }

  const optimizeAI = async (product: ProductDTO) => {
    setOptimizingId(product.id)
    await api.patch(`/admin/products/${product.id}/promo`, { trending: true, discount: product.discountPercent })
    await loadProducts()
    setOptimizingId(null)
  }

  const deleteProduct = async (product: ProductDTO) => {
    if (!confirm(t('admin.confirm_delete') + ` "${localized(product.name)}"?`)) return
    await api.delete(`/admin/products/${product.id}`)
    await loadProducts()
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return products
    return products.filter((product) =>
      [localized(product.name), product.slug, product.brand, product.category]
        .some((value) => value.toLowerCase().includes(query)),
    )
  }, [products, search])

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Quản lý sản phẩm" subtitle="Quản lý dữ liệu thật: giá, tồn kho, khuyến mãi và trạng thái bán" />
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('admin.search_placeholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-64 rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-accent"
            />
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-blue-dark">
            <Plus className="h-4 w-4" />
            {t('admin.add_product')}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    t('admin.product_name'),
                    t('admin.sku'),
                    t('admin.category'),
                    t('admin.price'),
                    t('admin.stock'),
                    t('admin.status'),
                    t('admin.ai_seo'),
                    t('admin.actions'),
                  ].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      {t('admin.loading')}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Không có sản phẩm phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const isOptimizing = optimizingId === product.id
                    const status = statusOf(product, t)
                    return (
                      <tr key={product.id} className="transition hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <p className="max-w-[240px] truncate text-sm font-semibold text-foreground">{localized(product.name)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-mono text-muted-foreground">{product.slug}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">{product.category}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-foreground">{formatVnd(product.basePrice)}</p>
                          {product.discountPercent > 0 && <p className="text-xs text-red-500">-{product.discountPercent}%</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className={cn('text-sm font-semibold', product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-foreground')}>{product.stock}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-semibold', statusClass(product))}>{status}</span>
                        </td>
                        <td className="px-5 py-4">
                          {product.trending ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                              <Sparkles className="h-3.5 w-3.5" />
                              Đã tối ưu
                            </span>
                          ) : (
                            <button onClick={() => optimizeAI(product)} disabled={isOptimizing} className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-60">
                              <Sparkles className={cn('h-3 w-3', isOptimizing && 'animate-spin')} />
                              {isOptimizing ? t('admin.optimizing') : t('admin.optimize')}
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(product)} className="flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary">
                              <Edit2 className="h-3 w-3" />
                              {t('common.edit')}
                            </button>
                            <button onClick={() => deleteProduct(product)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" aria-label={t('common.delete')}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductEditModal
        product={selectedProduct}
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onSave={saveProduct}
        categories={categories}
      />
    </div>
  )
}
