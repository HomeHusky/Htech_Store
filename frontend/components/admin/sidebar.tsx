'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Bot,
  AlertTriangle,
  ChevronRight,
  Store,
  Settings,
  LogOut,
  Palette,
  Bell,
  Wrench,
  Tag,
  FolderTree,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { useI18n } from '@/lib/i18n'

export function AdminSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()

  const navItems = [
    {
      label: t('admin.analytics'),
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: t('admin.products'),
      href: '/admin/products',
      icon: Package,
    },
    {
      label: t('admin.categories'),
      href: '/admin/categories',
      icon: FolderTree,
    },
    {
      label: t('admin.orders'),
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      label: t('admin.customers'),
      href: '/admin/customers',
      icon: Users,
    },
    {
      label: t('admin.aiagent'),
      href: '/admin/ai-agent',
      icon: Bot,
    },
    {
      label: t('admin.inventory'),
      href: '/admin/inventory',
      icon: AlertTriangle,
    },
    {
      label: t('admin.repairs'),
      href: '/admin/repairs',
      icon: Wrench,
    },
    {
      label: t('admin.promotions'),
      href: '/admin/promotions',
      icon: Tag,
    },
  ]

  const settingsItems = [
    {
      label: t('admin.appearance'),
      href: '/admin/appearance',
      icon: Palette,
    },
    {
      label: t('admin.notifications'),
      href: '/admin/notifications',
      icon: Bell,
    },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground text-xs font-black">H</span>
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-none">HTech</p>
            <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30 px-2 mb-2">
          {t('admin.management')}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}

        <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30 px-2 mt-6 mb-2">
          {t('admin.settings')}
        </p>
        {settingsItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-sidebar-border flex flex-col gap-0.5">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full text-left"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? t('admin.dark_mode') : t('admin.light_mode')}
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          <Store className="w-4 h-4" />
          {t('admin.view_store')}
        </Link>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left">
          <LogOut className="w-4 h-4" />
          {t('admin.sign_out')}
        </button>
      </div>
    </aside>
  )
}
