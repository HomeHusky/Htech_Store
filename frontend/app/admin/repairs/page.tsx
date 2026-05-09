"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, Wrench } from "lucide-react"

type ColKey = "received" | "checking" | "repairing" | "ready"

const COLUMNS: { key: ColKey; title: string; tone: string }[] = [
  { key: "received", title: "Tiếp nhận", tone: "border-amber-200 bg-amber-50/40" },
  { key: "checking", title: "Đang kiểm tra", tone: "border-blue-200 bg-blue-50/40" },
  { key: "repairing", title: "Đang sửa", tone: "border-violet-200 bg-violet-50/40" },
  { key: "ready", title: "Chờ trả máy", tone: "border-emerald-200 bg-emerald-50/40" },
]

export default function RepairsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Xưởng sửa chữa</h1>
          <p className="text-sm text-muted-foreground">
            Kanban board — kéo thả ticket giữa các cột để cập nhật trạng thái thợ.
          </p>
        </div>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Tiếp nhận máy mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className={cn("rounded-xl border-2 border-dashed p-3", col.tone)}>
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-heading text-sm font-bold text-foreground">{col.title}</h3>
              <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-foreground ring-1 ring-border">
                0
              </span>
            </div>
            <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Wrench className="h-4 w-4" />
              </span>
              <p className="mt-2 text-sm font-medium text-foreground">Chưa có ticket</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ticket mới sẽ xuất hiện ở đây
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
