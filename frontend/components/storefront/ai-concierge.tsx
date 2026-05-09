'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Cpu, MessageCircle, Send, ShieldCheck, Sparkles, User, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
}

const quickActions = [
  { icon: Cpu, label: 'Tư vấn PC', prompt: 'Tư vấn giúp tôi một bộ PC gaming dưới 30 triệu' },
  { icon: ShieldCheck, label: 'Bảo hành', prompt: 'Chính sách bảo hành và đặt cọc của HTech như thế nào?' },
  { icon: Zap, label: 'So sánh iPhone', prompt: 'So sánh iPhone 15 Pro và iPhone 15 Pro Max giúp tôi' },
  { icon: Sparkles, label: 'Ưu đãi tốt', prompt: 'Hiện có sản phẩm nào đáng mua hoặc đang giảm giá?' },
]

function getTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function getSessionId() {
  if (typeof window === 'undefined') return 'server'
  const key = 'htech-chat-session'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const created = crypto.randomUUID()
  window.localStorage.setItem(key, created)
  return created
}

export function AIConcierge() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Xin chào! Mình là trợ lý AI của HTech. Bạn muốn tìm laptop, điện thoại, PC hay cần hỏi chính sách bảo hành/đặt cọc?',
      time: getTime(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim()
    if (!content || typing) return
    setInput('')

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content, time: getTime() }])
    setTyping(true)

    try {
      const { data } = await api.post<{ answer: string }>('/chat', {
        session_id: getSessionId(),
        message: content,
        locale: 'vi',
      })
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.answer, time: getTime() }])
    } catch (error) {
      console.error('Chat failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Mình chưa kết nối được AI/backend lúc này. Bạn thử lại sau vài giây hoặc nhắn “gặp nhân viên” để HTech hỗ trợ trực tiếp.',
          time: getTime(),
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl border border-border shadow-2xl animate-fade-up sm:right-6">
          <div className="flex items-center gap-3 bg-foreground px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent animate-pulse-blue">
              <Bot className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-background">Trợ lý AI HTech</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <p className="text-xs text-background/60">Đang trực tuyến</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-background transition hover:bg-white/20" aria-label="Đóng chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex max-h-80 flex-1 flex-col gap-3 overflow-y-auto bg-background p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', msg.role === 'assistant' ? 'bg-accent' : 'border border-border bg-secondary')}>
                  {msg.role === 'assistant' ? <Bot className="h-3.5 w-3.5 text-accent-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className={cn('flex max-w-[78%] flex-col gap-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
                  <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', msg.role === 'assistant' ? 'rounded-tl-sm border border-border bg-surface text-foreground' : 'rounded-tr-sm bg-accent text-accent-foreground')}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="scrollbar-none flex gap-2 overflow-x-auto border-t border-border bg-surface px-3 py-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button key={action.label} onClick={() => sendMessage(action.prompt)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent hover:text-accent">
                  <Icon className="h-3 w-3" />
                  {action.label}
                </button>
              )
            })}
          </div>

          <div className="border-t border-border bg-background px-3 py-3">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent"
              />
              <button type="submit" disabled={!input.trim() || typing} className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Gửi">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn('fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition duration-300 hover:scale-110 active:scale-95 sm:right-6', open ? 'bg-foreground' : 'bg-accent animate-pulse-blue')}
        aria-label="Mở trợ lý AI"
      >
        {open ? (
          <X className="h-6 w-6 text-background" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-accent-foreground" />
            <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-400" />
          </>
        )}
      </button>
    </>
  )
}
