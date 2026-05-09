import {
  TrendingUp,
  Wrench,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const KPI = [
  { label: "Doanh thu 30 ngày", value: "0₫", icon: TrendingUp },
  { label: "Tỷ lệ sửa thành công", value: "—", icon: Wrench },
  { label: "AI Agent conversion", value: "—", icon: Sparkles },
  { label: "Tỷ lệ đặt cọc 20%", value: "—", icon: Target },
]

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Thống kê</h1>
        <p className="text-sm text-muted-foreground">
          Insights chiến lược: doanh thu theo brand, sửa chữa, hiệu suất AI Agent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                —
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <Empty className="rounded-xl border bg-card min-h-[420px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart3 />
          </EmptyMedia>
          <EmptyTitle>Chưa đủ dữ liệu để thống kê</EmptyTitle>
          <EmptyDescription>
            Biểu đồ doanh thu theo thương hiệu, kênh bán hàng, funnel sửa chữa và conversion AI sẽ
            hiển thị khi có hoạt động kinh doanh.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
