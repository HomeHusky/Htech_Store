"use client"

import { useState } from "react"
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
import { Globe, Receipt, Truck, Users, Plus, UserCog } from "lucide-react"

type Tab = "seo" | "tax" | "shipping" | "admins"

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("seo")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-sm text-muted-foreground">
          SEO, thuế VAT, phí giao hàng và phân quyền quản trị viên.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Side tabs */}
        <nav className="space-y-1">
          {[
            { k: "seo", label: "SEO meta tags", icon: Globe },
            { k: "tax", label: "Thuế VAT", icon: Receipt },
            { k: "shipping", label: "Phí vận chuyển", icon: Truck },
            { k: "admins", label: "Admin User & Roles", icon: Users },
          ].map((t) => {
            const Icon = t.icon
            const active = tab === t.k
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k as Tab)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </nav>

        <section className="rounded-xl border border-border bg-card p-6">
          {tab === "seo" && (
            <>
              <h2 className="mb-1 font-heading text-lg font-bold text-foreground">SEO meta tags</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Tối ưu hiển thị trên Google và mạng xã hội.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Site title">
                  <input className={inputCls} placeholder="VD: H-TECH — Laptop, điện thoại, linh phụ kiện" />
                </Field>
                <Field label="Site URL">
                  <input className={inputCls} placeholder="https://" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Meta description" hint="Tối đa 160 ký tự">
                    <textarea
                      className={cn(inputCls, "h-24 py-2.5")}
                      placeholder="Mô tả ngắn gọn về cửa hàng..."
                    />
                  </Field>
                </div>
                <Field label="Keywords">
                  <input className={inputCls} placeholder="VD: laptop, điện thoại, linh phụ kiện" />
                </Field>
                <Field label="OG Image URL">
                  <input className={inputCls} placeholder="/htech-logo.png" />
                </Field>
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline">Hủy</Button>
                <Button>Lưu thay đổi</Button>
              </div>
            </>
          )}

          {tab === "tax" && (
            <>
              <h2 className="mb-1 font-heading text-lg font-bold text-foreground">Thuế VAT</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Tự động cộng VAT vào hóa đơn nếu được bật.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Mã số thuế">
                  <input className={inputCls} placeholder="VD: 0312345678" />
                </Field>
                <Field label="Tỷ lệ VAT (%)">
                  <input className={inputCls} type="number" placeholder="10" />
                </Field>
                <Field label="Tên doanh nghiệp">
                  <input className={inputCls} placeholder="Nhập tên doanh nghiệp" />
                </Field>
                <Field label="Địa chỉ xuất hóa đơn">
                  <input className={inputCls} placeholder="Nhập địa chỉ" />
                </Field>
              </div>
              <label className="mt-4 flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-primary" />
                <span className="font-medium text-foreground">
                  Tự động cộng VAT vào giá hiển thị cho khách hàng
                </span>
              </label>
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline">Hủy</Button>
                <Button>Lưu thay đổi</Button>
              </div>
            </>
          )}

          {tab === "shipping" && (
            <>
              <h2 className="mb-1 font-heading text-lg font-bold text-foreground">Phí vận chuyển</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Cấu hình vùng giao và mức phí mặc định.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Phí nội thành (VND)">
                  <input className={inputCls} type="number" placeholder="0" />
                </Field>
                <Field label="Phí ngoại thành / tỉnh (VND)">
                  <input className={inputCls} type="number" placeholder="0" />
                </Field>
                <Field label="Miễn phí từ đơn (VND)">
                  <input className={inputCls} type="number" placeholder="0" />
                </Field>
                <Field label="Đối tác giao nhận">
                  <input className={inputCls} placeholder="VD: Giao Hàng Nhanh, Viettel Post" />
                </Field>
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline">Hủy</Button>
                <Button>Lưu thay đổi</Button>
              </div>
            </>
          )}

          {tab === "admins" && (
            <>
              <header className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="mb-1 font-heading text-lg font-bold text-foreground">
                    Admin User &amp; Roles
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Quản lý quyền truy cập trên dashboard.
                  </p>
                </div>
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Mời admin
                </Button>
              </header>
              <Empty className="rounded-lg border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserCog />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có admin nào</EmptyTitle>
                  <EmptyDescription>
                    Mời thành viên đầu tiên để cùng quản lý cửa hàng.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Mời admin
                  </Button>
                </EmptyContent>
              </Empty>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
