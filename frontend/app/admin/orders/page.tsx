"use client"

import { useState } from "react"
import { Calendar, Filter, Inbox, Search } from "lucide-react"
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

type Status = "Chờ đặt cọc" | "Đã cọc 20%" | "Hoàn thành" | "Đã hủy"

const STATUS_FILTERS: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "Chờ đặt cọc", label: "Chờ đặt cọc" },
  { key: "Đã cọc 20%", label: "Đã cọc 20%" },
  { key: "Hoàn thành", label: "Hoàn thành" },
  { key: "Đã hủy", label: "Đã hủy" },
]

export default function OrdersPage() {
  const [status, setStatus] = useState<Status | "all">("all")
  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý đơn bán hàng, đặt cọc 20% qua PayOS/VietQR và trạng thái hoàn tất.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-1.5 h-4 w-4" />
            Bộ lọc nâng cao
          </Button>
          <Button>+ Đơn mới</Button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-secondary",
              )}
            >
              {f.label}
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

      {/* Empty table */}
      <section className="rounded-xl border border-border bg-card">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, khách hàng, SĐT..."
              className="h-9 w-full rounded-lg border border-border bg-secondary/40 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg border border-border bg-secondary/40 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">0 đơn</span>
        </header>

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Chưa có đơn hàng</EmptyTitle>
            <EmptyDescription>
              Khi có khách đặt hàng, đơn sẽ xuất hiện ở đây kèm trạng thái đặt cọc và quy trình xử lý.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>+ Tạo đơn thủ công</Button>
          </EmptyContent>
        </Empty>
      </section>
    </div>
  )
}
