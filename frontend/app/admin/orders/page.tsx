'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, Clock, Eye, ImageIcon, Package, Truck } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { formatVnd } from '@/lib/products-api'

type OrderStatus = 'Awaiting Deposit' | 'Paid' | 'Service Ongoing' | 'Completed' | 'Cancelled'

type Order = {
  id: string
  order_number: string
  customer: string
  email: string
  phone: string
  total: number
  deposit: number
  status: OrderStatus
  expected_delivery: string
  payment_proof?: string | null
  items: Array<{ product_id: string; name?: string; qty: number; price: number }>
}

const statusFlow: OrderStatus[] = ['Awaiting Deposit', 'Paid', 'Service Ongoing', 'Completed']
const filters: Array<OrderStatus | 'Tất cả'> = ['Tất cả', ...statusFlow, 'Cancelled']

const statusConfig: Record<OrderStatus, { color: string; icon: typeof Clock; label: string }> = {
  'Awaiting Deposit': { color: 'border-amber-200 bg-amber-50 text-amber-600', icon: Clock, label: 'Chờ đặt cọc' },
  Paid: { color: 'border-blue-200 bg-blue-50 text-blue-600', icon: Package, label: 'Đã thanh toán' },
  'Service Ongoing': { color: 'border-purple-200 bg-purple-50 text-purple-600', icon: Truck, label: 'Đang xử lý' },
  Completed: { color: 'border-green-200 bg-green-50 text-green-600', icon: CheckCircle2, label: 'Hoàn thành' },
  Cancelled: { color: 'border-red-200 bg-red-50 text-red-600', icon: Clock, label: 'Đã hủy' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'Tất cả'>('Tất cả')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Order[]>('/admin/orders')
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    await api.patch(`/admin/orders/${id}/status`, { status: newStatus })
    await loadOrders()
  }

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const index = statusFlow.indexOf(current)
    return index >= 0 && index < statusFlow.length - 1 ? statusFlow[index + 1] : null
  }

  const filtered = useMemo(() => {
    return activeStatus === 'Tất cả' ? orders : orders.filter((order) => order.status === activeStatus)
  }, [activeStatus, orders])

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Quản lý đơn hàng" subtitle="Theo dõi đặt cọc, xác nhận thanh toán và cập nhật trạng thái đơn" />
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveStatus(filter)}
              className={cn('rounded-lg border px-4 py-2 text-sm font-medium transition', activeStatus === filter ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:border-foreground/30')}
            >
              {filter === 'Tất cả' ? 'Tất cả' : statusConfig[filter].label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Đặt cọc', 'Trạng thái', 'Thao tác'].map((heading) => (
                    <th key={heading} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Đang tải đơn hàng...
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const config = statusConfig[order.status]
                    const StatusIcon = config.icon
                    const nextStatus = getNextStatus(order.status)
                    return (
                      <tr key={order.id} className="transition hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-bold text-foreground">{order.order_number}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{order.expected_delivery}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                          <p className="text-xs text-muted-foreground">{order.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="max-w-[220px] truncate text-sm text-foreground">{order.items.map((item) => `${item.name || item.product_id} x${item.qty}`).join(', ')}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-foreground">{formatVnd(order.total)}</td>
                        <td className="px-5 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold', order.payment_proof ? 'border-green-200 bg-green-50 text-green-600' : 'border-amber-200 bg-amber-50 text-amber-600')}>
                            {order.payment_proof ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                            {formatVnd(order.deposit)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold', config.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {nextStatus && (
                              <button onClick={() => updateStatus(order.id, nextStatus)} className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:bg-blue-dark">
                                <ChevronDown className="h-3 w-3 -rotate-90" />
                                {statusConfig[nextStatus].label}
                              </button>
                            )}
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition hover:text-foreground">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
