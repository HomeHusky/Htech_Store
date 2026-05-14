'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Edit2, Plus, Search, Sparkles, Trash2, WandSparkles, XCircle } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { AIProductImportModal } from '@/components/admin/ai-product-import-modal'
import { ProductEditModal } from '@/components/admin/product-edit-modal'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { fetchAdminProducts, formatVnd, localized, type ProductDTO } from '@/lib/products-api'
import { useI18n } from '@/lib/i18n'
import { AdminTableSkeleton } from '@/components/loading-skeletons'
import { SortableTh, formatAdminDate, parseAdminDate, sortRows, toggleSort, type SortState } from '@/lib/admin-list'

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
  ai_status: 'manual',
  created_at: null,
}

type ProductSortKey = 'name' | 'sku' | 'category' | 'price' | 'stock' | 'status' | 'created'
type ProductStatusFilter = 'all' | 'selling' | 'draft' | 'out'
type ProductStockFilter = 'all' | 'in_stock' | 'low' | 'out'
type ProductAIStatusFilter = 'all' | 'pending_review' | 'confirmed' | 'ignored' | 'manual'

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

function statusKey(product: ProductDTO): Exclude<ProductStatusFilter, 'all'> {
  if (!product.available) return 'draft'
  if (product.stock <= 0) return 'out'
  return 'selling'
}

function stockKey(product: ProductDTO): Exclude<ProductStockFilter, 'all'> {
  if (product.stock <= 0) return 'out'
  if (product.stock <= 5) return 'low'
  return 'in_stock'
}

function aiStatusLabel(status?: string) {
  if (status === 'pending_review') return 'AI cho xac nhan'
  if (status === 'confirmed') return 'AI da xac nhan'
  if (status === 'ignored') return 'AI bo qua'
  return 'Thu cong'
}

function aiStatusClass(status?: string) {
  if (status === 'pending_review') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (status === 'confirmed') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'ignored') return 'border-slate-200 bg-slate-100 text-slate-500'
  return 'border-transparent bg-transparent text-muted-foreground'
}

export default function ProductsPage() {
  const { t } = useI18n()
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('all')
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('all')
  const [aiStatusFilter, setAiStatusFilter] = useState<ProductAIStatusFilter>('all')
  const [sort, setSort] = useState<SortState<ProductSortKey>>({ key: 'created', direction: 'desc' })
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [aiImportOpen, setAiImportOpen] = useState(false)
  const [updatingAIStatusId, setUpdatingAIStatusId] = useState<string | null>(null)

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

  const updateAIStatus = async (product: ProductDTO, aiStatus: 'confirmed' | 'ignored') => {
    setUpdatingAIStatusId(product.id)
    try {
      await api.patch(`/admin/products/${product.id}/ai-status`, { ai_status: aiStatus })
      await loadProducts()
    } finally {
      setUpdatingAIStatusId(null)
    }
  }

  const openAIProductForEdit = (product: ProductDTO) => {
    setAiImportOpen(false)
    openEditModal(product)
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    const rows = products.filter((product) => {
      const matchesSearch = !query || [localized(product.name), product.slug, product.brand, product.category]
        .some((value) => value.toLowerCase().includes(query))
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || statusKey(product) === statusFilter
      const matchesStock = stockFilter === 'all' || stockKey(product) === stockFilter
      const matchesAIStatus = aiStatusFilter === 'all' || (product.ai_status || 'manual') === aiStatusFilter
      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesAIStatus
    })
    return sortRows(rows, sort, {
      name: (product) => localized(product.name),
      sku: (product) => product.slug,
      category: (product) => product.category,
      price: (product) => product.basePrice,
      stock: (product) => product.stock,
      status: (product) => statusOf(product, t),
      created: (product) => parseAdminDate(product.created_at),
    })
  }, [aiStatusFilter, categoryFilter, products, search, sort, statusFilter, stockFilter, t])

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Quản lý sản phẩm" subtitle="Quản lý dữ liệu thật: giá, tồn kho, khuyến mãi và trạng thái bán" />
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-3">
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
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name.vi || category.name.en || category.id}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProductStatusFilter)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
              <option value="all">Tất cả trạng thái</option>
              <option value="selling">{t('admin.selling')}</option>
              <option value="draft">{t('admin.draft')}</option>
              <option value="out">{t('admin.out_stock')}</option>
            </select>
            <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as ProductStockFilter)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
              <option value="all">Tất cả tồn kho</option>
              <option value="in_stock">Còn hàng</option>
              <option value="low">Sắp hết</option>
              <option value="out">Hết hàng</option>
            </select>
            <select value={aiStatusFilter} onChange={(event) => setAiStatusFilter(event.target.value as ProductAIStatusFilter)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
              <option value="all">Tat ca nguon tao</option>
              <option value="pending_review">AI cho xac nhan</option>
              <option value="confirmed">AI da xac nhan</option>
              <option value="ignored">AI bo qua</option>
              <option value="manual">Thu cong</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAiImportOpen(true)} className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20">
              <WandSparkles className="h-4 w-4" />
              Them bang AI
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-blue-dark">
              <Plus className="h-4 w-4" />
              {t('admin.add_product')}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <SortableTh label={t('admin.product_name')} sortKey="name" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  <SortableTh label={t('admin.sku')} sortKey="sku" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  <SortableTh label={t('admin.category')} sortKey="category" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  <SortableTh label={t('admin.price')} sortKey="price" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  <SortableTh label={t('admin.stock')} sortKey="stock" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  <SortableTh label={t('admin.status')} sortKey="status" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  <SortableTh label="Ngày tạo" sortKey="created" sort={sort} onSort={(key) => setSort((current) => toggleSort(current, key))} />
                  {[t('admin.ai_seo'), t('admin.actions')].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <AdminTableSkeleton columns={9} rows={6} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground">
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
                          {product.ai_status && product.ai_status !== 'manual' && (
                            <span className={cn('mt-1 inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold', aiStatusClass(product.ai_status))}>
                              {aiStatusLabel(product.ai_status)}
                            </span>
                          )}
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
                        <td className="px-5 py-4 text-sm text-muted-foreground">{formatAdminDate(product.created_at)}</td>
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
                            {product.ai_status === 'pending_review' && (
                              <>
                                <button onClick={() => updateAIStatus(product, 'confirmed')} disabled={updatingAIStatusId === product.id} className="rounded-lg p-2 text-green-600 hover:bg-green-500/10 disabled:opacity-50" aria-label="Xac nhan AI">
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => updateAIStatus(product, 'ignored')} disabled={updatingAIStatusId === product.id} className="rounded-lg p-2 text-muted-foreground hover:bg-slate-500/10 disabled:opacity-50" aria-label="Bo qua AI">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
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

      <AIProductImportModal
        open={aiImportOpen}
        categories={categories}
        onClose={() => setAiImportOpen(false)}
        onCreated={loadProducts}
        onEditProduct={openAIProductForEdit}
      />

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
