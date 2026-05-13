'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Check, CheckCircle, Clock, Copy, DollarSign, Gift, Percent, Plus, Search, Tag, Trash2, Users, XCircle, Zap } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { AdminCardGridSkeleton, AdminStatGridSkeleton } from '@/components/loading-skeletons'

type PromoType = 'percentage' | 'fixed' | 'freeShipping'
type PromoStatus = 'active' | 'scheduled' | 'expired' | 'disabled'
type Promotion = { id: number; code: string; name: string; type: PromoType; value: number; minOrder: number; maxDiscount?: number; usageLimit: number; usedCount: number; startDate: string; endDate: string; status: PromoStatus; applicableProducts: 'all' | 'category' | 'specific'; category?: string }

const statusConfig = {
  active: { label: 'Đang chạy', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  scheduled: { label: 'Đã lên lịch', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  expired: { label: 'Hết hạn', color: 'bg-muted text-muted-foreground', icon: XCircle },
  disabled: { label: 'Tạm tắt', color: 'bg-red-500/10 text-red-500', icon: XCircle },
} satisfies Record<PromoStatus, { label: string; color: string; icon: typeof Clock }>

const typeConfig = {
  percentage: { label: 'Phần trăm', icon: Percent },
  fixed: { label: 'Số tiền', icon: DollarSign },
  freeShipping: { label: 'Free ship', icon: Gift },
} satisfies Record<PromoType, { label: string; icon: typeof Percent }>

const emptyPromo = { code: '', name: '', type: 'percentage' as PromoType, value: 10, minOrder: 0, maxDiscount: 0, usageLimit: 100, startDate: '', endDate: '', applicableProducts: 'all' as Promotion['applicableProducts'], category: '' }

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

function inferStatus(startDate: string, endDate: string): PromoStatus {
  const today = new Date().toISOString().slice(0, 10)
  if (endDate && endDate < today) return 'expired'
  if (startDate && startDate > today) return 'scheduled'
  return 'active'
}

function fromApi(promo: any): Promotion {
  return {
    id: promo.id,
    code: promo.code,
    name: promo.name,
    type: promo.type,
    value: promo.value,
    minOrder: promo.min_order,
    maxDiscount: promo.max_discount,
    usageLimit: promo.usage_limit,
    usedCount: promo.used_count,
    startDate: promo.start_date,
    endDate: promo.end_date,
    status: promo.status,
    applicableProducts: promo.applicable_products,
    category: promo.category,
  }
}

function toApi(promo: Promotion, status = promo.status) {
  return { id: promo.id, code: promo.code, name: promo.name, type: promo.type, value: promo.value, min_order: promo.minOrder, max_discount: promo.maxDiscount || 0, usage_limit: promo.usageLimit, used_count: promo.usedCount, start_date: promo.startDate, end_date: promo.endDate, status, applicable_products: promo.applicableProducts, category: promo.category || null }
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PromoStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newPromo, setNewPromo] = useState(emptyPromo)
  const [error, setError] = useState('')

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<any[]>('/admin/promotions')
      setPromotions(data.map(fromApi))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const filteredPromotions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return promotions.filter((promo) => {
      const matchesSearch = !query || [promo.code, promo.name, promo.category ?? ''].some((value) => value.toLowerCase().includes(query))
      const matchesStatus = statusFilter === 'all' || promo.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [promotions, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const totalUsage = promotions.reduce((sum, promo) => sum + promo.usedCount, 0)
    const totalSaved = promotions.reduce((sum, promo) => sum + promo.usedCount * (promo.type === 'fixed' ? promo.value : promo.maxDiscount || 250000), 0)
    return { total: promotions.length, active: promotions.filter((promo) => promo.status === 'active').length, totalUsage, totalSaved }
  }, [promotions])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1400)
  }

  const toggleStatus = async (promo: Promotion) => {
    const nextStatus = promo.status === 'disabled' ? inferStatus(promo.startDate, promo.endDate) : 'disabled'
    await api.put(`/admin/promotions/${promo.id}`, toApi(promo, nextStatus))
    await loadPromotions()
  }

  const addPromo = async () => {
    if (!newPromo.code || !newPromo.name || !newPromo.startDate || !newPromo.endDate) return
    setError('')
    try {
      await api.post('/admin/promotions', { code: newPromo.code.toUpperCase(), name: newPromo.name, type: newPromo.type, value: newPromo.value, min_order: newPromo.minOrder, max_discount: newPromo.maxDiscount, usage_limit: newPromo.usageLimit, start_date: newPromo.startDate, end_date: newPromo.endDate, applicable_products: newPromo.applicableProducts, category: newPromo.category || null })
      setNewPromo(emptyPromo)
      setShowAddModal(false)
      await loadPromotions()
    } catch (error: any) {
      setError(error?.data?.detail || 'Không tạo được mã khuyến mãi.')
    }
  }

  return (
    <>
      <AdminHeader title="Khuyến mãi" subtitle="Tạo mã giảm giá, theo dõi lượt dùng và chiến dịch ưu đãi" />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatGridSkeleton count={4} />
          </div>
        )}
        <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', loading && 'hidden')}>
          <StatCard label="Tổng mã" value={stats.total.toString()} icon={Tag} />
          <StatCard label="Đang chạy" value={stats.active.toString()} icon={Zap} tone="green" />
          <StatCard label="Lượt dùng" value={stats.totalUsage.toLocaleString('vi-VN')} icon={Users} tone="blue" />
          <StatCard label="Ước tính đã giảm" value={formatPrice(stats.totalSaved)} icon={Gift} tone="purple" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm code, tên chiến dịch..." className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-accent" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PromoStatus | 'all')} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(statusConfig).map(([status, config]) => <option key={status} value={status}>{config.label}</option>)}
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" />Tạo mã mới</button>
        </div>

        {loading ? (
          <AdminCardGridSkeleton count={6} className="lg:grid-cols-2 2xl:grid-cols-3" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredPromotions.map((promo) => {
              const StatusIcon = statusConfig[promo.status].icon
              const TypeIcon = typeConfig[promo.type].icon
              const usagePercent = Math.min((promo.usedCount / Math.max(1, promo.usageLimit)) * 100, 100)
              return (
                <article key={promo.id} className={cn('rounded-xl border p-5 transition hover:shadow-sm', promo.status === 'active' ? 'border-border bg-card' : promo.status === 'scheduled' ? 'border-blue-500/20 bg-blue-500/5' : 'border-border bg-muted/30')}>
                  <div className="flex items-start justify-between gap-4">
                    <div><span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold', statusConfig[promo.status].color)}><StatusIcon className="h-3.5 w-3.5" />{statusConfig[promo.status].label}</span><h2 className="mt-3 font-bold text-foreground">{promo.name}</h2></div>
                    <button onClick={() => api.delete(`/admin/promotions/${promo.id}`).then(loadPromotions)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" aria-label="Xóa mã"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                    <code className="min-w-0 flex-1 font-mono text-lg font-black text-accent">{promo.code}</code>
                    <button onClick={() => copyCode(promo.code)} className={cn('rounded-lg p-2 transition', copiedCode === promo.code ? 'bg-green-600 text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground')} aria-label="Sao chép mã">{copiedCode === promo.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><TypeIcon className="h-5 w-5" /></div>
                    <div><p className="text-2xl font-black text-foreground">{promo.type === 'percentage' && `${promo.value}%`}{promo.type === 'fixed' && formatPrice(promo.value)}{promo.type === 'freeShipping' && 'Free ship'}</p><p className="text-xs text-muted-foreground">{promo.minOrder ? `Đơn tối thiểu ${formatPrice(promo.minOrder)}` : 'Không yêu cầu đơn tối thiểu'}</p></div>
                  </div>
                  <div className="mt-5"><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Đã sử dụng</span><span className="font-semibold text-foreground">{promo.usedCount} / {promo.usageLimit}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', usagePercent > 85 ? 'bg-red-500' : usagePercent > 65 ? 'bg-amber-500' : 'bg-accent')} style={{ width: `${usagePercent}%` }} /></div></div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{promo.startDate} - {promo.endDate}</span><button onClick={() => toggleStatus(promo)} className="rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted">{promo.status === 'disabled' ? 'Bật lại' : 'Tạm tắt'}</button></div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-foreground/60" onClick={() => setShowAddModal(false)} aria-label="Đóng" />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Tạo mã khuyến mãi</h2>
            {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Mã code" value={newPromo.code} onChange={(value) => setNewPromo({ ...newPromo, code: value.toUpperCase() })} />
              <label className="block text-sm font-medium text-foreground">Loại ưu đãi<select value={newPromo.type} onChange={(event) => setNewPromo({ ...newPromo, type: event.target.value as PromoType })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"><option value="percentage">Giảm theo phần trăm</option><option value="fixed">Giảm số tiền cố định</option><option value="freeShipping">Miễn phí vận chuyển</option></select></label>
              <Input label="Tên chiến dịch" value={newPromo.name} onChange={(value) => setNewPromo({ ...newPromo, name: value })} className="sm:col-span-2" />
              {newPromo.type !== 'freeShipping' && <><NumberInput label={newPromo.type === 'percentage' ? 'Giá trị (%)' : 'Giá trị (VND)'} value={newPromo.value} onChange={(value) => setNewPromo({ ...newPromo, value })} /><NumberInput label="Giảm tối đa (VND)" value={newPromo.maxDiscount} onChange={(value) => setNewPromo({ ...newPromo, maxDiscount: value })} /></>}
              <NumberInput label="Đơn tối thiểu (VND)" value={newPromo.minOrder} onChange={(value) => setNewPromo({ ...newPromo, minOrder: value })} />
              <NumberInput label="Giới hạn lượt dùng" value={newPromo.usageLimit} onChange={(value) => setNewPromo({ ...newPromo, usageLimit: value })} />
              <Input label="Ngày bắt đầu" type="date" value={newPromo.startDate} onChange={(value) => setNewPromo({ ...newPromo, startDate: value })} />
              <Input label="Ngày kết thúc" type="date" value={newPromo.endDate} onChange={(value) => setNewPromo({ ...newPromo, endDate: value })} />
              <label className="block text-sm font-medium text-foreground">Áp dụng cho<select value={newPromo.applicableProducts} onChange={(event) => setNewPromo({ ...newPromo, applicableProducts: event.target.value as Promotion['applicableProducts'] })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"><option value="all">Tất cả sản phẩm</option><option value="category">Theo danh mục</option><option value="specific">Sản phẩm cụ thể</option></select></label>
              <Input label="Danh mục / ghi chú áp dụng" value={newPromo.category} onChange={(value) => setNewPromo({ ...newPromo, category: value })} />
            </div>
            <div className="mt-6 flex gap-3"><button onClick={addPromo} className="h-10 flex-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">Tạo mã</button><button onClick={() => setShowAddModal(false)} className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold hover:bg-muted">Hủy</button></div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, icon: Icon, tone = 'default' }: { label: string; value: string; icon: typeof Tag; tone?: 'default' | 'green' | 'blue' | 'purple' }) {
  const toneClass = { default: 'bg-accent/10 text-accent', green: 'bg-green-500/10 text-green-600', blue: 'bg-blue-500/10 text-blue-600', purple: 'bg-purple-500/10 text-purple-600' }[tone]
  return <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClass)}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-bold text-foreground">{value}</p></div></div></div>
}

function Input({ label, value, onChange, type = 'text', className }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return <label className={cn('block text-sm font-medium text-foreground', className)}>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" /></label>
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block text-sm font-medium text-foreground">{label}<input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" /></label>
}
