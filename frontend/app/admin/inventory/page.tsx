'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle, Package, RefreshCw, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AdminHeader } from '@/components/admin/header'
import { fetchAdminProducts, type ProductDTO } from '@/lib/products-api'
import { cn } from '@/lib/utils'
import { AdminListSkeleton, AdminStatGridSkeleton, AdminTableSkeleton } from '@/components/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'

type InventoryStatus = 'healthy' | 'low' | 'critical' | 'out'

const statusConfig = {
  healthy: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Ổn định', icon: CheckCircle },
  low: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Sắp hết hàng', icon: AlertTriangle },
  critical: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Nguy cấp', icon: AlertTriangle },
  out: { color: 'text-slate-600 bg-slate-100 border-slate-200', label: 'Hết hàng', icon: Package },
} satisfies Record<InventoryStatus, { color: string; label: string; icon: typeof CheckCircle }>

function statusFor(stock: number): InventoryStatus {
  if (stock <= 0) return 'out'
  if (stock < 5) return 'critical'
  if (stock < 10) return 'low'
  return 'healthy'
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setProducts(await fetchAdminProducts())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const inventory = useMemo(() => products.map((product) => ({
    name: typeof product.name === 'string' ? product.name : product.name.vi || product.name.en || product.slug,
    sku: product.slug.toUpperCase().replaceAll('-', '_'),
    stock: product.stock,
    threshold: 10,
    velocity: Math.max(1, Math.round((product.reviewCount || 1) / 30)),
    restock: Math.max(10, 30 - product.stock),
    status: statusFor(product.stock),
  })), [products])

  const alerts = inventory.filter((item) => item.status !== 'healthy')
  const velocityData = inventory.slice(0, 5).map((item) => ({
    name: item.name.split(' ').slice(0, 2).join(' '),
    velocity: item.velocity,
    stock: item.stock,
  }))

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Cảnh báo tồn kho" subtitle="Theo dõi tồn kho thời gian thực và dự báo nhập hàng" />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminStatGridSkeleton count={3} />
          </div>
        )}
        <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', loading && 'hidden')}>
          {[
            { label: 'Hết hàng', count: inventory.filter((item) => item.status === 'out').length, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
            { label: 'Nguy cấp (<5)', count: inventory.filter((item) => item.status === 'critical').length, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
            { label: 'Sắp hết hàng', count: inventory.filter((item) => item.status === 'low').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          ].map((stat) => (
            <div key={stat.label} className={cn('flex items-center gap-4 rounded-xl border p-5', stat.bg)}>
              <AlertTriangle className={cn('h-8 w-8', stat.color)} />
              <div>
                <p className="text-2xl font-black text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold text-foreground">Cảnh báo đang hoạt động</h3>
            <button onClick={load} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          </div>
          {loading ? (
            <div className="p-5">
              <AdminListSkeleton count={3} />
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">Không có cảnh báo tồn kho.</div>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map((item) => {
                const config = statusConfig[item.status]
                const Icon = config.icon
                const daysUntilOut = item.velocity > 0 ? Math.floor(item.stock / item.velocity) : null
                return (
                  <div key={item.sku} className="flex flex-col gap-4 px-5 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <span className={cn('inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold', config.color)}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <Metric label="Tồn kho" value={item.stock} />
                      <Metric label="Tốc độ bán" value={`${item.velocity}/ngày`} />
                      {daysUntilOut !== null && item.stock > 0 && <Metric label="Tới khi hết" value={`${daysUntilOut} ngày`} danger={daysUntilOut <= 3} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold text-foreground">Tình trạng tồn kho đầy đủ</h3>
          </div>
          {loading && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <tbody className="divide-y divide-border">
                  <AdminTableSkeleton columns={7} rows={6} />
                </tbody>
              </table>
            </div>
          )}
          <div className={cn('overflow-x-auto', loading && 'hidden')}>
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Sản phẩm', 'SKU', 'Tồn kho', 'Ngưỡng cảnh báo', 'Tốc độ bán', 'Dự báo', 'Trạng thái'].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => {
                  const config = statusConfig[item.status]
                  const Icon = config.icon
                  return (
                    <tr key={item.sku} className="transition hover:bg-muted/20">
                      <td className="px-5 py-4 text-sm font-semibold text-foreground">{item.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.sku}</td>
                      <td className="px-5 py-4 text-sm font-bold text-foreground">{item.stock}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{item.threshold}</td>
                      <td className="px-5 py-4 text-sm text-foreground">{item.velocity}/ngày</td>
                      <td className="px-5 py-4 text-sm text-foreground">{item.stock === 0 ? 'Ngay bây giờ' : `${Math.floor(item.stock / item.velocity)} ngày`}</td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold', config.color)}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-5 text-sm font-bold text-foreground">Tốc độ bán và mức tồn kho</h3>
          {loading ? (
            <Skeleton className="h-[220px] w-full rounded-lg" />
          ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocityData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="stock" fill="oklch(0.91 0 0)" name="Tồn kho" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="velocity" fill="#0071e3" name="Bán/ngày" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, danger = false }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn('font-bold text-foreground', danger && 'text-red-500')}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
