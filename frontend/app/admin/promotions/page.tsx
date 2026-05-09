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
import { Tag, Plus, Clock, Image as ImageIcon, Ticket, Zap, ImagePlus } from "lucide-react"

type Tab = "vouchers" | "flash" | "banners"

export default function PromotionsPage() {
  const [tab, setTab] = useState<Tab>("vouchers")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Khuyến mãi</h1>
          <p className="text-sm text-muted-foreground">
            Vouchers, Flash Sale và Banner — quản lý chiến dịch tăng trưởng.
          </p>
        </div>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Tạo khuyến mãi
        </Button>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        {[
          { k: "vouchers", label: "Vouchers", icon: Tag },
          { k: "flash", label: "Flash Sale", icon: Clock },
          { k: "banners", label: "Banner", icon: ImageIcon },
        ].map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as Tab)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.k
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "vouchers" && (
        <section className="rounded-xl border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold text-foreground">Mã giảm giá</h2>
            <p className="text-xs text-muted-foreground">
              Theo phần trăm hoặc số tiền cố định
            </p>
          </header>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Ticket />
              </EmptyMedia>
              <EmptyTitle>Chưa có voucher nào</EmptyTitle>
              <EmptyDescription>
                Tạo mã giảm giá đầu tiên để khuyến khích khách hàng quay lại mua sắm.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Tạo voucher mới
              </Button>
            </EmptyContent>
          </Empty>
        </section>
      )}

      {tab === "flash" && (
        <Empty className="rounded-xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Zap />
            </EmptyMedia>
            <EmptyTitle>Chưa có chiến dịch Flash Sale</EmptyTitle>
            <EmptyDescription>
              Lên lịch một flash sale có thời gian giới hạn để tăng đột biến doanh thu.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo Flash Sale
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {tab === "banners" && (
        <Empty className="rounded-xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagePlus />
            </EmptyMedia>
            <EmptyTitle>Chưa có banner</EmptyTitle>
            <EmptyDescription>
              Tải lên banner để hiển thị tại các vị trí nổi bật trên trang chủ.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm banner
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
