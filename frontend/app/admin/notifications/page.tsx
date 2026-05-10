'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Clock,
  KeyRound,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShoppingCart,
  Trash2,
  Wrench,
  XCircle,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

type ChannelType = 'telegram' | 'facebook' | 'email' | 'sms'
type LogStatus = 'sent' | 'failed' | 'pending'
type NotificationChannel = { id: string; name: string; type: ChannelType; config: string; enabled: boolean }
type NotificationEvent = { id: string; name: string; description: string; icon: typeof Bell; channels: string[] }
type NotificationLog = { id: number; event: string; channel: string; status: LogStatus; message: string; timestamp: string }

type IntegrationSettings = {
  google_client_id?: string | null
  google_client_secret?: string | null
  telegram_bot_token?: string | null
  telegram_chat_id?: string | null
  [key: string]: unknown
}

const initialChannels: NotificationChannel[] = [
  { id: 'telegram-admin', name: 'Telegram Admin', type: 'telegram', config: 'Bot + Chat ID', enabled: true },
  { id: 'facebook-page', name: 'Facebook Page', type: 'facebook', config: 'HTech Store Inbox', enabled: false },
  { id: 'support-email', name: 'Support Email', type: 'email', config: 'admin@htech.vn', enabled: false },
]

const initialEvents: NotificationEvent[] = [
  { id: 'new_order', name: 'Đơn hàng mới', description: 'Báo khi khách đặt đơn hoặc giữ hàng.', icon: ShoppingCart, channels: ['telegram-admin'] },
  { id: 'paid_order', name: 'Thanh toán thành công', description: 'Báo khi khách gửi bằng chứng thanh toán.', icon: CheckCircle, channels: ['telegram-admin'] },
  { id: 'low_stock', name: 'Cảnh báo tồn kho', description: 'Báo khi sản phẩm sắp hết hàng.', icon: AlertTriangle, channels: ['telegram-admin'] },
  { id: 'new_message', name: 'Tin nhắn cần hỗ trợ', description: 'Khách hỏi AI concierge cần nhân viên hỗ trợ.', icon: MessageCircle, channels: ['telegram-admin'] },
  { id: 'new_repair', name: 'Yêu cầu sửa chữa', description: 'Có ticket sửa chữa vừa được tạo.', icon: Wrench, channels: ['telegram-admin'] },
]

const initialLogs: NotificationLog[] = [
  { id: 1, event: 'Đơn hàng mới', channel: 'Telegram', status: 'sent', message: 'ORD-1234 - iPhone 15 Pro - 29,990,000 VND', timestamp: '2 phút trước' },
  { id: 2, event: 'Thanh toán thành công', channel: 'Telegram', status: 'sent', message: 'ORD-1234 đã đặt cọc thành công.', timestamp: '5 phút trước' },
  { id: 3, event: 'Tin nhắn cần hỗ trợ', channel: 'Telegram', status: 'failed', message: 'Khách hỏi về MacBook Air M3.', timestamp: '15 phút trước' },
  { id: 4, event: 'Cảnh báo tồn kho', channel: 'Telegram', status: 'pending', message: 'iPhone 15 Pro còn 3 sản phẩm.', timestamp: '1 giờ trước' },
]

const channelMeta = {
  telegram: { label: 'Telegram', icon: Send, color: 'bg-blue-500/10 text-blue-600' },
  facebook: { label: 'Facebook', icon: MessageCircle, color: 'bg-indigo-500/10 text-indigo-600' },
  email: { label: 'Email', icon: Mail, color: 'bg-amber-500/10 text-amber-600' },
  sms: { label: 'SMS', icon: Bell, color: 'bg-green-500/10 text-green-600' },
} satisfies Record<ChannelType, { label: string; icon: typeof Bell; color: string }>

const statusMeta = {
  sent: { label: 'Đã gửi', icon: CheckCircle, color: 'text-green-600' },
  failed: { label: 'Lỗi', icon: XCircle, color: 'text-red-500' },
  pending: { label: 'Đang gửi', icon: Clock, color: 'text-amber-600' },
} satisfies Record<LogStatus, { label: string; icon: typeof Bell; color: string }>

export default function NotificationsPage() {
  const [channels, setChannels] = useState(initialChannels)
  const [events, setEvents] = useState(initialEvents)
  const [logs] = useState(initialLogs)
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings')
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [testSending, setTestSending] = useState<string | null>(null)
  const [newChannel, setNewChannel] = useState({ name: '', type: 'telegram' as ChannelType, config: '' })
  const [settings, setSettings] = useState<IntegrationSettings | null>(null)
  const [telegramBotId, setTelegramBotId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const stats = useMemo(() => ({
    enabled: channels.filter((channel) => channel.enabled).length,
    events: events.length,
    sent: logs.filter((log) => log.status === 'sent').length,
    failed: logs.filter((log) => log.status === 'failed').length,
  }), [channels, events, logs])

  useEffect(() => {
    api.get<IntegrationSettings>('/admin/settings')
      .then(({ data }) => {
        setSettings(data)
        const token = data.telegram_bot_token || ''
        setTelegramBotId(token.includes(':') ? token.split(':')[0] : '')
      })
      .catch((err: any) => setError(err?.data?.detail || 'Không tải được cấu hình tích hợp.'))
  }, [])

  const updateSettings = (patch: Partial<IntegrationSettings>) => {
    setSettings((current) => ({ ...(current || {}), ...patch }))
    setSaved(false)
  }

  const composeTelegramToken = () => {
    const token = settings?.telegram_bot_token?.trim() || ''
    const botId = telegramBotId.trim()
    if (!botId || !token) return token
    if (token.includes(':')) return `${botId}:${token.split(':').slice(1).join(':')}`
    return `${botId}:${token}`
  }

  const updateTelegramToken = (value: string) => {
    updateSettings({ telegram_bot_token: value })
    if (value.includes(':')) {
      setTelegramBotId(value.split(':')[0])
    }
  }

  const saveIntegrationSettings = async () => {
    if (!settings) return
    const payload = { ...settings, telegram_bot_token: composeTelegramToken() }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api.put('/admin/settings', payload)
      setSettings(payload)
      setSaved(true)
      setMessage('Đã lưu cấu hình tích hợp.')
      setTimeout(() => setSaved(false), 1600)
    } catch (err: any) {
      setError(err?.data?.detail || 'Không lưu được cấu hình tích hợp.')
    } finally {
      setSaving(false)
    }
  }

  const toggleEventChannel = (eventId: string, channelId: string) => {
    setEvents((current) => current.map((event) => event.id === eventId ? {
      ...event,
      channels: event.channels.includes(channelId)
        ? event.channels.filter((id) => id !== channelId)
        : [...event.channels, channelId],
    } : event))
  }

  const addChannel = () => {
    if (!newChannel.name || !newChannel.config) return
    setChannels((current) => [...current, { id: `${newChannel.type}-${Date.now()}`, ...newChannel, enabled: true }])
    setNewChannel({ name: '', type: 'telegram', config: '' })
    setShowAddChannel(false)
  }

  const sendTestNotification = async (channelId = 'telegram-admin') => {
    setError('')
    setMessage('')
    setTestSending(channelId)
    const channel = channels.find((item) => item.id === channelId)
    try {
      if (channel?.type === 'telegram') {
        const token = composeTelegramToken()
        if (!telegramBotId.trim() || !token || !settings?.telegram_chat_id) {
          setError('Chưa cấu hình Telegram Bot ID, Bot Token và Chat ID.')
          return
        }
        await api.post('/admin/test-telegram', {
          bot_id: telegramBotId,
          token,
          chat_id: settings.telegram_chat_id,
        })
        setMessage('Đã gửi tin nhắn thử Telegram.')
      }
    } catch (err: any) {
      setError(err?.data?.detail || 'Không gửi được thông báo thử.')
    } finally {
      setTestSending(null)
    }
  }

  return (
    <>
      <AdminHeader title="Thông báo" subtitle="Cấu hình kênh cảnh báo cho đơn hàng, tồn kho và hỗ trợ khách hàng" />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Kênh đang bật" value={stats.enabled} icon={Bell} />
          <StatCard label="Sự kiện" value={stats.events} icon={AlertTriangle} />
          <StatCard label="Đã gửi" value={stats.sent} icon={CheckCircle} tone="green" />
          <StatCard label="Lỗi gần đây" value={stats.failed} icon={XCircle} tone="red" />
        </div>

        <div className="flex gap-2">
          {[['settings', 'Cài đặt'], ['history', 'Lịch sử']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id as 'settings' | 'history')} className={cn('h-10 rounded-lg px-4 text-sm font-semibold transition', activeTab === id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>{label}</button>
          ))}
        </div>

        {(error || message) && (
          <p className={cn('rounded-lg border px-3 py-2 text-sm', error ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-700')}>
            {error || message}
          </p>
        )}

        {activeTab === 'settings' ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-accent" />
                    <h2 className="font-bold text-foreground">Cấu hình tích hợp</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Google login và bot thông báo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => sendTestNotification('telegram-admin')} disabled={testSending === 'telegram-admin' || !telegramBotId.trim() || !settings?.telegram_bot_token || !settings?.telegram_chat_id} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50">
                    <RefreshCw className={cn('h-4 w-4', testSending === 'telegram-admin' && 'animate-spin')} />
                    Gửi thử Telegram
                  </button>
                  <button onClick={saveIntegrationSettings} disabled={saving || !settings} className={cn('inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-60', saved ? 'bg-green-600' : 'bg-accent hover:bg-accent/90')}>
                    {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? 'Đã lưu' : saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Google Client ID">
                  <input value={settings?.google_client_id || ''} onChange={(event) => updateSettings({ google_client_id: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </Field>
                <Field label="Google Client Secret">
                  <input type="password" value={settings?.google_client_secret || ''} onChange={(event) => updateSettings({ google_client_secret: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </Field>
                <Field label="Telegram Bot ID">
                  <input value={telegramBotId} onChange={(event) => { setTelegramBotId(event.target.value); setSaved(false) }} placeholder="123456789" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </Field>
                <Field label="Telegram Bot Token">
                  <input type="password" value={settings?.telegram_bot_token || ''} onChange={(event) => updateTelegramToken(event.target.value)} placeholder="AA... hoặc 123456789:AA..." className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </Field>
                <Field label="Telegram Chat ID">
                  <input value={settings?.telegram_chat_id || ''} onChange={(event) => updateSettings({ telegram_chat_id: event.target.value })} placeholder="ID nhóm hoặc user nhận thông báo" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </Field>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div><h2 className="font-bold text-foreground">Kênh thông báo</h2><p className="mt-1 text-sm text-muted-foreground">Bật tắt, gửi thử và quản lý cấu hình kênh.</p></div>
                  <button onClick={() => setShowAddChannel(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" />Thêm</button>
                </div>
                <div className="mt-5 space-y-3">
                  {channels.map((channel) => {
                    const meta = channelMeta[channel.type]
                    const Icon = meta.icon
                    return (
                      <div key={channel.id} className={cn('rounded-xl border border-border p-4 transition', channel.enabled ? 'bg-background' : 'bg-muted/40 opacity-70')}>
                        <div className="flex items-center gap-3">
                          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', meta.color)}><Icon className="h-4 w-4" /></div>
                          <div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{channel.name}</p><p className="truncate text-sm text-muted-foreground">{channel.config}</p></div>
                          <button onClick={() => sendTestNotification(channel.id)} disabled={!channel.enabled || testSending === channel.id || channel.type !== 'telegram'} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50" aria-label="Gửi thử"><RefreshCw className={cn('h-4 w-4', testSending === channel.id && 'animate-spin')} /></button>
                          <button onClick={() => setChannels((current) => current.filter((item) => item.id !== channel.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" aria-label="Xóa kênh"><Trash2 className="h-4 w-4" /></button>
                          <button onClick={() => setChannels((current) => current.map((item) => item.id === channel.id ? { ...item, enabled: !item.enabled } : item))} className={cn('relative h-6 w-11 rounded-full transition', channel.enabled ? 'bg-green-500' : 'bg-muted')} aria-label="Bật tắt kênh"><span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition', channel.enabled ? 'left-6' : 'left-1')} /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {showAddChannel && <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4"><div className="grid gap-3"><input value={newChannel.name} onChange={(event) => setNewChannel({ ...newChannel, name: event.target.value })} placeholder="Tên kênh" className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" /><select value={newChannel.type} onChange={(event) => setNewChannel({ ...newChannel, type: event.target.value as ChannelType })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"><option value="telegram">Telegram</option><option value="facebook">Facebook Messenger</option><option value="email">Email</option><option value="sms">SMS</option></select><input value={newChannel.config} onChange={(event) => setNewChannel({ ...newChannel, config: event.target.value })} placeholder="Bot, page ID, email hoặc số điện thoại" className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" /><div className="flex gap-2"><button onClick={addChannel} className="h-9 flex-1 rounded-lg bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90">Lưu kênh</button><button onClick={() => setShowAddChannel(false)} className="h-9 flex-1 rounded-lg border border-border text-sm font-semibold hover:bg-muted">Hủy</button></div></div></div>}
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-bold text-foreground">Routing sự kiện</h2>
                <p className="mt-1 text-sm text-muted-foreground">Chọn kênh nào sẽ nhận thông báo cho từng sự kiện.</p>
                <div className="mt-5 space-y-3">
                  {events.map((event) => {
                    const EventIcon = event.icon
                    return <div key={event.id} className="rounded-xl border border-border bg-background p-4"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><EventIcon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{event.name}</p><p className="text-sm text-muted-foreground">{event.description}</p><div className="mt-3 flex flex-wrap gap-2">{channels.map((channel) => <button key={channel.id} onClick={() => toggleEventChannel(event.id, channel.id)} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition', event.channels.includes(channel.id) ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}>{event.channels.includes(channel.id) && <Check className="h-3 w-3" />}{channel.name}</button>)}</div></div></div></div>
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="font-bold text-foreground">Lịch sử thông báo</h2><button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><RefreshCw className="h-4 w-4" />Làm mới</button></div>
            <div className="divide-y divide-border">{logs.map((log) => { const meta = statusMeta[log.status]; const StatusIcon = meta.icon; return <div key={log.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/40"><div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', meta.color)}><StatusIcon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-foreground">{log.event}</p><span className="text-xs text-muted-foreground">qua {log.channel}</span></div><p className="truncate text-sm text-muted-foreground">{log.message}</p></div><div className="text-right"><p className={cn('text-xs font-semibold', meta.color)}>{meta.label}</p><p className="mt-1 text-xs text-muted-foreground">{log.timestamp}</p></div></div> })}</div>
          </section>
        )}
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  )
}

function StatCard({ label, value, icon: Icon, tone = 'default' }: { label: string; value: number; icon: typeof Bell; tone?: 'default' | 'green' | 'red' }) {
  const toneClass = tone === 'green' ? 'text-green-600 bg-green-500/10' : tone === 'red' ? 'text-red-500 bg-red-500/10' : 'text-accent bg-accent/10'
  return <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClass)}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold text-foreground">{value}</p></div></div></div>
}
