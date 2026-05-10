'use client'

import { useEffect, useState } from 'react'
import { Save, Upload, X } from 'lucide-react'
import api from '@/lib/api'
import type { ProductDTO } from '@/lib/products-api'

type Category = {
  id: string
  slug: string
  name: { vi: string; en: string }
}

type LocalizedValue = { vi?: string; en?: string } | string | undefined

const defaultProduct: ProductDTO = {
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

function localizedField(value: LocalizedValue, locale: 'vi' | 'en') {
  if (!value) return ''
  if (typeof value === 'string') return locale === 'vi' ? value : ''
  return value[locale] || ''
}

function localizedObject(value: LocalizedValue) {
  if (!value) return { vi: '', en: '' }
  if (typeof value === 'string') return { vi: value, en: '' }
  return { vi: value.vi || '', en: value.en || '' }
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

function splitList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeProduct(product: ProductDTO) {
  return {
    ...defaultProduct,
    ...product,
    name: localizedObject(product.name),
    tagline: localizedObject(product.tagline),
    description: localizedObject(product.description),
    gallery: product.gallery || [],
    details: product.details || {},
    highlightSpecs: product.highlightSpecs || [],
    is_trade_in: product.is_trade_in || false,
  }
}

interface ProductEditModalProps {
  product: ProductDTO | null
  isOpen: boolean
  onClose: () => void
  onSave: (product: ProductDTO) => Promise<void>
  categories: Category[]
}

export function ProductEditModal({ product, isOpen, onClose, onSave, categories }: ProductEditModalProps) {
  const [formData, setFormData] = useState<ProductDTO>(defaultProduct)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryUrlsText, setGalleryUrlsText] = useState('')
  const [highlightSpecsText, setHighlightSpecsText] = useState('')
  const [detailsText, setDetailsText] = useState('{}')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!product) return
    const next = normalizeProduct(product)
    setFormData(next)
    setImagePreview(next.image || '')
    setImageFile(null)
    setGalleryFiles([])
    setGalleryUrlsText((next.gallery || []).join('\n'))
    setHighlightSpecsText((next.highlightSpecs || []).join('\n'))
    setDetailsText(JSON.stringify(next.details || {}, null, 2))
    setError('')
  }, [product, isOpen])

  const handleInputChange = <K extends keyof ProductDTO>(key: K, value: ProductDTO[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleLocalizedChange = (key: 'name' | 'tagline' | 'description', locale: 'vi' | 'en', value: string) => {
    setFormData((prev) => {
      const current = localizedObject(prev[key] as LocalizedValue)
      const next = { ...prev, [key]: { ...current, [locale]: value } }
      if (key === 'name' && locale === 'vi' && !prev.id && (!prev.slug || prev.slug === slugify(current.vi || ''))) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (readerEvent) => setImagePreview(readerEvent.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setGalleryFiles((current) => [...current, ...files])
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataObj = new FormData()
    formDataObj.append('file', file)
    const response = await api.post<{ url: string }>('/admin/upload', formDataObj)
    return response.data.url
  }

  const handleSave = async () => {
    setError('')
    const nameVi = localizedField(formData.name, 'vi').trim()
    if (!nameVi || !formData.slug.trim() || !formData.category) {
      setError('Vui lòng nhập tên tiếng Việt, slug và danh mục.')
      return
    }

    let parsedDetails: Record<string, unknown> = {}
    try {
      parsedDetails = detailsText.trim() ? JSON.parse(detailsText) : {}
      if (!parsedDetails || Array.isArray(parsedDetails) || typeof parsedDetails !== 'object') {
        throw new Error('Details must be an object')
      }
    } catch {
      setError('Thông số kỹ thuật JSON chưa hợp lệ.')
      return
    }

    setIsSaving(true)
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : formData.image
      const uploadedGalleryUrls = galleryFiles.length
        ? await Promise.all(galleryFiles.map((file) => uploadImage(file)))
        : []
      const gallery = Array.from(new Set([...splitList(galleryUrlsText), ...uploadedGalleryUrls]))

      await onSave({
        ...formData,
        slug: slugify(formData.slug),
        name: localizedObject(formData.name),
        tagline: localizedObject(formData.tagline),
        description: localizedObject(formData.description),
        basePrice: Number(formData.basePrice) || 1,
        stock: Number(formData.stock) || 0,
        rating: Number(formData.rating) || 0,
        reviewCount: Number(formData.reviewCount) || 0,
        discountPercent: Number(formData.discountPercent) || 0,
        image: imageUrl || '/images/placeholder.jpg',
        gallery,
        details: parsedDetails,
        highlightSpecs: splitList(highlightSpecsText),
        is_trade_in: Boolean(formData.is_trade_in),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được sản phẩm.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/60" onClick={onClose} aria-label="Đóng" />
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted" aria-label="Đóng">
          <X className="h-5 w-5" />
        </button>

        <div className="pr-10">
          <h2 className="text-xl font-bold text-foreground">
            {formData.id ? `Sửa sản phẩm: ${localizedField(formData.name, 'vi') || formData.slug}` : 'Thêm sản phẩm'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Cập nhật thông tin bán hàng, hình ảnh, mô tả và thông số kỹ thuật.</p>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600">{error}</div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Thông tin chính</h3>
            <Field label="Tên sản phẩm (Tiếng Việt) *">
              <input value={localizedField(formData.name, 'vi')} onChange={(event) => handleLocalizedChange('name', 'vi', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
            </Field>
            <Field label="Tên sản phẩm (Tiếng Anh)">
              <input value={localizedField(formData.name, 'en')} onChange={(event) => handleLocalizedChange('name', 'en', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Slug *">
                <input value={formData.slug} onChange={(event) => handleInputChange('slug', slugify(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none focus:border-accent" />
              </Field>
              <Field label="Thương hiệu">
                <input value={formData.brand || ''} onChange={(event) => handleInputChange('brand', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Danh mục *">
                <select value={formData.category} onChange={(event) => handleInputChange('category', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                  {categories.length === 0 && <option value={formData.category}>{formData.category}</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name.vi || category.slug}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sản phẩm thu cũ">
                <select value={formData.is_trade_in ? 'yes' : 'no'} onChange={(event) => handleInputChange('is_trade_in', (event.target.value === 'yes') as any)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                  <option value="no">Không</option>
                  <option value="yes">Có</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField label="Giá *" value={formData.basePrice} onChange={(value) => handleInputChange('basePrice', value)} />
              <NumberField label="Tồn kho" value={formData.stock} onChange={(value) => handleInputChange('stock', value)} />
              <NumberField label="Giảm giá %" value={formData.discountPercent} onChange={(value) => handleInputChange('discountPercent', value)} min={0} max={100} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Đánh giá" value={formData.rating} onChange={(value) => handleInputChange('rating', value)} min={0} max={5} step={0.1} />
              <NumberField label="Lượt đánh giá" value={formData.reviewCount} onChange={(value) => handleInputChange('reviewCount', value)} min={0} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle label="Còn hàng" checked={formData.available} onChange={(value) => handleInputChange('available', value)} />
              <Toggle label="Sản phẩm hot" checked={formData.trending} onChange={(value) => handleInputChange('trending', value)} />
              <Toggle label="Sản phẩm mới" checked={formData.isNew} onChange={(value) => handleInputChange('isNew', value)} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Hình ảnh và nội dung</h3>
            <Field label="Ảnh chính: URL hoặc upload">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input value={formData.image || ''} onChange={(event) => { handleInputChange('image', event.target.value); setImagePreview(event.target.value) }} placeholder="https://..." className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
              </div>
            </Field>
            {imagePreview && <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-lg border border-border object-cover" />}

            <Field label="Gallery URL (mỗi dòng một URL)">
              <textarea value={galleryUrlsText} onChange={(event) => setGalleryUrlsText(event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </Field>
            <Field label="Upload nhiều ảnh gallery">
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
                <Upload className="h-4 w-4" />
                Chọn nhiều ảnh
                <input type="file" accept="image/*" multiple onChange={handleGallerySelect} className="hidden" />
              </label>
              {galleryFiles.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{galleryFiles.length} ảnh mới sẽ được upload khi lưu.</p>}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tagline (Tiếng Việt)">
                <input value={localizedField(formData.tagline, 'vi')} onChange={(event) => handleLocalizedChange('tagline', 'vi', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
              </Field>
              <Field label="Tagline (Tiếng Anh)">
                <input value={localizedField(formData.tagline, 'en')} onChange={(event) => handleLocalizedChange('tagline', 'en', event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
              </Field>
            </div>
            <Field label="Mô tả (Tiếng Việt)">
              <textarea value={localizedField(formData.description, 'vi')} onChange={(event) => handleLocalizedChange('description', 'vi', event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </Field>
            <Field label="Mô tả (Tiếng Anh)">
              <textarea value={localizedField(formData.description, 'en')} onChange={(event) => handleLocalizedChange('description', 'en', event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </Field>
          </section>
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Field label="Thông số nổi bật (mỗi dòng một thông số)">
            <textarea value={highlightSpecsText} onChange={(event) => setHighlightSpecsText(event.target.value)} rows={7} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Chi tiết kỹ thuật JSON">
            <textarea value={detailsText} onChange={(event) => setDetailsText(event.target.value)} rows={7} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-accent" />
          </Field>
        </section>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <button onClick={onClose} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
            Hủy
          </button>
          <button onClick={handleSave} disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

function NumberField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <Field label={label}>
      <input type="number" value={value ?? 0} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
    </Field>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left text-sm font-semibold hover:bg-muted">
      <span>{label}</span>
      <span className={checked ? 'text-accent' : 'text-muted-foreground'}>{checked ? 'Bật' : 'Tắt'}</span>
    </button>
  )
}
