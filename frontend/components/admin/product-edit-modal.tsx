'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Eye } from 'lucide-react'
import api from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import type { ProductDTO } from '@/lib/products-api'

type Category = {
  id: string
  slug: string
  name: { vi: string; en: string }
}

interface ProductEditModalProps {
  product: ProductDTO | null
  isOpen: boolean
  onClose: () => void
  onSave: (product: ProductDTO) => Promise<void>
  categories: Category[]
}

export function ProductEditModal({ product, isOpen, onClose, onSave, categories }: ProductEditModalProps) {
  const { t } = useI18n()
  const [formData, setFormData] = useState<ProductDTO>(product || ({} as ProductDTO))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData(product)
      setImagePreview(product.image || '')
      setImageFile(null)
      setGalleryFiles([])
    }
  }, [product, isOpen])

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNameChange = (locale: 'vi' | 'en', value: string) => {
    setFormData(prev => ({
      ...prev,
      name: {
        ...prev.name,
        [locale]: value,
      },
    }))
  }

  const handleDescriptionChange = (locale: 'vi' | 'en', value: string) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [locale]: value,
      },
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = e => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataObj = new FormData()
    formDataObj.append('file', file)
    const response = await api.post<{ url: string }>('/admin/upload', formDataObj as any, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.url
  }

  const handleSave = async () => {
    setError('')
    setIsSaving(true)
    try {
      // Upload image if selected
      let imageUrl = formData.image
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Upload gallery files
      let galleryUrls = formData.gallery || []
      if (galleryFiles.length > 0) {
        const uploadedUrls = await Promise.all(galleryFiles.map(file => uploadImage(file)))
        galleryUrls = [...galleryUrls, ...uploadedUrls]
      }

      const updatedProduct: ProductDTO = {
        ...formData,
        image: imageUrl,
        gallery: galleryUrls,
      }

      await onSave(updatedProduct)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-foreground/60"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">Sửa sản phẩm: {formData.name?.vi || 'N/A'}</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên sản phẩm (Tiếng Việt) *
              </label>
              <input
                type="text"
                value={formData.name?.vi || ''}
                onChange={e => handleNameChange('vi', e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên sản phẩm (Tiếng Anh)
              </label>
              <input
                type="text"
                value={formData.name?.en || ''}
                onChange={e => handleNameChange('en', e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              />
            </div>

            {/* Slug & Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => handleInputChange('slug', e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Thương hiệu</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={e => handleInputChange('brand', e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Danh mục *</label>
              <select
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name.vi}
                  </option>
                ))}
              </select>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Giá *</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={e => handleInputChange('basePrice', Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tồn kho</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => handleInputChange('stock', Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Giảm giá %</label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={e => handleInputChange('discountPercent', Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={e => handleInputChange('available', e.target.checked)}
                  className="rounded border border-border"
                />
                <span className="text-sm font-medium text-foreground">Còn hàng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trending}
                  onChange={e => handleInputChange('trending', e.target.checked)}
                  className="rounded border border-border"
                />
                <span className="text-sm font-medium text-foreground">Sản phẩm hot</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={e => handleInputChange('isNew', e.target.checked)}
                  className="rounded border border-border"
                />
                <span className="text-sm font-medium text-foreground">Sản phẩm mới</span>
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hình ảnh chính</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Hoặc nhập URL..."
                    value={!imageFile ? (formData.image || '') : ''}
                    onChange={e => {
                      if (!imageFile) {
                        handleInputChange('image', e.target.value)
                        setImagePreview(e.target.value)
                      }
                    }}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent mb-2"
                  />
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-medium text-accent-foreground cursor-pointer transition">
                    <Upload className="h-4 w-4" />
                    Tải ảnh lên
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-48 w-full rounded-lg object-cover border border-border"
                />
              )}
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mô tả (Tiếng Việt)
              </label>
              <textarea
                value={formData.description?.vi || ''}
                onChange={e => handleDescriptionChange('vi', e.target.value)}
                className="w-full h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                placeholder="Mô tả sản phẩm tiếng Việt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mô tả (Tiếng Anh)
              </label>
              <textarea
                value={formData.description?.en || ''}
                onChange={e => handleDescriptionChange('en', e.target.value)}
                className="w-full h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                placeholder="Product description in English"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Đánh giá</label>
              <input
                type="number"
                value={formData.rating}
                onChange={e => handleInputChange('rating', Number(e.target.value))}
                min="0"
                max="5"
                step="0.1"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-border hover:bg-muted transition text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name?.vi || !formData.slug}
            className="h-10 px-4 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-50 transition text-sm font-medium text-accent-foreground"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
