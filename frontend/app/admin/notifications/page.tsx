"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Send,
  ShieldOff,
  Eye,
  EyeOff,
  MessageSquare,
  BellOff,
} from "lucide-react"

export default function NotificationsPage() {
  const [showToken, setShowToken] = useState(false)
  const [token, setToken] = useState("")
  const [chatId, setChatId] = useState("")
  const [enabled, setEnabled] = useState({
    deposits: true,
    orders: true,
    repairs: true,
    inventory: true,
    aiLeads: false,
  })

  const isConnected = token.trim().length > 0 && chatId.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Thông báo</h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình Telegram Bot API và xem lịch sử cảnh báo realtime.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        {/* Telegram config */}
        <section className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-5">
            <header className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500 text-white">
                <Send className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Telegram Bot
                </h2>
                <p className="text-xs text-muted-foreground">Kết nối API để gửi cảnh báo</p>
              </div>
              <span
                className={
                  isConnected
                    ? "ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                    : "ml-auto inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border"
                }
              >
                <ShieldOff className="h-3 w-3" />
                {isConnected ? "Đã kết nối" : "Chưa cấu hình"}
              </span>
            </header>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bot Token
                </span>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="VD: 1234567890:ABCDEF..."
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 pr-10 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showToken ? "Ẩn token" : "Hiện token"}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Chat ID
                </span>
                <input
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="VD: -1001234567890"
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  ID nhóm/cá nhân nhận thông báo
                </span>
              </label>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" disabled={!isConnected}>
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Gửi thử
                </Button>
                <Button className="flex-1">Lưu</Button>
              </div>
            </div>
          </article>

          {/* Triggers */}
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
              Sự kiện gửi alert
            </h2>
            <div className="space-y-2">
              {[
                { k: "deposits", label: "Đặt cọc thành công (PayOS/VietQR)" },
                { k: "orders", label: "Đơn hàng mới" },
                { k: "repairs", label: "Cập nhật sửa chữa" },
                { k: "inventory", label: "Cảnh báo tồn kho thấp" },
                { k: "aiLeads", label: "Lead AI Agent chưa trả lời" },
              ].map((t) => (
                <label
                  key={t.k}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3 text-sm"
                >
                  <span className="font-medium text-foreground">{t.label}</span>
                  <input
                    type="checkbox"
                    checked={enabled[t.k as keyof typeof enabled]}
                    onChange={(e) => setEnabled({ ...enabled, [t.k]: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </label>
              ))}
            </div>
          </article>
        </section>

        {/* Log */}
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Lịch sử cảnh báo
              </h2>
              <p className="text-xs text-muted-foreground">
                Đã gửi <strong className="text-foreground">0</strong> thông báo
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Xuất CSV
            </Button>
          </header>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellOff />
              </EmptyMedia>
              <EmptyTitle>Chưa có cảnh báo</EmptyTitle>
              <EmptyDescription>
                Cảnh báo realtime sẽ xuất hiện ở đây sau khi Telegram Bot được kết nối và có sự kiện
                xảy ra.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </section>
      </div>
    </div>
  )
}
