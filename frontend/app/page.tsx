import Link from "next/link"
import { ShieldCheck, Truck, BadgePercent, Wrench } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSlider } from "@/components/hero-slider"
import { BrandRibbon } from "@/components/brand-ribbon"
import { CategoryHub } from "@/components/category-hub"
import { AiChatBubble } from "@/components/ai-chat-bubble"
import { getProductsByHub } from "@/lib/products"

const PERKS = [
  { icon: Truck, title: "Free shipping", sub: "Toàn quốc — đơn từ 500K" },
  { icon: ShieldCheck, title: "Bảo hành VIP", sub: "Đến 36 tháng chính hãng" },
  { icon: BadgePercent, title: "Trả góp 0%", sub: "Duyệt online 5 phút" },
  { icon: Wrench, title: "Sửa chữa nhanh", sub: "Lấy ngay trong 60 phút" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-6 lg:px-6 lg:py-10">
        <HeroSlider />

        {/* Perks bar */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </section>

        <BrandRibbon />

        <CategoryHub
          hub={{
            id: "Gaming Zone",
            title: "Gaming Zone",
            tagline: "Khu vực Gaming — PC & Laptop hiệu năng cao.",
            href: "/category/pc",
            accent: "bg-rose-50 text-rose-600",
            products: getProductsByHub("gaming"),
          }}
        />

        <CategoryHub
          hub={{
            id: "Office Elite",
            title: "Office Elite",
            tagline: "Khu vực văn phòng & sáng tạo.",
            href: "/category/laptop",
            accent: "bg-primary/10 text-primary",
            products: getProductsByHub("office"),
          }}
        />

        <CategoryHub
          hub={{
            id: "Mobile World",
            title: "Mobile World",
            tagline: "Khu vực Smartphone đa thương hiệu.",
            href: "/category/smartphone",
            accent: "bg-emerald-50 text-emerald-700",
            products: getProductsByHub("mobile"),
          }}
        />

        {/* Repair CTA */}
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Wrench className="h-3.5 w-3.5" />
                H-TECH Repair
              </span>
              <h2 className="font-heading text-3xl font-bold lg:text-4xl text-balance">
                Sửa chữa Laptop, PC &amp; Smartphone
              </h2>
              <p className="max-w-md text-sm text-white/70 text-pretty">
                Đặt lịch sửa chữa hoặc nhận báo giá nhanh từ AI Agent.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/repair"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Đặt lịch ngay
                </Link>
                <Link
                  href="/repair#quote"
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Báo giá AI
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <AiChatBubble />
    </div>
  )
}
