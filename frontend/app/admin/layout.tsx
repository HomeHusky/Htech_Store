import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'

export const metadata: Metadata = {
  title: 'HTech Admin — Dashboard',
  description: 'HTech Store admin panel — analytics, products, orders, and AI settings',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
