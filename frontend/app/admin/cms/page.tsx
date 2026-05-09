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
import { Image as ImageIcon, Plus, Star, ImagePlus } from "lucide-react"

type Tab = "hero" | "featured" | "brands"

export default function CmsPage() {
  const [tab, setTab] = useState<Tab>("hero")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Giao diện</h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật trang chủ — Hero banner, sản phẩm nổi bật, logo thương hiệu.
          </p>
        </div>
        <Button>Lưu thay đổi</Button>
      </div>

      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        {[
          { k: "hero", label: "Hero Banner" },
          { k: "featured", label: "Sản phẩm nổi bật" },
          { k: "brands", label: "Logo thương hiệu" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as Tab)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.k
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <Empty className="rounded-xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagePlus />
            </EmptyMedia>
            <EmptyTitle>Chưa có hero banner</EmptyTitle>
            <EmptyDescription>
              Tải lên banner để hiển thị trên trang chủ. Hỗ trợ JPG/PNG, kích thước đề xuất 1920×720.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm hero banner
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {tab === "featured" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Sản phẩm — chọn để gắn lên trang chủ
              </h2>
              <p className="text-xs text-muted-foreground">Đã chọn 0 sản phẩm</p>
            </header>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Star />
                </EmptyMedia>
                <EmptyTitle>Chưa có sản phẩm để chọn</EmptyTitle>
                <EmptyDescription>
                  Thêm sản phẩm vào kho trước, sau đó chọn để gắn lên trang chủ.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </section>

          <aside className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-heading text-sm font-semibold text-foreground">Live preview</h3>
            <p className="mt-1 text-xs text-muted-foreground">Thứ tự hiển thị trên homepage</p>
            <p className="mt-4 rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
              Chưa có sản phẩm nào được chọn
            </p>
          </aside>
        </div>
      )}

      {tab === "brands" && (
        <Empty className="rounded-xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>Chưa có logo thương hiệu</EmptyTitle>
            <EmptyDescription>
              Tải lên logo các thương hiệu phân phối để hiển thị trên brand ribbon.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm thương hiệu
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
