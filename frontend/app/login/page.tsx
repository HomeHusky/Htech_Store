'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, LogIn, Store } from 'lucide-react'
import { canAccessAdmin, fetchMe, googleLoginUrl, loginWithPassword, storeToken } from '@/lib/auth'
import { cn } from '@/lib/utils'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Đăng nhập để tiếp tục.')
  const [error, setError] = useState('')

  const next = searchParams.get('next') || '/admin'

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    storeToken(token)
    setLoading(true)
    fetchMe()
      .then((user) => {
        router.replace(canAccessAdmin(user) ? next : '/')
      })
      .catch(() => {
        setError('Không xác thực được phiên đăng nhập Google.')
      })
      .finally(() => setLoading(false))
  }, [next, router, searchParams])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginWithPassword(identifier, password)
      if (canAccessAdmin(user)) {
        router.replace(next)
      } else {
        setMessage('Tài khoản đã đăng nhập, nhưng không có quyền vào trang admin.')
        router.replace('/')
      }
    } catch (err: any) {
      setError(err?.data?.detail || 'Sai tài khoản hoặc mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Store className="h-4 w-4" />
          </span>
          HTech Store
        </Link>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-foreground">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Email hoặc username</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Mật khẩu</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              disabled={loading}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition hover:bg-accent disabled:opacity-60',
              )}
            >
              <KeyRound className="h-4 w-4" />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập admin'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground">hoặc</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <a
            href={googleLoginUrl()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <span className="text-base font-black">G</span>
            Đăng nhập bằng Google
          </a>

          <Link href="/" className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <LogIn className="h-4 w-4" />
            Quay lại cửa hàng
          </Link>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <LoginContent />
    </Suspense>
  )
}
