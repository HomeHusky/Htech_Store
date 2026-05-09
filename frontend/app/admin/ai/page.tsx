"use client"

import { useState } from "react"
import {
  Bot,
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Send,
  Database,
  ShieldCheck,
} from "lucide-react"
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

type Policy = {
  id: string
  title: string
  category: string
  status: "Đã đồng bộ" | "Chờ đồng bộ"
  updatedAt: string
  content: string
}

type ChatMsg = { role: "user" | "ai"; text: string }

export default function AiPolicyPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [active, setActive] = useState<Policy | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [chat, setChat] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")

  const pendingCount = policies.filter((p) => p.status === "Chờ đồng bộ").length

  function handleSync() {
    if (policies.length === 0) return
    setSyncing(true)
    setTimeout(() => {
      setPolicies((curr) =>
        curr.map((p) => ({ ...p, status: "Đã đồng bộ" as const, updatedAt: "Vừa xong" })),
      )
      setActive((a) => (a ? { ...a, status: "Đã đồng bộ", updatedAt: "Vừa xong" } : a))
      setSyncing(false)
    }, 900)
  }

  function handleSend() {
    if (!input.trim()) return
    setChat((c) => [...c, { role: "user", text: input.trim() }])
    setInput("")
  }

  function updateActive(patch: Partial<Policy>) {
    if (!active) return
    const next = {
      ...active,
      ...patch,
      status: "Chờ đồng bộ" as const,
      updatedAt: "Vừa cập nhật",
    }
    setActive(next)
    setPolicies((curr) => curr.map((p) => (p.id === next.id ? next : p)))
  }

  function createPolicy() {
    const id = `p-${Date.now()}`
    const draft: Policy = {
      id,
      title: "",
      category: "",
      status: "Chờ đồng bộ",
      updatedAt: "Vừa tạo",
      content: "",
    }
    setPolicies((c) => [draft, ...c])
    setActive(draft)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">AI &amp; Chính sách</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              RAG Knowledge
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý policy của H-TECH AI Agent — vector embedding &amp; guardrails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing || pendingCount === 0}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {syncing ? (
              <>
                <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                Đang đồng bộ...
              </>
            ) : (
              <>
                <Database className="mr-1.5 h-4 w-4" />
                Sync to RAG
                {pendingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </Button>
          <Button onClick={createPolicy}>
            <Plus className="mr-1.5 h-4 w-4" />
            Chính sách mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr_360px]">
        {/* Policy list */}
        <aside className="rounded-xl border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <p className="font-heading text-sm font-semibold text-foreground">
              Knowledge Base ({policies.length})
            </p>
          </header>
          {policies.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>Chưa có chính sách</EmptyTitle>
                <EmptyDescription>
                  Thêm policy đầu tiên để AI Agent có dữ liệu trả lời.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" onClick={createPolicy}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tạo policy
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul className="divide-y divide-border">
              {policies.map((p) => {
                const isActive = active?.id === p.id
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setActive(p)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                        isActive ? "bg-primary/5" : "hover:bg-secondary/50",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.title || "Chính sách chưa đặt tên"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.category || "Chưa phân loại"} · {p.updatedAt}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <section className="rounded-xl border border-border bg-card p-6">
          {active ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={active.title}
                    placeholder="Tiêu đề chính sách"
                    onChange={(e) => updateActive({ title: e.target.value })}
                    className="w-full bg-transparent font-heading text-xl font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={active.category}
                      placeholder="Danh mục (VD: Bảo hành)"
                      onChange={(e) => updateActive({ category: e.target.value })}
                      className="h-7 rounded-md bg-secondary px-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                        active.status === "Đã đồng bộ"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200",
                      )}
                    >
                      {active.status === "Đã đồng bộ" && <ShieldCheck className="h-3 w-3" />}
                      {active.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Cập nhật {active.updatedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nội dung (Markdown hỗ trợ)
                </p>
                <textarea
                  value={active.content}
                  placeholder="Nhập nội dung chính sách..."
                  onChange={(e) => updateActive({ content: e.target.value })}
                  className="h-72 w-full resize-none rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-xs font-semibold text-amber-700">Guardrail</p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800/90">
                  Mọi thay đổi sẽ được vector-embed sau khi nhấn{" "}
                  <strong>Sync to RAG</strong>. AI Agent chỉ trả lời dựa trên knowledge base này.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline">Hủy</Button>
                <Button>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Lưu &amp; Embed
                </Button>
              </div>
            </div>
          ) : (
            <Empty className="min-h-[420px] border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bot />
                </EmptyMedia>
                <EmptyTitle>Chưa chọn chính sách</EmptyTitle>
                <EmptyDescription>
                  Chọn một mục trong danh sách bên trái hoặc tạo policy mới để bắt đầu.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={createPolicy}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tạo policy đầu tiên
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </section>

        {/* Preview chat */}
        <aside className="flex h-fit flex-col rounded-xl border border-primary/20 bg-card lg:sticky lg:top-6">
          <header className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-foreground">Preview Chat</p>
              <p className="text-[11px] text-muted-foreground">Test phản hồi AI realtime</p>
            </div>
          </header>
          <div className="flex h-80 flex-col gap-2.5 overflow-y-auto p-4">
            {chat.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="text-sm font-medium text-foreground">Chưa có hội thoại</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gõ câu hỏi bên dưới để test prompt.
                  </p>
                </div>
              </div>
            ) : (
              chat.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI để test prompt..."
              className="h-9 flex-1 rounded-lg border border-border bg-secondary/40 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" size="icon" aria-label="Gửi">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </aside>
      </div>
    </div>
  )
}
