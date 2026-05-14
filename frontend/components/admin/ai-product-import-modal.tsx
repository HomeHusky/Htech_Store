'use client'

import { useMemo, useState } from 'react'
import { ImagePlus, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { streamAIProductImport, type AIImportEvent, type AIImportRowInput } from '@/lib/ai-product-import'
import type { ProductDTO } from '@/lib/products-api'
import { cn } from '@/lib/utils'

type Category = {
  id: string
  slug: string
  name: { vi: string; en: string }
}

type RowState = AIImportRowInput & {
  status: string
  imageUrls: string[]
  product?: ProductDTO
  error?: string
}

function newRow(category: string): RowState {
  return {
    id: crypto.randomUUID(),
    category,
    files: [],
    status: 'waiting',
    imageUrls: [],
  }
}

export function AIProductImportModal({
  open,
  categories,
  onClose,
  onCreated,
  onEditProduct,
}: {
  open: boolean
  categories: Category[]
  onClose: () => void
  onCreated: () => Promise<void>
  onEditProduct: (product: ProductDTO) => void
}) {
  const defaultCategory = categories[0]?.id || 'laptop'
  const [rows, setRows] = useState<RowState[]>(() => [newRow(defaultCategory)])
  const [running, setRunning] = useState(false)
  const [summary, setSummary] = useState('')
  const canStart = rows.some((row) => row.files.length > 0) && !running

  const createdProducts = useMemo(() => rows.flatMap((row) => (row.product ? [row.product] : [])), [rows])

  const patchRow = (rowId: string, patch: Partial<RowState>) => {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
  }

  const handleEvent = (event: AIImportEvent) => {
    if (event.type === 'received') {
      setSummary(`Đang xử lý ${event.row_count} hàng`)
      return
    }
    if (event.type === 'done') {
      setSummary(`Đã tạo ${event.created} sản phẩm, lỗi ${event.failed}`)
      return
    }
    if (event.type === 'uploading') patchRow(event.row_id, { status: 'uploading' })
    if (event.type === 'uploaded') patchRow(event.row_id, { status: 'uploaded', imageUrls: event.image_urls })
    if (event.type === 'analyzing') patchRow(event.row_id, { status: 'analyzing' })
    if (event.type === 'creating') patchRow(event.row_id, { status: 'creating' })
    if (event.type === 'created') patchRow(event.row_id, { status: 'created', product: event.product })
    if (event.type === 'failed') patchRow(event.row_id, { status: 'failed', error: event.error })
  }

  const startImport = async () => {
    setRunning(true)
    setSummary('')
    setRows((current) => current.map((row) => ({
      ...row,
      status: row.files.length ? 'queued' : 'failed',
      error: row.files.length ? undefined : 'Chưa chọn ảnh',
    })))
    try {
      await streamAIProductImport(rows.filter((row) => row.files.length > 0), handleEvent)
      await onCreated()
    } catch (error) {
      setSummary(error instanceof Error ? error.message : 'Không thể tạo sản phẩm bằng AI')
    } finally {
      setRunning(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/60" onClick={running ? undefined : onClose} aria-label="Đóng" />
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Thêm sản phẩm bằng AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">Mỗi hàng là một sản phẩm mới. Chọn nhiều ảnh cho từng sản phẩm.</p>
          </div>
          <button onClick={onClose} disabled={running} className="rounded-lg p-2 hover:bg-muted disabled:opacity-50" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-border p-4">
              <div className="grid gap-3 md:grid-cols-[auto_minmax(160px,220px)_auto_auto_1fr_auto] md:items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">{index + 1}</div>
                <select
                  value={row.category}
                  disabled={running}
                  onChange={(event) => patchRow(row.id, { category: event.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                >
                  {categories.length === 0 && <option value={row.category}>{row.category}</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name.vi || category.slug}</option>
                  ))}
                </select>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
                  <ImagePlus className="h-4 w-4" />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={running}
                    onChange={(event) => patchRow(row.id, { files: Array.from(event.target.files || []) })}
                    className="hidden"
                  />
                </label>
                <span className="whitespace-nowrap text-sm text-muted-foreground">{row.files.length} ảnh</span>
                <StatusPill status={row.status} />
                <button
                  onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                  disabled={running || rows.length === 1}
                  className="justify-self-end rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                  aria-label="Xóa hàng"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {row.error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{row.error}</p>}
              {row.product && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {typeof row.product.name === 'string' ? row.product.name : row.product.name.vi}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.product.slug}</p>
                  </div>
                  <button onClick={() => onEditProduct(row.product!)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-card">
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm text-muted-foreground">
            {summary || `${createdProducts.length} sản phẩm đã tạo trong phiên này`}
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
            <button
              onClick={() => setRows((current) => [...current, newRow(defaultCategory)])}
              disabled={running}
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Thêm hàng
            </button>
            <button
              onClick={startImport}
              disabled={!canStart}
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              <Sparkles className={cn('h-4 w-4', running && 'animate-spin')} />
              {running ? 'Đang tạo...' : 'Thêm bằng AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = {
    waiting: 'Chờ chọn ảnh',
    queued: 'Đang chờ',
    uploading: 'Đang tải ảnh',
    uploaded: 'Đã tải ảnh',
    analyzing: 'Đang phân tích',
    creating: 'Đang tạo',
    created: 'Đã tạo',
    failed: 'Lỗi',
  }
  const tone = status === 'created'
    ? 'border-green-200 bg-green-50 text-green-700'
    : status === 'failed'
      ? 'border-red-200 bg-red-50 text-red-600'
      : status === 'waiting'
        ? 'border-slate-200 bg-slate-100 text-slate-500'
        : 'border-blue-200 bg-blue-50 text-blue-700'

  return <span className={cn('whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold', tone)}>{labels[status] || status}</span>
}
