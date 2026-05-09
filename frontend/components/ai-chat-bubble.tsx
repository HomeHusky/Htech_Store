"use client"

import { useState } from "react"
import { Bot, Send, Sparkles, X, Cpu, ShieldCheck, Wrench, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const QUICK_ACTIONS = [
  { icon: Cpu, label: "Tư vấn cấu hình PC" },
  { icon: ShieldCheck, label: "Kiểm tra bảo hành" },
  { icon: Wrench, label: "Báo giá sửa chữa" },
]

type Msg = { role: "user" | "agent"; text: string }

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export function AiChatBubble() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  async function send(text: string) {
    const value = text.trim()
    if (!value || loading) return

    setMessages((m) => [...m, { role: "user", text: value }])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: value,
          locale: "vi",
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setMessages((m) => [...m, { role: "agent", text: data.answer || "Không thể xử lý yêu cầu" }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: "Xin lỗi, không thể kết nối đến server. Vui lòng thử lại sau.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Mở H-TECH AI Agent"
        className={cn(
          "fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/15 transition-transform hover:scale-105",
          open && "rotate-90",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <header className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-primary to-blue-700 p-4 text-primary-foreground">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold">H-TECH AI Agent</p>
              <p className="text-xs text-primary-foreground/80">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Sẵn sàng hỗ trợ
              </p>
            </div>
            <Sparkles className="h-4 w-4 opacity-80" />
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold text-foreground">
                    Bắt đầu cuộc trò chuyện
                  </p>
                  <p className="mt-1 px-4 text-xs text-muted-foreground">
                    Đặt câu hỏi hoặc chọn một hành động nhanh bên dưới.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                        m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-secondary text-foreground",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <Loader className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">Đang xử lý...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="border-t border-border bg-secondary/40 px-3 py-2.5">
            <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hành động nhanh
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => send(label)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send(input)}
              placeholder="Hỏi H-TECH AI..."
              disabled={loading}
              className="flex-1 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Tin nhắn"
            />
            <Button
              size="icon"
              className="rounded-full"
              onClick={() => send(input)}
              disabled={loading}
              aria-label="Gửi"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
