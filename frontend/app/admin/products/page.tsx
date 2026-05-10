'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Check, Edit2, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
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

function statusOf(product: ProductDTO, t: any) {
  if (!product.available) return t('admin.draft')
  if (product.stock <= 0) return t('admin.out_stock')
  return t('admin.selling')
}

const statusConfig = {
  'Đang bán': 'border-green-200 bg-green-50 text-green-700',
  'Hết hàng': 'border-red-200 bg-red-50 text-red-600',
  'Nháp': 'border-slate-200 bg-slate-100 text-slate-500',
}

const emptyProduct: ProductDTO = {
  id: '',
  slug: '',
  name: { vi: '', en: '' },
  brand: 'Htech',
  category: 'laptop',
  tagline: { vi: '', en: '' },
  basePrice: 1000000,
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function ProductsPage() {
  const { t } = useI18n()
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ price: string; stock: string; discount: string; image: string; gallery: string }>({
    price: '',
    stock: '',
    discount: '',
    image: '',
    gallery: '',
  })
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState<ProductDTO>(emptyProduct)

  const loadProducts = async () => {
    setLoading(true)
    try {
      setProducts(await fetchAdminProducts())
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const startEdit = (product: ProductDTO) => {
    setEditingId(product.id)
    setEditValues({
      price: String(product.basePrice),
      stock: String(product.stock),
      discount: String(product.discountPercent),
      image: product.image || '',
      gallery: (product.gallery || []).join('\n'),
    })
  }

  const saveEdit = async (product: ProductDTO) => {
    const gallery = editValues.gallery
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
    const updated = {
      ...product,
      basePrice: Number(editValues.price) || product.basePrice,
      stock: Number(editValues.stock),
      discountPercent: Number(editValues.discount) || 0,
      available: Number(editValues.stock) > 0,
      image: editValues.image.trim() || product.image,
      gallery,
    }
    await api.put(`/admin/products/${product.id}`, updated)
    setEditingId(null)
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

  const createProduct = async () => {
    if (!localized(newProduct.name) || !newProduct.slug) return
    await api.post('/admin/products', newProduct)
    setShowAddModal(false)
    setNewProduct(emptyProduct)
    await loadProducts()
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return products
    return products.filter((product) =>
      [localized(product.name), product.slug, product.brand, product.category].some((value) => value.toLowerCase().includes(query)),
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
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-blue-dark">
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
                ) : (
                  filtered.map((product) => {
                    const isEditing = editingId === product.id
                    const isOptimizing = optimizingId === product.id
                    const status = statusOf(product, t)
                    return (
                      <Fragment key={product.id}>
                      <tr className="transition hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <p className="max-w-[220px] truncate text-sm font-semibold text-foreground">{localized(product.name)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-mono text-muted-foreground">{product.slug}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">{product.category}</td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input value={editValues.price} onChange={(event) => setEditValues((value) => ({ ...value, price: event.target.value }))} className="w-32 rounded-lg border border-accent bg-blue-light px-2 py-1 text-sm font-bold text-foreground outline-none" />
                          ) : (
                            <p className="text-sm font-bold text-foreground">{formatVnd(product.basePrice)}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input value={editValues.stock} onChange={(event) => setEditValues((value) => ({ ...value, stock: event.target.value }))} className="w-20 rounded-lg border border-accent bg-blue-light px-2 py-1 text-sm font-bold text-foreground outline-none" />
                          ) : (
                            <p className={cn('text-sm font-semibold', product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-foreground')}>{product.stock}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-semibold', statusConfig[status])}>{status}</span>
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
                            {isEditing ? (
                              <button onClick={() => saveEdit(product)} className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600">
                                <Check className="h-3.5 w-3.5" />
                                {t('common.save')}
                              </button>
                            ) : (
                              <button onClick={() => startEdit(product)} className="flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary">
                                <Edit2 className="h-3 w-3" />
                                {t('common.edit')}
                              </button>
                            )}
                            <button onClick={() => deleteProduct(product)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="bg-muted/20">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                              <Input label={t('admin.image')} value={editValues.image} onChange={(value) => setEditValues((current) => ({ ...current, image: value }))} />
                              <label className="block text-sm font-medium text-foreground">
                                {t('admin.gallery')}
                                <textarea
                                  value={editValues.gallery}
                                  onChange={(event) => setEditValues((current) => ({ ...current, gallery: event.target.value }))}
                                  rows={3}
                                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                                />
                              </label>
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-foreground/60" onClick={() => setShowAddModal(false)} aria-label="Đóng" />
          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">{t('admin.add_product')}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label={t('admin.product_name')} value={localized(newProduct.name)} onChange={(value) => setNewProduct({ ...newProduct, name: { vi: value, en: value }, slug: newProduct.slug || slugify(value) })} />
              <Input label={t('admin.slug')} value={newProduct.slug} onChange={(value) => setNewProduct({ ...newProduct, slug: slugify(value) })} />
              <Input label={t('admin.brand')} value={newProduct.brand} onChange={(value) => setNewProduct({ ...newProduct, brand: value })} />
              <Input label={t('admin.category')} value={newProduct.category} onChange={(value) => setNewProduct({ ...newProduct, category: value })} />
              <Input label={t('admin.price')} value={String(newProduct.basePrice)} onChange={(value) => setNewProduct({ ...newProduct, basePrice: Number(value) || 0 })} />
              <Input label={t('admin.stock')} value={String(newProduct.stock)} onChange={(value) => setNewProduct({ ...newProduct, stock: Number(value) || 0 })} />
              <Input label={t('admin.image')} value={newProduct.image} onChange={(value) => setNewProduct({ ...newProduct, image: value })} className="sm:col-span-2" />
              <label className="block text-sm font-medium text-foreground sm:col-span-2">
                {t('admin.gallery')}
                <textarea
                  value={(newProduct.gallery || []).join('\n')}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      gallery: event.target.value
                        .split(/\r?\n|,/)
                        .map((url) => url.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={createProduct} className="h-10 flex-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
                {t('admin.add_new')}
              </button>
              <button onClick={() => setShowAddModal(false)} className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={cn('block text-sm font-medium text-foreground', className)}>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
    </label>
  )
}
