import {
  TrendingUp,
  ShoppingCart,
  Wrench,
  UserPlus,
  LineChart,
  PackageOpen,
  Inbox,
} from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

const STATS = [
  { label: "Doanh thu hôm nay", value: "0₫", icon: TrendingUp },
  { label: "Đơn hàng mới", value: "0", icon: ShoppingCart },
  { label: "Sửa chữa đang xử lý", value: "0", icon: Wrench },
  { label: "Lead từ AI Agent", value: "0", icon: UserPlus },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">
            Bức tranh vận hành H-TECH theo thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 text-xs">
          {["Hôm nay", "7 ngày", "30 ngày"].map((p, i) => (
            <button
              key={p}
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition-colors",
                i === 1
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                —
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Sales trend + Top products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Xu hướng doanh thu
              </h2>
              <p className="text-xs text-muted-foreground">Sales vs Repair</p>
            </div>
          </header>
          <Empty className="border min-h-72">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LineChart />
              </EmptyMedia>
              <EmptyTitle>Chưa đủ dữ liệu</EmptyTitle>
              <EmptyDescription>
                Biểu đồ sẽ hiển thị khi có đơn hàng và phiếu sửa chữa được ghi nhận.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Sản phẩm bán chạy
            </h2>
            <p className="text-xs text-muted-foreground">Top 5 — 30 ngày</p>
          </header>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageOpen />
              </EmptyMedia>
              <EmptyTitle>Chưa có sản phẩm bán chạy</EmptyTitle>
              <EmptyDescription>
                Thêm sản phẩm và ghi nhận đơn hàng để xem bảng xếp hạng.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </section>
      </div>

      {/* Recent orders */}
      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Đơn hàng gần nhất
            </h2>
            <p className="text-xs text-muted-foreground">Cập nhật theo thời gian thực</p>
          </div>
        </header>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Chưa có đơn hàng</EmptyTitle>
            <EmptyDescription>
              Đơn mới sẽ hiển thị ở đây ngay khi khách đặt.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    </div>
  )
}
