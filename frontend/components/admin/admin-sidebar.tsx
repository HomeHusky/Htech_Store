"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Tag,
  Wrench,
  Users,
  Bot,
  Image as ImageIcon,
  BarChart3,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin", label: "Tổng quan", sub: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn hàng", sub: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Kho & Danh mục", sub: "Inventory", icon: Boxes },
  { href: "/admin/promotions", label: "Khuyến mãi", sub: "Promotions", icon: Tag },
  { href: "/admin/repairs", label: "Xưởng sửa chữa", sub: "Repair Workshop", icon: Wrench },
  { href: "/admin/users", label: "Người dùng", sub: "CRM", icon: Users },
  { href: "/admin/ai", label: "AI & Chính sách", sub: "AI & Policies", icon: Bot },
  { href: "/admin/cms", label: "Giao diện", sub: "Layout CMS", icon: ImageIcon },
  { href: "/admin/statistics", label: "Thống kê", sub: "Statistics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Thông báo", sub: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Cài đặt", sub: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white">
          <Image
            src="/htech-logo.png"
            alt="H-TECH logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold tracking-tight">H-TECH</p>
            <p className="truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Admin Console
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto grid h-7 w-7 place-items-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map(({ href, label, sub, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? `${label} · ${sub}` : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{label}</span>
                  <span
                    className={cn(
                      "block truncate text-[10px] uppercase tracking-wider",
                      active ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/40",
                    )}
                  >
                    {sub}
                  </span>
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
