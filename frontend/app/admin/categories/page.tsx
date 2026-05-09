'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, FolderTree, Layers, Plus, Search, Trash2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type Category = {
  id: string
  slug: string
  name: {
    vi?: string
    en?: string
  }
}

const emptyCategory: Category = {
  id: '',
  slug: '',
  name: { vi: '', en: '' },
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState<Category>(emptyCategory)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Category[]>('/admin/categories')
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return categories
    return categories.filter((category) => {
      const vi = category.name.vi ?? ''
      const en = category.name.en ?? ''
      return [category.id, category.slug, vi, en].some((value) => value.toLowerCase().includes(query))
    })
  }, [categories, searchQuery])

  const handleNameChange = (value: string) => {
    const id = slugify(value).replace(/-/g, '_')
    setNewCategory((current) => ({
      ...current,
      id: current.id || id,
      slug: current.slug || slugify(value),
      name: { ...current.name, vi: value },
    }))
  }

  const handleAddCategory = async () => {
    if (!newCategory.id || !newCategory.slug || !newCategory.name.vi) return
    setSaving(true)
    try {
      await api.post('/admin/categories', newCategory)
      await fetchCategories()
      setNewCategory(emptyCategory)
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add category:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Xoa danh muc nay? Cac san pham dang dung danh muc co the chan thao tac.')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      await fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  return (
    <>
      <AdminHeader title="Categories" subtitle="Quan ly danh muc san pham va duong dan hien thi" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tong danh muc</p>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Dang hien thi</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{filteredCategories.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Trang thai</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{loading ? 'Dang tai' : 'San sang'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tim theo ten, slug hoac ID..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-accent"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Them danh muc
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
              ))
            : filteredCategories.map((category) => (
                <article key={category.id} className="group rounded-xl border border-border bg-card p-5 transition hover:border-accent/40 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-accent">
                      <Layers className="h-5 w-5" />
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-5">
                    <h2 className="text-lg font-bold text-foreground">{category.name.vi || category.id}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{category.name.en || 'Chua co ten tieng Anh'}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="font-mono">/{category.slug}</span>
                    <span className="inline-flex items-center gap-1">
                      {category.id}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </article>
              ))}
        </div>

        {!loading && filteredCategories.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold text-foreground">Khong tim thay danh muc</p>
            <p className="mt-1 text-sm text-muted-foreground">Thu doi tu khoa hoac tao danh muc moi.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-foreground/60" onClick={() => setShowAddModal(false)} aria-label="Close modal" />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Them danh muc moi</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Ten hien thi
                <input
                  value={newCategory.name.vi}
                  onChange={(event) => handleNameChange(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Ten tieng Anh
                <input
                  value={newCategory.name.en}
                  onChange={(event) => setNewCategory({ ...newCategory, name: { ...newCategory.name, en: event.target.value } })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-foreground">
                  ID
                  <input
                    value={newCategory.id}
                    onChange={(event) => setNewCategory({ ...newCategory, id: event.target.value.toLowerCase().replace(/-/g, '_') })}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Slug
                  <input
                    value={newCategory.slug}
                    onChange={(event) => setNewCategory({ ...newCategory, slug: slugify(event.target.value) })}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none focus:border-accent"
                  />
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddCategory}
                disabled={saving || !newCategory.id || !newCategory.slug || !newCategory.name.vi}
                className="h-10 flex-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? 'Dang luu...' : 'Tao danh muc'}
              </button>
              <button onClick={() => setShowAddModal(false)} className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold transition hover:bg-muted">
                Huy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
