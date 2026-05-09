'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle, Clock, MessageCircle, Phone, Plus, Search, Smartphone, Trash2, User, Wrench, XCircle } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type RepairStatus = 'pending' | 'diagnosing' | 'repairing' | 'completed' | 'cancelled'
type RepairPriority = 'low' | 'normal' | 'high'

type RepairRequest = {
  id: string
  customer: string
  phone: string
  device: string
  issue: string
  status: RepairStatus
  priority: RepairPriority
  estimatedCost?: string
  createdAt: string
  notes?: string
}

type BackendRepair = {
  id: string
  customer_name: string
  device_name: string
  issue: string
  status: string
  created_at?: string
  notes?: Array<{ id?: string; content: string }>
}

const fallbackRepairs: RepairRequest[] = [
  {
    id: '1001',
    customer: 'Nguyen Van A',
    phone: '0901234567',
    device: 'iPhone 14 Pro',
    issue: 'Man hinh bi vo, can thay moi.',
    status: 'repairing',
    priority: 'high',
    estimatedCost: '3,500,000 VND',
    createdAt: '15/01/2026 10:30',
    notes: 'Khach can gap trong 2 ngay',
  },
  {
    id: '1002',
    customer: 'Tran Thi B',
    phone: '0912345678',
    device: 'MacBook Pro 14"',
    issue: 'Pin chai, thoi luong su dung ngan.',
    status: 'diagnosing',
    priority: 'normal',
    estimatedCost: '4,200,000 VND',
    createdAt: '14/01/2026 14:20',
  },
  {
    id: '1003',
    customer: 'Le Van C',
    phone: '0923456789',
    device: 'iPhone 13',
    issue: 'Loa ngoai khong phat am thanh.',
    status: 'pending',
    priority: 'low',
    createdAt: '14/01/2026 09:15',
  },
]

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-600', icon: Clock, backend: 'received' },
  diagnosing: { label: 'Đang kiểm tra', color: 'bg-blue-500/10 text-blue-600', icon: AlertCircle, backend: 'testing' },
  repairing: { label: 'Đang sửa', color: 'bg-purple-500/10 text-purple-600', icon: Wrench, backend: 'fixing' },
  completed: { label: 'Hoan thanh', color: 'bg-green-500/10 text-green-600', icon: CheckCircle, backend: 'ready' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/10 text-red-500', icon: XCircle, backend: 'delivered' },
} satisfies Record<RepairStatus, { label: string; color: string; icon: typeof Clock; backend: string }>

const priorityConfig = {
  low: { label: 'Thap', color: 'text-muted-foreground' },
  normal: { label: 'Binh thuong', color: 'text-blue-600' },
  high: { label: 'Cao', color: 'text-red-500' },
} satisfies Record<RepairPriority, { label: string; color: string }>

const statusMapBackend: Record<string, RepairStatus> = {
  received: 'pending',
  testing: 'diagnosing',
  fixing: 'repairing',
  ready: 'completed',
  delivered: 'completed',
}

function formatDate(value?: string) {
  if (!value) return 'Moi tao'
  return new Date(value).toLocaleString('vi-VN')
}

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRepair, setNewRepair] = useState({
    customer_name: '',
    phone: '',
    device_name: '',
    issue: '',
    priority: 'normal' as RepairPriority,
    estimated_cost: '',
    notes: '',
  })

  const fetchRepairs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<BackendRepair[]>('/admin/repairs')
      const mapped = data.map((repair) => ({
        id: repair.id,
        customer: repair.customer_name,
        phone: 'Chua cap nhat',
        device: repair.device_name,
        issue: repair.issue,
        status: statusMapBackend[repair.status] ?? 'pending',
        priority: 'normal' as RepairPriority,
        createdAt: formatDate(repair.created_at),
        notes: repair.notes?.map((note) => note.content).join(', '),
      }))
      setRepairs(mapped.length ? mapped : fallbackRepairs)
    } catch (error) {
      console.error('Failed to fetch repairs:', error)
      setRepairs(fallbackRepairs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepairs()
  }, [])

  const filteredRepairs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return repairs.filter((repair) => {
      const matchesSearch =
        !query ||
        [repair.customer, repair.phone, repair.device, repair.issue].some((value) => value.toLowerCase().includes(query))
      const matchesStatus = statusFilter === 'all' || repair.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [repairs, searchQuery, statusFilter])

  const updateStatus = async (id: string, status: RepairStatus) => {
    setRepairs((current) => current.map((repair) => (repair.id === id ? { ...repair, status } : repair)))
    try {
      await api.patch(`/admin/repairs/${id}/status?status=${statusConfig[status].backend}`)
    } catch (error) {
      console.error('Failed to update status:', error)
      fetchRepairs()
    }
  }

  const deleteRepair = async (id: string) => {
    if (!confirm('Xoa yeu cau sua chua nay?')) return
    try {
      await api.delete(`/admin/repairs/${id}`)
      await fetchRepairs()
    } catch (error) {
      console.error('Failed to delete repair:', error)
    }
  }

  const addRepair = async () => {
    if (!newRepair.customer_name || !newRepair.device_name || !newRepair.issue) return
    try {
      await api.post('/admin/repairs', {
        customer_name: newRepair.customer_name,
        device_name: newRepair.device_name,
        issue: newRepair.issue,
        status: 'received',
        notes: newRepair.notes ? [{ content: newRepair.notes }] : [],
      })
      await fetchRepairs()
    } catch (error) {
      console.error('Failed to add repair:', error)
      setRepairs((current) => [
        {
          id: Date.now().toString(),
          customer: newRepair.customer_name,
          phone: newRepair.phone || 'Chua cap nhat',
          device: newRepair.device_name,
          issue: newRepair.issue,
          status: 'pending',
          priority: newRepair.priority,
          estimatedCost: newRepair.estimated_cost,
          createdAt: new Date().toLocaleString('vi-VN'),
          notes: newRepair.notes,
        },
        ...current,
      ])
    } finally {
      setNewRepair({ customer_name: '', phone: '', device_name: '', issue: '', priority: 'normal', estimated_cost: '', notes: '' })
      setShowAddModal(false)
    }
  }

  const stats = {
    total: repairs.length,
    pending: repairs.filter((repair) => repair.status === 'pending').length,
    inProgress: repairs.filter((repair) => ['diagnosing', 'repairing'].includes(repair.status)).length,
    completed: repairs.filter((repair) => repair.status === 'completed').length,
  }

  return (
    <>
      <AdminHeader title="Repairs" subtitle="Theo doi yeu cau sua chua, chan doan va ban giao thiet bi" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tong yeu cau" value={stats.total} icon={Wrench} />
          <StatCard label="Cho xu ly" value={stats.pending} tone="amber" icon={Clock} />
          <StatCard label="Dang xu ly" value={stats.inProgress} tone="blue" icon={AlertCircle} />
          <StatCard label="Hoan thanh" value={stats.completed} tone="green" icon={CheckCircle} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tim khach, SDT, thiet bi..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as RepairStatus | 'all')}
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
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Them yeu cau
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-muted/60">
                <tr className="border-b border-border text-left text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-5 py-3">Ma</th>
                  <th className="px-5 py-3">Khach hang</th>
                  <th className="px-5 py-3">Thiet bi</th>
                  <th className="px-5 py-3">Van de</th>
                  <th className="px-5 py-3">Trang thai</th>
                  <th className="px-5 py-3">Chi phi</th>
                  <th className="px-5 py-3 text-right">Thao tac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Dang tai yeu cau sua chua...
                    </td>
                  </tr>
                ) : (
                  filteredRepairs.map((repair) => {
                    const StatusIcon = statusConfig[repair.status].icon
                    return (
                      <tr key={repair.id} className="transition hover:bg-muted/40">
                        <td className="px-5 py-4 font-mono text-sm font-semibold">#{repair.id.slice(0, 8)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{repair.customer}</p>
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {repair.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span className="inline-flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            {repair.device}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="max-w-xs truncate text-sm text-foreground">{repair.issue}</p>
                          {repair.notes && <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">{repair.notes}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold', statusConfig[repair.status].color)}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig[repair.status].label}
                          </span>
                          <p className={cn('mt-1 text-xs font-medium', priorityConfig[repair.priority].color)}>{priorityConfig[repair.priority].label}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {repair.createdAt}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold">{repair.estimatedCost || 'Chua bao gia'}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <select
                              value={repair.status}
                              onChange={(event) => updateStatus(repair.id, event.target.value as RepairStatus)}
                              className="h-8 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-accent"
                            >
                              {Object.entries(statusConfig).map(([status, config]) => (
                                <option key={status} value={status}>
                                  {config.label}
                                </option>
                              ))}
                            </select>
                            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Message customer">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteRepair(repair.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" aria-label="Delete repair">
                              <Trash2 className="h-4 w-4" />
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-foreground/60" onClick={() => setShowAddModal(false)} aria-label="Close modal" />
          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Them yeu cau sua chua</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Ten khach hang" value={newRepair.customer_name} onChange={(value) => setNewRepair({ ...newRepair, customer_name: value })} />
              <Input label="So dien thoai" value={newRepair.phone} onChange={(value) => setNewRepair({ ...newRepair, phone: value })} />
              <Input label="Thiet bi" value={newRepair.device_name} onChange={(value) => setNewRepair({ ...newRepair, device_name: value })} />
              <Input label="Chi phi du kien" value={newRepair.estimated_cost} onChange={(value) => setNewRepair({ ...newRepair, estimated_cost: value })} />
              <label className="block text-sm font-medium text-foreground">
                Uu tien
                <select
                  value={newRepair.priority}
                  onChange={(event) => setNewRepair({ ...newRepair, priority: event.target.value as RepairPriority })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                >
                  <option value="low">Thap</option>
                  <option value="normal">Binh thuong</option>
                  <option value="high">Cao</option>
                </select>
              </label>
              <Input label="Ghi chu" value={newRepair.notes} onChange={(value) => setNewRepair({ ...newRepair, notes: value })} />
              <label className="block text-sm font-medium text-foreground sm:col-span-2">
                Mo ta loi
                <textarea
                  value={newRepair.issue}
                  onChange={(event) => setNewRepair({ ...newRepair, issue: event.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={addRepair} className="h-10 flex-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
                Tao yeu cau
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

function StatCard({ label, value, icon: Icon, tone = 'default' }: { label: string; value: number; icon: typeof Wrench; tone?: 'default' | 'amber' | 'blue' | 'green' }) {
  const tones = {
    default: 'bg-card text-foreground',
    amber: 'bg-amber-500/10 text-amber-600',
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-green-500/10 text-green-600',
  }

  return (
    <div className={cn('rounded-xl border border-border p-5', tones[tone])}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/60">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm opacity-75">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
    </label>
  )
}
