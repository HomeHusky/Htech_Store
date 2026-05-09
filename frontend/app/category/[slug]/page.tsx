import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CategoryFilters } from "@/components/category-filters"
import { AiChatBubble } from "@/components/ai-chat-bubble"
import {
  CATEGORY_LABEL,
  CATEGORY_SUBMENU,
  getProductsByCategory,
  type Category,
} from "@/lib/products"

const VALID: Category[] = ["laptop", "pc", "smartphone", "tablet"]

const SEO_DESCRIPTIONS: Record<Category, string> = {
  laptop:
    "Laptop chính hãng giá tốt — Dell, Asus, HP, MSI, MacBook. Trả góp 0%, bảo hành lên đến 36 tháng.",
  pc: "PC Gaming, Workstation và All-in-One — build theo cấu hình, RTX 40-series, bảo hành dài hạn.",
  smartphone:
    "iPhone, Samsung, Xiaomi giá rẻ chính hãng. Thu cũ đổi mới đến 8 triệu, trả góp 0%.",
  tablet: "iPad, Galaxy Tab, Surface — máy tính bảng cho học tập, sáng tạo và giải trí.",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!VALID.includes(slug as Category)) return {}
  const cat = slug as Category
  return {
    title: `${CATEGORY_LABEL[cat]} chính hãng — giá tốt`,
    description: SEO_DESCRIPTIONS[cat],
    keywords: [CATEGORY_LABEL[cat], ...CATEGORY_SUBMENU[cat]],
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!VALID.includes(slug as Category)) notFound()

  const category = slug as Category
  const products = getProductsByCategory(category)
  const subcategories = CATEGORY_SUBMENU[category]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{CATEGORY_LABEL[category]}</span>
        </nav>

        {/* Category header */}
        <header className="mt-4 rounded-2xl border border-border bg-card p-6 lg:p-8">
          <h1 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">
            {CATEGORY_LABEL[category]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
            {SEO_DESCRIPTIONS[category]}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Link
                key={sub}
                href={`/category/${category}?sub=${encodeURIComponent(sub)}`}
                className="rounded-full border border-border bg-secondary/50 px-3.5 py-1.5 text-sm font-medium text-foreground/80 hover:border-primary hover:text-primary"
              >
                {sub}
              </Link>
            ))}
          </div>
        </header>

        <div className="mt-6">
          <CategoryFilters category={category} products={products} />
        </div>
      </main>

      <SiteFooter />
      <AiChatBubble />
    </div>
  )
}
