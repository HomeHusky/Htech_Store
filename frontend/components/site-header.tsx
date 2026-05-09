"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Sparkles,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Wrench,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORY_SUBMENU } from "@/lib/products"
import { cn } from "@/lib/utils"

type CategoryKey = "laptop" | "pc" | "smartphone" | "tablet"

const NAV: { key: CategoryKey; label: string; icon: typeof Laptop }[] = [
  { key: "laptop", label: "Laptop", icon: Laptop },
  { key: "pc", label: "PC / Desktop", icon: Monitor },
  { key: "smartphone", label: "Smartphone", icon: Smartphone },
  { key: "tablet", label: "Tablet", icon: Tablet },
]

export function SiteHeader() {
  const [open, setOpen] = useState<CategoryKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        {/* Mobile trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/htech-logo.png"
            alt="H-TECH logo"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 object-contain"
            priority
          />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            H-TECH
          </span>
        </Link>

        {/* Desktop nav with mega menu */}
        <nav
          className="relative hidden items-center gap-1 lg:flex"
          onMouseLeave={() => setOpen(null)}
        >
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onMouseEnter={() => setOpen(key)}
              onFocus={() => setOpen(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground",
                open === key && "bg-secondary text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          ))}
          <Link
            href="/repair"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Wrench className="h-4 w-4" />
            Repair Service
          </Link>

          {/* Mega menu panel */}
          {open && (
            <div
              className="absolute left-0 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-xl"
              onMouseEnter={() => setOpen(open)}
              style={{ width: "min(560px, 90vw)" }}
            >
              <div className="p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Danh mục {NAV.find((n) => n.key === open)?.label}
                </p>
                <ul className="grid grid-cols-2 gap-1">
                  {CATEGORY_SUBMENU[open].map((sub) => (
                    <li key={sub}>
                      <Link
                        href={`/category/${open}?sub=${encodeURIComponent(sub)}`}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary"
                      >
                        {sub}
                        <span className="text-xs text-muted-foreground">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </nav>

        {/* Smart search */}
        <div className="ml-auto flex flex-1 items-center justify-end gap-2 lg:ml-4">
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="AI Search: 'laptop gaming dưới 25 triệu'..."
              className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="AI Smart Search"
            />
            <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI
            </span>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Tìm kiếm">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Yêu thích" className="hidden sm:inline-flex">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Tài khoản" className="hidden sm:inline-flex">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="default" size="icon" aria-label="Giỏ hàng">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                href={`/category/${key}`}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Link
              href="/repair"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
              onClick={() => setMobileOpen(false)}
            >
              <Wrench className="h-4 w-4" />
              Repair Service
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
