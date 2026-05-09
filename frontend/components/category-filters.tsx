"use client"

import { useMemo, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { type Category, type Condition, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"
import { SlidersHorizontal, X } from "lucide-react"

const CONDITIONS: Condition[] = ["Mới 100%", "Likenew 99%", "Cũ giá rẻ"]

const FILTER_CONFIG: Record<
  Category,
  { groups: { key: string; label: string; options: string[] }[] }
> = {
  laptop: {
    groups: [
      { key: "cpu", label: "CPU", options: ["Intel i5", "Intel i7", "Intel i9", "AMD Ryzen", "Apple M3"] },
      { key: "screen", label: "Kích thước màn hình", options: ["13\"", "14\"", "15.6\"", "16\"", "17\""] },
      { key: "weight", label: "Trọng lượng", options: ["< 1.5kg", "1.5 - 2kg", "> 2kg"] },
    ],
  },
  pc: {
    groups: [
      { key: "cpu", label: "CPU", options: ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 7", "AMD Ryzen 9"] },
      { key: "gpu", label: "GPU", options: ["RTX 4060", "RTX 4070", "RTX 4080", "RTX 4090"] },
      { key: "ram", label: "RAM", options: ["16GB", "32GB", "64GB"] },
    ],
  },
  smartphone: {
    groups: [
      { key: "camera", label: "Camera (MP)", options: ["12MP", "48MP", "50MP", "200MP"] },
      { key: "battery", label: "Pin", options: ["< 4000mAh", "4000-5000mAh", "> 5000mAh"] },
      { key: "os", label: "Hệ điều hành", options: ["iOS", "Android"] },
    ],
  },
  tablet: {
    groups: [
      { key: "screen", label: "Màn hình", options: ["10\"", "11\"", "13\"", "14.6\""] },
      { key: "battery", label: "Pin", options: ["10h", "11h", "15h+"] },
      { key: "os", label: "Hệ điều hành", options: ["iPadOS", "Android", "Windows"] },
    ],
  },
}

type Selected = {
  brands: Set<string>
  conditions: Set<Condition>
  groups: Record<string, Set<string>>
  inStock: boolean
}

function FilterSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border py-4">
      <p className="mb-3 font-heading text-sm font-semibold text-foreground">{label}</p>
      {children}
    </div>
  )
}

function CheckChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/70 hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

export function CategoryFilters({
  category,
  products,
}: {
  category: Category
  products: Product[]
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selected, setSelected] = useState<Selected>({
    brands: new Set(),
    conditions: new Set(),
    groups: {},
    inStock: false,
  })
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc">("popular")

  const config = FILTER_CONFIG[category]

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )

  const filtered = useMemo(() => {
    let list = products
    if (selected.brands.size) list = list.filter((p) => selected.brands.has(p.brand))
    if (selected.conditions.size)
      list = list.filter((p) => selected.conditions.has(p.condition))
    if (selected.inStock) list = list.filter((p) => p.inStock)
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price)
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, selected, sort])

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  function reset() {
    setSelected({ brands: new Set(), conditions: new Set(), groups: {}, inStock: false })
  }

  const activeCount =
    selected.brands.size +
    selected.conditions.size +
    (selected.inStock ? 1 : 0) +
    Object.values(selected.groups).reduce((s, v) => s + v.size, 0)

  const sidebar = (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-3">
        <p className="font-heading text-base font-semibold text-foreground">Bộ lọc</p>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="text-xs font-medium text-primary hover:underline"
          >
            Xóa tất cả ({activeCount})
          </button>
        )}
      </div>

      <FilterSection label="Tình trạng máy">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <CheckChip
              key={c}
              active={selected.conditions.has(c)}
              onClick={() =>
                setSelected({ ...selected, conditions: toggle(selected.conditions, c) })
              }
            >
              {c}
            </CheckChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Thương hiệu">
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <CheckChip
              key={b}
              active={selected.brands.has(b)}
              onClick={() => setSelected({ ...selected, brands: toggle(selected.brands, b) })}
            >
              {b}
            </CheckChip>
          ))}
        </div>
      </FilterSection>

      {config.groups.map((g) => (
        <FilterSection key={g.key} label={g.label}>
          <div className="flex flex-wrap gap-2">
            {g.options.map((opt) => {
              const set = selected.groups[g.key] ?? new Set<string>()
              const active = set.has(opt)
              return (
                <CheckChip
                  key={opt}
                  active={active}
                  onClick={() => {
                    const next = new Set(set)
                    if (active) next.delete(opt)
                    else next.add(opt)
                    setSelected({
                      ...selected,
                      groups: { ...selected.groups, [g.key]: next },
                    })
                  }}
                >
                  {opt}
                </CheckChip>
              )
            })}
          </div>
        </FilterSection>
      ))}

      <FilterSection label="Tồn kho">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={selected.inStock}
            onChange={(e) => setSelected({ ...selected, inStock: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Chỉ hiện sản phẩm còn hàng
        </label>
      </FilterSection>
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
          {sidebar}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-foreground/40" />
          <div
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-heading text-lg font-semibold">Bộ lọc</p>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Lọc
              {activeCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground">Sắp xếp:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="popular">Phổ biến</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-heading text-base font-semibold text-foreground">
              Không có sản phẩm phù hợp
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy thử bỏ bớt một vài bộ lọc.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
