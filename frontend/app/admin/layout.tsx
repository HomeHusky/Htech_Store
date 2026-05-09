import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/sidebar'

export const metadata: Metadata = {
  title: 'HTech Admin — Dashboard',
  description: 'HTech Store admin panel — analytics, products, orders, and AI settings',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 ml-60 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
