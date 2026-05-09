"use client"

import { useState } from "react"
import {
  Save,
  Image as ImageIcon,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Plus,
  Layers,
  PackageOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { type Category } from "@/lib/products"

const CATEGORIES: { key: Category | "all"; label: string; icon: typeof Laptop }[] = [
  { key: "all", label: "Tất cả", icon: Layers },
  { key: "laptop", label: "Laptop", icon: Laptop },
  { key: "pc", label: "PC", icon: Monitor },
  { key: "smartphone", label: "Smartphone", icon: Smartphone },
  { key: "tablet", label: "Tablet", icon: Tablet },
]

const FORM_CATEGORIES: { key: Category; label: string; icon: typeof Laptop }[] = [
  { key: "laptop", label: "Laptop", icon: Laptop },
  { key: "pc", label: "PC / Desktop", icon: Monitor },
  { key: "smartphone", label: "Smartphone", icon: Smartphone },
  { key: "tablet", label: "Tablet", icon: Tablet },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

export default function InventoryPage() {
  const [tab, setTab] = useState<"list" | "create">("list")
  const [filter, setFilter] = useState<Category | "all">("all")
  const [query, setQuery] = useState("")
  const [formCategory, setFormCategory] = useState<Category>("laptop")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Kho &amp; Danh mục</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý sản phẩm thống nhất — JSONB metadata cho specs đa danh mục.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setTab("list")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
              tab === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Danh sách
          </button>
          <button
            onClick={() => setTab("create")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
              tab === "create"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {tab === "list" && (
        <>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
            {CATEGORIES.map(({ key, label, icon: Icon }) => {
              const active = filter === key
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    0
                  </span>
                </button>
              )
            })}
          </div>

          <section className="rounded-xl border border-border bg-card">
            <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên hoặc thương hiệu..."
                  className="h-9 w-full rounded-lg border border-border bg-secondary/40 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <span className="ml-auto text-xs text-muted-foreground">0 sản phẩm</span>
            </header>

            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageOpen />
                </EmptyMedia>
                <EmptyTitle>Kho hàng đang trống</EmptyTitle>
                <EmptyDescription>
                  Bắt đầu bằng cách thêm sản phẩm đầu tiên với specs theo từng danh mục.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setTab("create")}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Thêm sản phẩm đầu tiên
                </Button>
              </EmptyContent>
            </Empty>
          </section>
        </>
      )}

      {tab === "create" && (
        <>
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
              {FORM_CATEGORIES.map(({ key, label, icon: Icon }) => {
                const active = formCategory === key
                return (
                  <button
                    key={key}
                    onClick={() => setFormCategory(key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground/70 hover:bg-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 font-heading text-base font-semibold text-foreground">
                  Thông tin chung
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Tên sản phẩm">
                    <input className={inputCls} placeholder="Tên sản phẩm" />
                  </Field>
                  <Field label="Slug URL">
                    <input className={inputCls} placeholder="ten-san-pham" />
                  </Field>
                  <Field label="Thương hiệu">
                    <input className={inputCls} placeholder="VD: Apple" />
                  </Field>
                  <Field label="Tình trạng">
                    <select className={inputCls} defaultValue="">
                      <option value="" disabled>
                        Chọn tình trạng
                      </option>
                      <option>Mới 100%</option>
                      <option>Likenew 99%</option>
                      <option>Cũ giá rẻ</option>
                    </select>
                  </Field>
                  <Field label="Giá bán (VND)">
                    <input className={inputCls} type="number" placeholder="0" />
                  </Field>
                  <Field label="Giá gạch (VND)">
                    <input className={inputCls} type="number" placeholder="0" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Mô tả ngắn">
                      <textarea
                        className={cn(inputCls, "h-24 py-2.5")}
                        placeholder="Mô tả sản phẩm..."
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    Thông số kỹ thuật{" "}
                    <span className="text-xs font-normal text-muted-foreground">(JSONB)</span>
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {FORM_CATEGORIES.find((c) => c.key === formCategory)?.label}
                  </span>
                </div>

                {formCategory === "laptop" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="CPU"><input className={inputCls} placeholder="VD: Intel Core i7" /></Field>
                    <Field label="RAM"><input className={inputCls} placeholder="VD: 16GB" /></Field>
                    <Field label="GPU"><input className={inputCls} placeholder="VD: RTX 4060" /></Field>
                    <Field label="Màn hình"><input className={inputCls} placeholder='VD: 16" 240Hz' /></Field>
                    <Field label="Trọng lượng"><input className={inputCls} placeholder="VD: 2.5kg" /></Field>
                    <Field label="Pin"><input className={inputCls} placeholder="VD: 90Wh" /></Field>
                  </div>
                )}
                {formCategory === "pc" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="CPU"><input className={inputCls} placeholder="VD: Intel i7" /></Field>
                    <Field label="RAM"><input className={inputCls} placeholder="VD: 32GB DDR5" /></Field>
                    <Field label="GPU"><input className={inputCls} placeholder="VD: RTX 4080" /></Field>
                    <Field label="Lưu trữ"><input className={inputCls} placeholder="VD: 2TB NVMe" /></Field>
                    <Field label="PSU"><input className={inputCls} placeholder="VD: 850W Gold" /></Field>
                    <Field label="Case"><input className={inputCls} placeholder="VD: Lian Li" /></Field>
                  </div>
                )}
                {formCategory === "smartphone" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Chipset"><input className={inputCls} placeholder="VD: Snapdragon 8 Gen 3" /></Field>
                    <Field label="Màn hình"><input className={inputCls} placeholder='VD: 6.8" AMOLED' /></Field>
                    <Field label="Pin (mAh)"><input className={inputCls} type="number" placeholder="0" /></Field>
                    <Field label="Camera chính"><input className={inputCls} placeholder="VD: 50MP" /></Field>
                    <Field label="Hệ điều hành">
                      <select className={inputCls} defaultValue="">
                        <option value="" disabled>Chọn HĐH</option>
                        <option>iOS</option>
                        <option>Android</option>
                      </select>
                    </Field>
                    <Field label="Bộ nhớ"><input className={inputCls} placeholder="VD: 256GB" /></Field>
                  </div>
                )}
                {formCategory === "tablet" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Chipset"><input className={inputCls} placeholder="VD: Apple M4" /></Field>
                    <Field label="Màn hình"><input className={inputCls} placeholder='VD: 11" OLED' /></Field>
                    <Field label="Pin"><input className={inputCls} placeholder="VD: 10h" /></Field>
                    <Field label="Hệ điều hành">
                      <select className={inputCls} defaultValue="">
                        <option value="" disabled>Chọn HĐH</option>
                        <option>iPadOS</option>
                        <option>Android</option>
                        <option>Windows</option>
                      </select>
                    </Field>
                    <Field label="Hỗ trợ bút"><input className={inputCls} placeholder="VD: Apple Pencil" /></Field>
                    <Field label="Kết nối"><input className={inputCls} placeholder="VD: Wi-Fi 6E" /></Field>
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-heading text-base font-semibold text-foreground">Hình ảnh</h2>
                <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/40 text-center">
                  <div className="space-y-2 px-4">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Kéo thả ảnh vào đây</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG — tối đa 5MB</p>
                    <Button variant="outline" size="sm">
                      Chọn file
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-heading text-base font-semibold text-foreground">Trạng thái</h2>
                <div className="space-y-3">
                  <Field label="Tồn kho">
                    <input className={inputCls} type="number" placeholder="0" />
                  </Field>
                  <Field label="Hub trang chủ">
                    <select className={inputCls} defaultValue="">
                      <option value="">— Không —</option>
                      <option value="gaming">Gaming Zone</option>
                      <option value="office">Office Elite</option>
                      <option value="mobile">Mobile World</option>
                    </select>
                  </Field>
                  <label className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-primary" />
                    <span className="font-medium text-foreground">Hiển thị trên cửa hàng</span>
                  </label>
                </div>
              </section>

              <Button className="w-full">
                <Save className="mr-1.5 h-4 w-4" />
                Lưu sản phẩm
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
