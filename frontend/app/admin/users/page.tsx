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
import { Search, Users as UsersIcon, UserPlus } from "lucide-react"

type Tier = "Diamond" | "Gold" | "Silver" | "Member"

export default function UsersPage() {
  const [query, setQuery] = useState("")
  const [tier, setTier] = useState<Tier | "all">("all")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Customer CRM — lịch sử mua hàng, thiết bị sở hữu, điểm thưởng loyalty.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Tạo khách hàng
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI label="Tổng khách hàng" value="0" />
        <KPI label="Diamond + Gold" value="0" />
        <KPI label="Tổng GMV" value="0₫" />
        <KPI label="Điểm loyalty" value="0" />
      </div>

      <section className="rounded-xl border border-border bg-card">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khách hàng, email, SĐT..."
              className="h-9 w-full rounded-lg border border-border bg-secondary/40 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as typeof tier)}
            className="h-9 rounded-lg border border-border bg-secondary/40 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả hạng</option>
            <option value="Diamond">Diamond</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Member">Member</option>
          </select>
        </header>

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Chưa có khách hàng</EmptyTitle>
            <EmptyDescription>
              Khách hàng sẽ tự động được tạo khi đặt đơn đầu tiên, hoặc bạn có thể tạo thủ công.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Tạo khách hàng
            </Button>
          </EmptyContent>
        </Empty>
      </section>
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-foreground">{value}</p>
    </div>
  )
}
