'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminHeader } from '@/components/admin/header'
import { useI18n } from '@/lib/i18n'

export default function AdminAnalyticsPage() {
  const { t } = useI18n()

  const revenueData = [
    { month: 'T1', revenue: 820, orders: 48 },
    { month: 'T2', revenue: 932, orders: 55 },
    { month: 'T3', revenue: 901, orders: 62 },
    { month: 'T4', revenue: 1134, orders: 80 },
    { month: 'T5', revenue: 1290, orders: 91 },
    { month: 'T6', revenue: 1330, orders: 98 },
    { month: 'T7', revenue: 1450, orders: 105 },
  ]

  const categoryData = [
    { name: t('nav.iphone'), value: 42, color: '#0071e3' },
    { name: t('nav.macbook'), value: 27, color: '#34c759' },
    { name: t('nav.gaming'), value: 19, color: '#ff9f0a' },
    { name: t('nav.accessories'), value: 12, color: '#64d2ff' },
  ]

  const liveOrders = [
    { id: '#ORD-8821', customer: 'Nguyen Minh Tri', product: 'iPhone 15 Pro 256GB', amount: '29,990,000₫', status: 'Paid', time: `2 ${t('admin.dashboard.minute_ago')}` },
    { id: '#ORD-8820', customer: 'Tran Thi Lan', product: 'MacBook Air M3 15"', amount: '38,990,000₫', status: 'Processing', time: `7 ${t('admin.dashboard.minute_ago')}` },
    { id: '#ORD-8819', customer: 'Le Van Khanh', product: 'ROG Gaming Laptop', amount: '52,990,000₫', status: 'Shipped', time: `15 ${t('admin.dashboard.minute_ago')}` },
    { id: '#ORD-8818', customer: 'Pham Duc Hieu', product: 'Gaming Monitor 27"', amount: '12,990,000₫', status: 'Paid', time: `22 ${t('admin.dashboard.minute_ago')}` },
    { id: '#ORD-8817', customer: 'Vo Thi Thu', product: 'iPhone 14 128GB', amount: '21,990,000₫', status: 'Delivered', time: `1 ${t('admin.dashboard.hour_ago')}` },
  ]

  const statusLabels: Record<string, string> = {
    Paid: t('admin.dashboard.status.paid'),
    Processing: t('admin.dashboard.status.processing'),
    Shipped: t('admin.dashboard.status.shipped'),
    Delivered: t('admin.dashboard.status.delivered'),
  }

  const statusColors: Record<string, string> = {
    Paid: 'text-green-600 bg-green-50',
    Processing: 'text-amber-600 bg-amber-50',
    Shipped: 'text-blue-600 bg-blue-50',
    Delivered: 'text-slate-600 bg-slate-100',
  }

  const kpis = [
    { label: t('admin.dashboard.revenue'), value: '1.45B₫', change: '+18.2%', up: true, icon: DollarSign, color: 'text-green-600' },
    { label: t('admin.dashboard.orders'), value: '3,847', change: '+12.5%', up: true, icon: ShoppingCart, color: 'text-blue-600' },
    { label: t('admin.dashboard.customers'), value: '1,204', change: '+9.1%', up: true, icon: Users, color: 'text-purple-600' },
    { label: t('admin.dashboard.avg_order'), value: '37.6M₫', change: '-2.3%', up: false, icon: Package, color: 'text-amber-600' },
  ]

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center bg-muted')}>
                    <Icon className={cn('w-4 h-4', kpi.color)} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{kpi.value}</p>
                  <div className={cn('flex items-center gap-1 mt-1', kpi.up ? 'text-green-600' : 'text-red-500')}>
                    {kpi.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="text-xs font-semibold">{kpi.change}</span>
                    <span className="text-xs text-muted-foreground">{t('admin.dashboard.vs_last')}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">{t('admin.dashboard.revenue_orders')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('admin.dashboard.last_7')}</p>
              </div>
              <button className="text-xs text-accent hover:text-blue-dark font-semibold flex items-center gap-1">
                {t('admin.dashboard.view_report')} <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v}M₫`, t('admin.dashboard.revenue')]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground">{t('admin.dashboard.sales_cat')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('admin.dashboard.this_month')}</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live orders feed */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">{t('admin.dashboard.live_activity')}</h3>
            </div>
            <Link href="/admin/orders" className="text-xs text-accent font-semibold hover:text-blue-dark">
              {t('admin.dashboard.view_all_orders')}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {liveOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono font-bold text-muted-foreground">{order.id}</p>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', statusColors[order.status])}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">{order.customer}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.product}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{order.amount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion bar chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">{t('admin.dashboard.monthly_volume')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.dashboard.orders_per_month')}</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid oklch(0.91 0 0)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="orders" fill="#0071e3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
