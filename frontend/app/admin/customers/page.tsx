'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Mail, Search, ShoppingBag, TrendingUp, User } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import api from '@/lib/api'
import { formatVnd } from '@/lib/products-api'
import { cn } from '@/lib/utils'
import { AdminListSkeleton, AdminStatGridSkeleton } from '@/components/loading-skeletons'

type Customer = {
  id: string
  name: string
  email: string
  role?: string
  totalOrders: number
  totalSpend: number
  lastOrder: string
  segment: 'VIP' | 'Thường' | 'Mới'
  intent: string
}

type UserDTO = { id?: string; email: string; username?: string; full_name?: string; role?: string }
type OrderDTO = { id: string; customer: string; email: string; total: number; items?: Array<{ name?: string; product_id: string }> }

const segmentColors: Record<Customer['segment'], string> = {
  VIP: 'text-amber-600 bg-amber-50 border-amber-200',
  Thường: 'text-blue-600 bg-blue-50 border-blue-200',
  Mới: 'text-green-600 bg-green-50 border-green-200',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<UserDTO[]>('/admin/users').catch(() => ({ data: [] as UserDTO[] })),
      api.get<OrderDTO[]>('/admin/orders').catch(() => ({ data: [] as OrderDTO[] })),
    ]).then(([usersRes, ordersRes]) => {
      const orders = ordersRes.data
      const fromUsers = usersRes.data.map((user) => buildCustomer(user, orders.filter((order) => order.email === user.email)))
      const userEmails = new Set(usersRes.data.map((user) => user.email))
      const guestCustomers = Array.from(new Set(orders.filter((order) => !userEmails.has(order.email)).map((order) => order.email)))
        .map((email) => buildCustomer({ id: email, email, full_name: orders.find((order) => order.email === email)?.customer }, orders.filter((order) => order.email === email)))
      const merged = [...fromUsers, ...guestCustomers]
      setCustomers(merged)
      setSelectedId(merged[0]?.id || null)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return customers
    return customers.filter((customer) => customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query))
  }, [customers, search])

  const selected = customers.find((customer) => customer.id === selectedId)

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Khách hàng" subtitle="Hồ sơ khách hàng, lịch sử mua và insight từ AI chat" />
      <div className="flex-1 overflow-hidden p-6">
        <div className="flex h-full gap-5">
          <div className="flex w-80 shrink-0 flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khách hàng..." className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-accent" />
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {loading ? (
                <AdminListSkeleton count={5} />
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Không có khách hàng phù hợp.</div>
              ) : filtered.map((customer) => (
                <button key={customer.id} onClick={() => setSelectedId(customer.id)} className={cn('flex w-full items-start gap-3 rounded-xl border p-4 text-left transition', selectedId === customer.id ? 'border-accent/30 bg-accent/5' : 'border-border bg-card hover:border-foreground/20')}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">{initials(customer.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                      <p className="truncate text-sm font-semibold text-foreground">{customer.name}</p>
                      <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold', segmentColors[customer.segment])}>{customer.segment}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                    <p className="mt-1 truncate text-xs font-medium text-accent">{customer.intent}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
              <section className="rounded-xl border border-border bg-card p-5">
                <AdminStatGridSkeleton count={3} />
              </section>
              <section className="rounded-xl border border-border bg-card p-5">
                <AdminListSkeleton count={3} />
              </section>
            </div>
          )}

          {!loading && selected && (
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
              <section className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent text-lg font-black text-accent-foreground">{initials(selected.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black text-foreground">{selected.name}</h2>
                      <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-bold', segmentColors[selected.segment])}>{selected.segment}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{selected.email}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-accent"><TrendingUp className="h-4 w-4" />{selected.intent}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
                  <Metric label="Tổng đơn" value={selected.totalOrders} />
                  <Metric label="Tổng chi tiêu" value={formatVnd(selected.totalSpend)} />
                  <Metric label="Mua gần nhất" value={selected.lastOrder} />
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                  <ShoppingBag className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold text-foreground">Lịch sử mua hàng</h3>
                </div>
                <div className="p-4">
                  {selected.totalOrders === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có đơn hàng.</p>
                  ) : (
                    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
                      <span className="text-sm text-foreground">{selected.lastOrder}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function buildCustomer(user: UserDTO, orders: OrderDTO[]): Customer {
  const totalSpend = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const last = orders[0]
  return {
    id: user.id || user.email,
    name: user.full_name || user.username || last?.customer || user.email,
    email: user.email,
    role: user.role,
    totalOrders: orders.length,
    totalSpend,
    lastOrder: last?.items?.[0]?.name || last?.items?.[0]?.product_id || 'Chưa có',
    segment: totalSpend >= 100_000_000 ? 'VIP' : orders.length > 1 ? 'Thường' : 'Mới',
    intent: last ? `Quan tâm ${last.items?.[0]?.name || 'sản phẩm mới'}` : 'Chưa có tín hiệu mua hàng',
  }
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || <User className="h-4 w-4" />
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}
