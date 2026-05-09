import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Bell, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "HTech Admin Console",
  description: "HTech multi-entity management dashboard",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
              className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              aria-label="Thông báo"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-primary"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
            </button>
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                AD
              </span>
              <div className="hidden text-xs sm:block">
                <p className="font-semibold text-foreground">Admin HTech</p>
                <p className="text-muted-foreground">admin@htech.vn</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
