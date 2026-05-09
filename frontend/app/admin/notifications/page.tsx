'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, Check, CheckCircle, Clock, Mail, MessageCircle, Plus, RefreshCw, Send, ShoppingCart, Trash2, Wrench, XCircle } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { cn } from '@/lib/utils'

type ChannelType = 'telegram' | 'facebook' | 'email' | 'sms'
type LogStatus = 'sent' | 'failed' | 'pending'

type NotificationChannel = {
  id: string
  name: string
  type: ChannelType
  config: string
  enabled: boolean
}

type NotificationEvent = {
  id: string
  name: string
  description: string
  icon: typeof Bell
  channels: string[]
}

type NotificationLog = {
  id: number
  event: string
  channel: string
  status: LogStatus
  message: string
  timestamp: string
}

const initialChannels: NotificationChannel[] = [
  { id: 'telegram-admin', name: 'Telegram Admin', type: 'telegram', config: '@htech_admin_bot', enabled: true },
  { id: 'facebook-page', name: 'Facebook Page', type: 'facebook', config: 'HTech Store Inbox', enabled: true },
  { id: 'support-email', name: 'Support Email', type: 'email', config: 'admin@htech.vn', enabled: false },
]

const initialEvents: NotificationEvent[] = [
  { id: 'new_order', name: 'Don hang moi', description: 'Bao ngay khi khach dat don hoac giu hang.', icon: ShoppingCart, channels: ['telegram-admin', 'facebook-page'] },
  { id: 'paid_order', name: 'Thanh toan thanh cong', description: 'Xac nhan dat coc hoac thanh toan du.', icon: CheckCircle, channels: ['telegram-admin'] },
  { id: 'low_stock', name: 'Canh bao ton kho', description: 'Gui khi san pham sap het hang.', icon: AlertTriangle, channels: ['telegram-admin', 'support-email'] },
  { id: 'new_message', name: 'Tin nhan moi', description: 'Khach hoi AI concierge can nhan vien ho tro.', icon: MessageCircle, channels: ['facebook-page'] },
  { id: 'new_repair', name: 'Yeu cau sua chua', description: 'Co ticket sua chua vua duoc tao.', icon: Wrench, channels: ['telegram-admin', 'facebook-page'] },
]

const initialLogs: NotificationLog[] = [
  { id: 1, event: 'Don hang moi', channel: 'Telegram', status: 'sent', message: 'ORD-1234 - iPhone 15 Pro - 29,990,000 VND', timestamp: '2 phut truoc' },
  { id: 2, event: 'Thanh toan thanh cong', channel: 'Telegram', status: 'sent', message: 'ORD-1234 da dat coc thanh cong.', timestamp: '5 phut truoc' },
  { id: 3, event: 'Tin nhan moi', channel: 'Facebook', status: 'failed', message: 'Khach hoi ve MacBook Air M3.', timestamp: '15 phut truoc' },
  { id: 4, event: 'Canh bao ton kho', channel: 'Email', status: 'pending', message: 'iPhone 15 Pro con 3 san pham.', timestamp: '1 gio truoc' },
]

const channelMeta = {
  telegram: { label: 'Telegram', icon: Send, color: 'bg-blue-500/10 text-blue-600' },
  facebook: { label: 'Facebook', icon: MessageCircle, color: 'bg-indigo-500/10 text-indigo-600' },
  email: { label: 'Email', icon: Mail, color: 'bg-amber-500/10 text-amber-600' },
  sms: { label: 'SMS', icon: Bell, color: 'bg-green-500/10 text-green-600' },
} satisfies Record<ChannelType, { label: string; icon: typeof Bell; color: string }>

const statusMeta = {
  sent: { label: 'Da gui', icon: CheckCircle, color: 'text-green-600' },
  failed: { label: 'Loi', icon: XCircle, color: 'text-red-500' },
  pending: { label: 'Dang gui', icon: Clock, color: 'text-amber-600' },
} satisfies Record<LogStatus, { label: string; icon: typeof Bell; color: string }>

export default function NotificationsPage() {
  const [channels, setChannels] = useState(initialChannels)
  const [events, setEvents] = useState(initialEvents)
  const [logs] = useState(initialLogs)
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings')
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [testSending, setTestSending] = useState<string | null>(null)
  const [newChannel, setNewChannel] = useState({ name: '', type: 'telegram' as ChannelType, config: '' })

  const stats = useMemo(() => {
    return {
      enabled: channels.filter((channel) => channel.enabled).length,
      events: events.length,
      sent: logs.filter((log) => log.status === 'sent').length,
      failed: logs.filter((log) => log.status === 'failed').length,
    }
  }, [channels, events, logs])

  const toggleChannel = (id: string) => {
    setChannels((current) => current.map((channel) => (channel.id === id ? { ...channel, enabled: !channel.enabled } : channel)))
  }

  const toggleEventChannel = (eventId: string, channelId: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              channels: event.channels.includes(channelId)
                ? event.channels.filter((id) => id !== channelId)
                : [...event.channels, channelId],
            }
          : event,
      ),
    )
  }

  const addChannel = () => {
    if (!newChannel.name || !newChannel.config) return
    setChannels((current) => [
      ...current,
      {
        id: `${newChannel.type}-${Date.now()}`,
        ...newChannel,
        enabled: true,
      },
    ])
    setNewChannel({ name: '', type: 'telegram', config: '' })
    setShowAddChannel(false)
  }

  const sendTestNotification = (channelId: string) => {
    setTestSending(channelId)
    setTimeout(() => setTestSending(null), 1200)
  }

  return (
    <>
      <AdminHeader title="Notifications" subtitle="Cau hinh kenh canh bao cho don hang, ton kho va sua chua" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Kenh dang bat" value={stats.enabled} icon={Bell} />
          <StatCard label="Su kien" value={stats.events} icon={AlertTriangle} />
          <StatCard label="Da gui" value={stats.sent} icon={CheckCircle} tone="green" />
          <StatCard label="Loi gan day" value={stats.failed} icon={XCircle} tone="red" />
        </div>

        <div className="flex gap-2">
          {[
            ['settings', 'Cai dat'],
            ['history', 'Lich su'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'settings' | 'history')}
              className={cn('h-10 rounded-lg px-4 text-sm font-semibold transition', activeTab === id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'settings' ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-foreground">Kenh thong bao</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Bat tat, gui thu va quan ly cau hinh kenh.</p>
                </div>
                <button onClick={() => setShowAddChannel(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-4 w-4" />
                  Them
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {channels.map((channel) => {
                  const meta = channelMeta[channel.type]
                  const Icon = meta.icon
                  return (
                    <div key={channel.id} className={cn('rounded-xl border border-border p-4 transition', channel.enabled ? 'bg-background' : 'bg-muted/40 opacity-70')}>
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', meta.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{channel.name}</p>
                          <p className="truncate text-sm text-muted-foreground">{channel.config}</p>
                        </div>
                        <button
                          onClick={() => sendTestNotification(channel.id)}
                          disabled={!channel.enabled || testSending === channel.id}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          aria-label="Send test notification"
                        >
                          <RefreshCw className={cn('h-4 w-4', testSending === channel.id && 'animate-spin')} />
                        </button>
                        <button
                          onClick={() => setChannels((current) => current.filter((item) => item.id !== channel.id))}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Delete channel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleChannel(channel.id)}
                          className={cn('relative h-6 w-11 rounded-full transition', channel.enabled ? 'bg-green-500' : 'bg-muted')}
                          aria-label="Toggle channel"
                        >
                          <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition', channel.enabled ? 'left-6' : 'left-1')} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {showAddChannel && (
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="grid gap-3">
                    <input value={newChannel.name} onChange={(event) => setNewChannel({ ...newChannel, name: event.target.value })} placeholder="Ten kenh" className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                    <select value={newChannel.type} onChange={(event) => setNewChannel({ ...newChannel, type: event.target.value as ChannelType })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                      <option value="telegram">Telegram</option>
                      <option value="facebook">Facebook Messenger</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                    <input value={newChannel.config} onChange={(event) => setNewChannel({ ...newChannel, config: event.target.value })} placeholder="Bot token, page ID, email hoac so dien thoai" className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                    <div className="flex gap-2">
                      <button onClick={addChannel} className="h-9 flex-1 rounded-lg bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90">
                        Luu kenh
                      </button>
                      <button onClick={() => setShowAddChannel(false)} className="h-9 flex-1 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
                        Huy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-bold text-foreground">Routing su kien</h2>
              <p className="mt-1 text-sm text-muted-foreground">Chon kenh nao se nhan thong bao cho tung su kien.</p>
              <div className="mt-5 space-y-3">
                {events.map((event) => {
                  const EventIcon = event.icon
                  return (
                    <div key={event.id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <EventIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{event.name}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {channels.map((channel) => (
                              <button
                                key={channel.id}
                                onClick={() => toggleEventChannel(event.id, channel.id)}
                                className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition', event.channels.includes(channel.id) ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
                              >
                                {event.channels.includes(channel.id) && <Check className="h-3 w-3" />}
                                {channel.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-bold text-foreground">Lich su thong bao</h2>
              <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                <RefreshCw className="h-4 w-4" />
                Lam moi
              </button>
            </div>
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const meta = statusMeta[log.status]
                const StatusIcon = meta.icon
                return (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/40">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', meta.color)}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{log.event}</p>
                        <span className="text-xs text-muted-foreground">via {log.channel}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{log.message}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-xs font-semibold', meta.color)}>{meta.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{log.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function StatCard({ label, value, icon: Icon, tone = 'default' }: { label: string; value: number; icon: typeof Bell; tone?: 'default' | 'green' | 'red' }) {
  const toneClass = tone === 'green' ? 'text-green-600 bg-green-500/10' : tone === 'red' ? 'text-red-500 bg-red-500/10' : 'text-accent bg-accent/10'
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}
