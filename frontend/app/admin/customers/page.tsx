'use client'

import { useState } from 'react'
import { MessageSquare, ShoppingBag, ChevronRight, Search, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminHeader } from '@/components/admin/header'

type Customer = {
  id: number
  name: string
  email: string
  avatar: string
  totalOrders: number
  totalSpend: string
  lastOrder: string
  segment: 'VIP' | 'Regular' | 'New'
  intent: string
  chatLogs: { role: 'user' | 'ai'; content: string }[]
}

const customers: Customer[] = [
  {
    id: 1,
    name: 'Nguyen Minh Tri',
    email: 'tri.nm@email.com',
    avatar: 'NT',
    totalOrders: 8,
    totalSpend: '182,400,000₫',
    lastOrder: 'iPhone 15 Pro',
    segment: 'VIP',
    intent: 'Upgrade to MacBook Pro M3',
    chatLogs: [
      { role: 'user', content: 'Compare MacBook Pro 14" vs 16" for video editing' },
      { role: 'ai', content: 'For professional video editing, the 16" with M3 Max chip is significantly better. It offers up to 128GB unified memory and 30-core GPU...' },
    ],
  },
  {
    id: 2,
    name: 'Tran Thi Lan',
    email: 'lan.tt@email.com',
    avatar: 'TL',
    totalOrders: 3,
    totalSpend: '87,640,000₫',
    lastOrder: 'MacBook Air M3',
    segment: 'Regular',
    intent: 'Interested in iPad Pro',
    chatLogs: [
      { role: 'user', content: 'Does iPad Pro work with Apple Pencil Pro?' },
      { role: 'ai', content: 'Yes! iPad Pro 2024 is fully compatible with Apple Pencil Pro, offering tilt detection, barrel roll, and haptic feedback...' },
    ],
  },
  {
    id: 3,
    name: 'Le Van Khanh',
    email: 'khanh.lv@email.com',
    avatar: 'LK',
    totalOrders: 1,
    totalSpend: '52,990,000₫',
    lastOrder: 'ROG Gaming Laptop',
    segment: 'New',
    intent: 'Building custom gaming PC',
    chatLogs: [
      { role: 'user', content: 'I want to build a PC for streaming and gaming, budget 40 million' },
      { role: 'ai', content: 'For streaming + gaming at 40M budget, I recommend: AMD Ryzen 7 7700X, RTX 4070, 32GB DDR5, 1TB NVMe. This will handle 1440p gaming and streaming simultaneously...' },
    ],
  },
  {
    id: 4,
    name: 'Pham Duc Hieu',
    email: 'hieu.pd@email.com',
    avatar: 'PH',
    totalOrders: 5,
    totalSpend: '142,800,000₫',
    lastOrder: 'Gaming Monitor 27"',
    segment: 'VIP',
    intent: 'Trade-in iPhone 14 for iPhone 15 Pro Max',
    chatLogs: [
      { role: 'user', content: 'How much can I get for trading in my iPhone 14 Pro 256GB?' },
      { role: 'ai', content: 'Your iPhone 14 Pro 256GB in good condition is worth approximately 12-14 million VND as trade-in credit toward an iPhone 15 Pro Max...' },
    ],
  },
]

const segmentColors: Record<string, string> = {
  VIP: 'text-amber-600 bg-amber-50 border-amber-200',
  Regular: 'text-blue-600 bg-blue-50 border-blue-200',
  New: 'text-green-600 bg-green-50 border-green-200',
}

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [search, setSearch] = useState('')

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  )
  const selected = customers.find((c) => c.id === selectedId)

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Customer CRM" subtitle="Customer profiles, purchase history, and AI chat insights" />
      <div className="flex-1 overflow-hidden p-6">
        <div className="flex gap-5 h-full">
          {/* List */}
          <div className="w-80 shrink-0 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
              {filtered.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedId(customer.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3',
                    selectedId === customer.id
                      ? 'bg-accent/5 border-accent/30'
                      : 'bg-card border-border hover:border-foreground/20',
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {customer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">{customer.name}</p>
                      <span className={cn('px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0', segmentColors[customer.segment])}>
                        {customer.segment}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                    <p className="text-xs text-accent font-medium mt-1 truncate">{customer.intent}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
              {/* Profile */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center text-lg font-black shrink-0">
                    {selected.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-black text-foreground">{selected.name}</h2>
                      <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border', segmentColors[selected.segment])}>
                        {selected.segment}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{selected.email}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-accent font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>AI Intent: {selected.intent}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
                  {[
                    { label: 'Total Orders', value: selected.totalOrders },
                    { label: 'Total Spend', value: selected.totalSpend },
                    { label: 'Last Purchase', value: selected.lastOrder },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat logs */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-bold text-foreground">AI Chat Insights</h3>
                </div>
                <div className="p-4 space-y-3">
                  {selected.chatLogs.map((log, i) => (
                    <div key={i} className={cn('flex gap-2', log.role === 'user' ? 'flex-row-reverse' : '')}>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                          log.role === 'ai' ? 'bg-accent text-accent-foreground' : 'bg-muted border border-border text-muted-foreground',
                        )}
                      >
                        {log.role === 'ai' ? 'AI' : 'U'}
                      </div>
                      <div
                        className={cn(
                          'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          log.role === 'ai'
                            ? 'bg-muted text-foreground rounded-tl-sm border border-border'
                            : 'bg-accent text-accent-foreground rounded-tr-sm',
                        )}
                      >
                        {log.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase history */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-bold text-foreground">Purchase History</h3>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {['iPhone 15 Pro', 'MacBook Air M2', 'AirPods Pro 2nd Gen'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{item}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
