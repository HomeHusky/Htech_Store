'use client'

import { useEffect, useMemo, useState } from 'react'
import { KeyRound, Plus, RefreshCw, Save, Shield, Trash2, UserCog } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { AdminListSkeleton } from '@/components/loading-skeletons'

type UserRole = 'USER' | 'STAFF' | 'ADMIN'
type UserPermission = 'NONE' | 'READ_ONLY' | 'FULL'

type UserDTO = {
  id?: string
  email: string
  username?: string | null
  password?: string
  full_name?: string | null
  role: UserRole
  permission: UserPermission
}

const blankUser: UserDTO = {
  email: '',
  username: '',
  password: '',
  full_name: '',
  role: 'USER',
  permission: 'NONE',
}

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<UserDTO[]>([])
  const [selectedId, setSelectedId] = useState<string>('new')
  const [draft, setDraft] = useState<UserDTO>(blankUser)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selected = useMemo(() => users.find((user) => user.id === selectedId), [selectedId, users])

  const loadUsers = () => {
    setLoading(true)
    setError('')
    api.get<UserDTO[]>('/admin/users')
      .then(({ data }) => {
        setUsers(data)
        if (selectedId !== 'new' && !data.some((user) => user.id === selectedId)) {
          setSelectedId(data[0]?.id || 'new')
        }
      })
      .catch((err: any) => setError(err?.data?.detail || 'Không tải được danh sách tài khoản.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedId === 'new') {
      setDraft(blankUser)
      return
    }
    if (selected) {
      setDraft({ ...selected, password: '' })
    }
  }, [selected, selectedId])

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    const payload = { ...draft, username: draft.username || draft.email }
    if (!payload.password) delete payload.password

    try {
      if (selectedId === 'new') {
        await api.post('/admin/users', payload)
        setMessage('Đã tạo tài khoản mới.')
      } else {
        await api.put(`/admin/users/${selectedId}`, payload)
        setMessage('Đã cập nhật tài khoản.')
      }
      loadUsers()
    } catch (err: any) {
      setError(err?.data?.detail || 'Không lưu được tài khoản. Hãy kiểm tra quyền admin và dữ liệu nhập.')
    } finally {
      setSaving(false)
    }
  }

  const removeUser = async (userId?: string) => {
    if (!userId) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await api.delete(`/admin/users/${userId}`)
      setSelectedId('new')
      setMessage('Đã xóa tài khoản.')
      loadUsers()
    } catch (err: any) {
      setError(err?.data?.detail || 'Không xóa được tài khoản này.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Tài khoản admin" subtitle="Quản lý tài khoản, role và mật khẩu dùng để vào trang admin" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-bold text-foreground">Danh sách tài khoản</h2>
              </div>
              <button onClick={loadUsers} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Làm mới">
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </button>
            </div>

            <div className="p-3">
              <button
                onClick={() => setSelectedId('new')}
                className={cn('mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition', selectedId === 'new' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted')}
              >
                <Plus className="h-4 w-4" />
                Tạo tài khoản
              </button>

              {loading ? (
                <AdminListSkeleton count={4} />
              ) : users.length === 0 ? (
                <p className="rounded-lg bg-muted px-3 py-4 text-sm text-muted-foreground">Chưa có tài khoản.</p>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedId(user.id || 'new')}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition', selectedId === user.id ? 'bg-accent/10 text-foreground' : 'hover:bg-muted')}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-xs font-black text-background">
                        {(user.full_name || user.username || user.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{user.full_name || user.username || user.email}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="rounded-md border border-border px-2 py-1 text-[10px] font-bold text-muted-foreground">{user.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
                  <UserCog className="h-5 w-5 text-accent" />
                  {selectedId === 'new' ? 'Tạo tài khoản mới' : 'Chỉnh sửa tài khoản'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Đặt role `ADMIN` và permission `FULL` cho tài khoản có quyền quản lý đầy đủ.</p>
              </div>
              {selectedId !== 'new' && (
                <button
                  onClick={() => removeUser(selectedId)}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              )}
            </div>

            {message && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
            {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <form onSubmit={saveUser} className="grid gap-4 md:grid-cols-2">
              <Field label="Email">
                <input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
              </Field>
              <Field label="Username">
                <input value={draft.username || ''} onChange={(event) => setDraft({ ...draft, username: event.target.value })} placeholder="Mặc định dùng email" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
              </Field>
              <Field label="Họ tên">
                <input value={draft.full_name || ''} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
              </Field>
              <Field label={selectedId === 'new' ? 'Mật khẩu' : 'Mật khẩu mới'}>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="password" value={draft.password || ''} onChange={(event) => setDraft({ ...draft, password: event.target.value })} required={selectedId === 'new'} placeholder={selectedId === 'new' ? 'Bắt buộc' : 'Để trống nếu không đổi'} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent" />
                </div>
              </Field>
              <Field label="Role">
                <select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as UserRole })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </Field>
              <Field label="Permission">
                <select value={draft.permission} onChange={(event) => setDraft({ ...draft, permission: event.target.value as UserPermission })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
                  <option value="NONE">NONE</option>
                  <option value="READ_ONLY">READ_ONLY</option>
                  <option value="FULL">FULL</option>
                </select>
              </Field>

              <div className="md:col-span-2">
                <button disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent disabled:opacity-60">
                  <Save className="h-4 w-4" />
                  {saving ? 'Đang lưu...' : 'Lưu tài khoản'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
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
