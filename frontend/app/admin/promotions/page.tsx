'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Check, CheckCircle, Clock, Copy, DollarSign, Gift, Package, Percent, Plus, Search, Tag, Trash2, Users, XCircle, Zap } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type PromoType = 'percentage' | 'fixed' | 'freeShipping'
type PromoStatus = 'active' | 'scheduled' | 'expired' | 'disabled'

type Promotion = {
  id: number
  code: string
  name: string
  type: PromoType
  value: number
  minOrder: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  startDate: string
  endDate: string
  status: PromoStatus
  applicableProducts: 'all' | 'category' | 'specific'
  category?: string
}

const initialPromotions: Promotion[] = [
  {
    id: 1,
    code: 'HTECH10',
    name: 'Giam 10% toan bo don hang',
    type: 'percentage',
    value: 10,
    minOrder: 5000000,
    maxDiscount: 2000000,
    usageLimit: 1000,
    usedCount: 342,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'active',
    applicableProducts: 'all',
  },
  {
    id: 2,
    code: 'IPHONE500K',
    name: 'Giam 500K cho iPhone',
    type: 'fixed',
    value: 500000,
    minOrder: 20000000,
    usageLimit: 500,
    usedCount: 156,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'active',
    applicableProducts: 'category',
    category: 'phone',
  },
  {
    id: 3,
    code: 'FREESHIP',
    name: 'Mien phi van chuyen noi thanh',
    type: 'freeShipping',
    value: 0,
    minOrder: 2000000,
    usageLimit: 2000,
    usedCount: 1245,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    applicableProducts: 'all',
  },
  {
    id: 4,
    code: 'BACKTOSCHOOL',
    name: 'Uu dai laptop mua tuu truong',
    type: 'percentage',
    value: 15,
    minOrder: 10000000,
    maxDiscount: 3000000,
    usageLimit: 200,
    usedCount: 0,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'scheduled',
    applicableProducts: 'category',
    category: 'laptop',
  },
]

const statusConfig = {
  active: { label: 'Dang chay', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  scheduled: { label: 'Da len lich', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  expired: { label: 'Het han', color: 'bg-muted text-muted-foreground', icon: XCircle },
  disabled: { label: 'Tam tat', color: 'bg-red-500/10 text-red-500', icon: XCircle },
} satisfies Record<PromoStatus, { label: string; color: string; icon: typeof Clock }>

const typeConfig = {
  percentage: { label: 'Phan tram', icon: Percent },
  fixed: { label: 'So tien', icon: DollarSign },
  freeShipping: { label: 'Free ship', icon: Gift },
} satisfies Record<PromoType, { label: string; icon: typeof Percent }>

const emptyPromo = {
  code: '',
  name: '',
  type: 'percentage' as PromoType,
  value: 10,
  minOrder: 0,
  maxDiscount: 0,
  usageLimit: 100,
  startDate: '',
  endDate: '',
  applicableProducts: 'all' as Promotion['applicableProducts'],
  category: '',
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

function inferStatus(startDate: string, endDate: string): PromoStatus {
  const today = new Date().toISOString().slice(0, 10)
  if (endDate && endDate < today) return 'expired'
  if (startDate && startDate > today) return 'scheduled'
  return 'active'
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PromoStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newPromo, setNewPromo] = useState(emptyPromo)

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<any[]>('/admin/promotions')
      setPromotions(data.map((promo) => ({
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
      })))
    } catch (error) {
      console.error('Failed to load promotions:', error)
      setPromotions(initialPromotions)
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
    const totalSaved = promotions.reduce((sum, promo) => {
      if (promo.type === 'fixed') return sum + promo.usedCount * promo.value
      if (promo.type === 'percentage') return sum + promo.usedCount * (promo.maxDiscount || 250000)
      return sum + promo.usedCount * 35000
    }, 0)
    return {
      total: promotions.length,
      active: promotions.filter((promo) => promo.status === 'active').length,
      totalUsage,
      totalSaved,
    }
  }, [promotions])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1400)
  }

  const toggleStatus = (id: number) => {
    const promo = promotions.find((item) => item.id === id)
    if (!promo) return
    const nextStatus = promo.status === 'disabled' ? inferStatus(promo.startDate, promo.endDate) : 'disabled'
    const payload = {
      id: promo.id,
      code: promo.code,
      name: promo.name,
      type: promo.type,
      value: promo.value,
      min_order: promo.minOrder,
      max_discount: promo.maxDiscount || 0,
      usage_limit: promo.usageLimit,
      used_count: promo.usedCount,
      start_date: promo.startDate,
      end_date: promo.endDate,
      status: nextStatus,
      applicable_products: promo.applicableProducts,
      category: promo.category,
    }
    api.put(`/admin/promotions/${id}`, payload).then(loadPromotions).catch((error) => console.error('Failed to update promotion:', error))
  }

  const addPromo = async () => {
    if (!newPromo.code || !newPromo.name || !newPromo.startDate || !newPromo.endDate) return
    await api.post('/admin/promotions', {
      code: newPromo.code.toUpperCase(),
      name: newPromo.name,
      type: newPromo.type,
      value: newPromo.value,
      min_order: newPromo.minOrder,
      max_discount: newPromo.maxDiscount,
      usage_limit: newPromo.usageLimit,
      start_date: newPromo.startDate,
      end_date: newPromo.endDate,
      applicable_products: newPromo.applicableProducts,
      category: newPromo.category || null,
    })
    setNewPromo(emptyPromo)
    setShowAddModal(false)
    await loadPromotions()
  }

  return (
    <>
      <AdminHeader title="Promotions" subtitle="Tao ma giam gia, theo doi luot dung va chien dich uu dai" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tong ma" value={stats.total.toString()} icon={Tag} />
          <StatCard label="Dang chay" value={stats.active.toString()} icon={Zap} tone="green" />
          <StatCard label="Luot dung" value={stats.totalUsage.toLocaleString('vi-VN')} icon={Users} tone="blue" />
          <StatCard label="Uoc tinh da giam" value={formatPrice(stats.totalSaved)} icon={Gift} tone="purple" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tim code, ten chien dich..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PromoStatus | 'all')}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
            >
              <option value="all">Tat ca trang thai</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Tao ma moi
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Đang tải mã khuyến mãi...</div>
          ) : filteredPromotions.map((promo) => {
            const StatusIcon = statusConfig[promo.status].icon
            const TypeIcon = typeConfig[promo.type].icon
            const usagePercent = Math.min((promo.usedCount / promo.usageLimit) * 100, 100)

            return (
              <article key={promo.id} className={cn('rounded-xl border p-5 transition hover:shadow-sm', promo.status === 'active' ? 'border-border bg-card' : promo.status === 'scheduled' ? 'border-blue-500/20 bg-blue-500/5' : 'border-border bg-muted/30')}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold', statusConfig[promo.status].color)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig[promo.status].label}
                    </span>
                    <h2 className="mt-3 font-bold text-foreground">{promo.name}</h2>
                  </div>
                  <button onClick={() => api.delete(`/admin/promotions/${promo.id}`).then(loadPromotions)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" aria-label="Delete promotion">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                  <code className="min-w-0 flex-1 font-mono text-lg font-black text-accent">{promo.code}</code>
                  <button onClick={() => copyCode(promo.code)} className={cn('rounded-lg p-2 transition', copiedCode === promo.code ? 'bg-green-600 text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground')} aria-label="Copy promotion code">
                    {copiedCode === promo.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">
                      {promo.type === 'percentage' && `${promo.value}%`}
                      {promo.type === 'fixed' && formatPrice(promo.value)}
                      {promo.type === 'freeShipping' && 'Free ship'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {promo.minOrder ? `Don toi thieu ${formatPrice(promo.minOrder)}` : 'Khong yeu cau don toi thieu'}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Da su dung</span>
                    <span className="font-semibold text-foreground">
                      {promo.usedCount} / {promo.usageLimit}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full rounded-full', usagePercent > 85 ? 'bg-red-500' : usagePercent > 65 ? 'bg-amber-500' : 'bg-accent')} style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {promo.startDate} - {promo.endDate}
                  </span>
                  <button onClick={() => toggleStatus(promo.id)} className="rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted">
                    {promo.status === 'disabled' ? 'Bat lai' : 'Tam tat'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-foreground/60" onClick={() => setShowAddModal(false)} aria-label="Close modal" />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Tao ma khuyen mai</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Ma code" value={newPromo.code} onChange={(value) => setNewPromo({ ...newPromo, code: value.toUpperCase() })} />
              <label className="block text-sm font-medium text-foreground">
                Loai uu dai
                <select value={newPromo.type} onChange={(event) => setNewPromo({ ...newPromo, type: event.target.value as PromoType })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                  <option value="percentage">Giam theo phan tram</option>
                  <option value="fixed">Giam so tien co dinh</option>
                  <option value="freeShipping">Mien phi van chuyen</option>
                </select>
              </label>
              <Input label="Ten chien dich" value={newPromo.name} onChange={(value) => setNewPromo({ ...newPromo, name: value })} className="sm:col-span-2" />
              {newPromo.type !== 'freeShipping' && (
                <>
                  <NumberInput label={newPromo.type === 'percentage' ? 'Gia tri (%)' : 'Gia tri (VND)'} value={newPromo.value} onChange={(value) => setNewPromo({ ...newPromo, value })} />
                  <NumberInput label="Giam toi da (VND)" value={newPromo.maxDiscount} onChange={(value) => setNewPromo({ ...newPromo, maxDiscount: value })} />
                </>
              )}
              <NumberInput label="Don toi thieu (VND)" value={newPromo.minOrder} onChange={(value) => setNewPromo({ ...newPromo, minOrder: value })} />
              <NumberInput label="Gioi han luot dung" value={newPromo.usageLimit} onChange={(value) => setNewPromo({ ...newPromo, usageLimit: value })} />
              <Input label="Ngay bat dau" type="date" value={newPromo.startDate} onChange={(value) => setNewPromo({ ...newPromo, startDate: value })} />
              <Input label="Ngay ket thuc" type="date" value={newPromo.endDate} onChange={(value) => setNewPromo({ ...newPromo, endDate: value })} />
              <label className="block text-sm font-medium text-foreground">
                Ap dung cho
                <select value={newPromo.applicableProducts} onChange={(event) => setNewPromo({ ...newPromo, applicableProducts: event.target.value as 'all' | 'category' | 'specific' })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                  <option value="all">Tat ca san pham</option>
                  <option value="category">Theo danh muc</option>
                  <option value="specific">San pham cu the</option>
                </select>
              </label>
              <Input label="Danh muc / ghi chu ap dung" value={newPromo.category} onChange={(value) => setNewPromo({ ...newPromo, category: value })} />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={addPromo} className="h-10 flex-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
                Tao ma
              </button>
              <button onClick={() => setShowAddModal(false)} className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
                Huy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, icon: Icon, tone = 'default' }: { label: string; value: string; icon: typeof Tag; tone?: 'default' | 'green' | 'blue' | 'purple' }) {
  const toneClass = {
    default: 'bg-accent/10 text-accent',
    green: 'bg-green-500/10 text-green-600',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
  }[tone]
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', className }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <label className={cn('block text-sm font-medium text-foreground', className)}>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
    </label>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
    </label>
  )
}
