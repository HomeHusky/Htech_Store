'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { canAccessAdmin, fetchMe, getStoredToken, type AuthUser } from '@/lib/auth'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    fetchMe()
      .then((currentUser) => {
        if (!canAccessAdmin(currentUser)) {
          router.replace('/login')
          return
        }
        setUser(currentUser)
      })
      .catch(() => {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      })
      .finally(() => setChecking(false))
  }, [pathname, router])

  if (checking || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Đang kiểm tra quyền truy cập...
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="ml-60 flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
