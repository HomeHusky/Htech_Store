'use client'

import { AlertTriangle, TrendingUp, RefreshCw, CheckCircle, Package } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { AdminHeader } from '@/components/admin/header'

const inventory = [
  { name: 'iPhone 15 Pro 256GB', sku: 'IP15P-256', stock: 24, threshold: 10, velocity: 4.2, restock: 60, status: 'healthy' },
  { name: 'MacBook Air M3 15"', sku: 'MBA15-M3', stock: 8, threshold: 10, velocity: 2.1, restock: 30, status: 'low' },
  { name: 'ROG Strix G16 RTX4070', sku: 'ROG-G16', stock: 0, threshold: 5, velocity: 1.8, restock: 10, status: 'out' },
  { name: 'Ultra 27" Gaming Monitor', sku: 'MON-27', stock: 15, threshold: 8, velocity: 3.5, restock: 40, status: 'healthy' },
  { name: 'AirPods Pro 2nd Gen', sku: 'APP-2G', stock: 42, threshold: 20, velocity: 6.8, restock: 100, status: 'healthy' },
  { name: 'MacBook Pro M3 14"', sku: 'MBP14-M3P', stock: 3, threshold: 5, velocity: 1.4, restock: 8, status: 'critical' },
  { name: 'iPhone 15 128GB', sku: 'IP15-128', stock: 18, threshold: 15, velocity: 5.1, restock: 70, status: 'healthy' },
]

const velocityData = inventory.slice(0, 5).map((i) => ({
  name: i.name.split(' ').slice(0, 2).join(' '),
  velocity: i.velocity,
  stock: i.stock,
}))

const statusConfig = {
  healthy: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Healthy', icon: CheckCircle },
  low: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Low Stock', icon: AlertTriangle },
  critical: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Critical', icon: AlertTriangle },
  out: { color: 'text-slate-600 bg-slate-100 border-slate-200', label: 'Out of Stock', icon: Package },
}

const alerts = inventory.filter((i) => i.status !== 'healthy')

export default function InventoryPage() {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Inventory Alerts" subtitle="Real-time stock monitoring and predictive restocking" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alert cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Out of Stock', count: inventory.filter((i) => i.status === 'out').length, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
            { label: 'Critical (&lt;5)', count: inventory.filter((i) => i.status === 'critical').length, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
            { label: 'Low Stock', count: inventory.filter((i) => i.status === 'low').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          ].map((stat) => (
            <div key={stat.label} className={cn('rounded-2xl border p-5 flex items-center gap-4', stat.bg)}>
              <AlertTriangle className={cn('w-8 h-8', stat.color)} />
              <div>
                <p className="text-2xl font-black text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: stat.label }} />
              </div>
            </div>
          ))}
        </div>

        {/* Active alerts with predictive restock */}
        {alerts.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-foreground">Active Alerts & Predicted Restock</h3>
            </div>
            <div className="divide-y divide-border">
              {alerts.map((item) => {
                const config = statusConfig[item.status as keyof typeof statusConfig]
                const Icon = config.icon
                const daysUntilOut = item.velocity > 0 ? Math.floor(item.stock / item.velocity) : null
                return (
                  <div key={item.sku} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border', config.color)}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm shrink-0">
                      <div className="text-center">
                        <p className="font-black text-foreground text-lg">{item.stock}</p>
                        <p className="text-xs text-muted-foreground">In stock</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground">{item.velocity}/day</p>
                        <p className="text-xs text-muted-foreground">Velocity</p>
                      </div>
                      {daysUntilOut !== null && item.stock > 0 && (
                        <div className="text-center">
                          <p className={cn('font-bold', daysUntilOut <= 3 ? 'text-red-500' : 'text-amber-500')}>
                            {daysUntilOut}d
                          </p>
                          <p className="text-xs text-muted-foreground">Until empty</p>
                        </div>
                      )}
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-blue-dark transition-colors whitespace-nowrap">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Restock {item.restock} units
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Full inventory table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Full Inventory Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Product', 'SKU', 'Stock', 'Threshold', 'Sales Velocity', 'Predicted Restock', 'Status'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig]
                  const Icon = config.icon
                  const daysUntilOut = item.velocity > 0 && item.stock > 0
                    ? `${Math.floor(item.stock / item.velocity)} days`
                    : item.stock === 0 ? 'Now' : '—'
                  return (
                    <tr key={item.sku} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-foreground">{item.name}</td>
                      <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{item.sku}</td>
                      <td className="px-5 py-4">
                        <span className={cn('text-sm font-bold', item.stock === 0 ? 'text-red-500' : item.stock <= 5 ? 'text-orange-500' : 'text-foreground')}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{item.threshold}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <TrendingUp className="w-3.5 h-3.5 text-accent" />
                          {item.velocity}/day
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">{daysUntilOut}</td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border', config.color)}>
                          <Icon className="w-3 h-3" />
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

        {/* Velocity chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-5">Sales Velocity vs. Stock Level</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={velocityData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0 0)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'oklch(0.5 0 0)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="stock" fill="oklch(0.91 0 0)" name="Stock" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="velocity" fill="#0071e3" name="Daily Sales" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
