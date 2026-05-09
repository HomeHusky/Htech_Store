import Link from "next/link"
import { ArrowRight, PackageOpen } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { type Product } from "@/lib/products"

type Hub = {
  id: string
  title: string
  tagline: string
  href: string
  accent: string
  products: Product[]
}

export function CategoryHub({ hub }: { hub: Hub }) {
  const items = hub.products.slice(0, 4)

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${hub.accent}`}
          >
            {hub.id}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-foreground lg:text-3xl">
            {hub.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{hub.tagline}</p>
        </div>
        <Link
          href={hub.href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <Empty className="rounded-2xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen />
            </EmptyMedia>
            <EmptyTitle>Chưa có sản phẩm</EmptyTitle>
            <EmptyDescription>
              Sản phẩm cho khu vực này sẽ hiển thị sau khi được thêm trong Admin → Kho &amp; Danh mục.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="outline" size="sm">
              <Link href={hub.href}>Khám phá danh mục</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
