'use client'

import { useState } from 'react'
import { Bot, Send, Sparkles, ChevronDown, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminHeader } from '@/components/admin/header'

const models = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'Google', badge: 'Fast' },
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', badge: 'Smart' },
  { id: 'phi-4', label: 'Phi-4', provider: 'Microsoft', badge: 'Efficient' },
  { id: 'claude-opus-4', label: 'Claude Opus 4', provider: 'Anthropic', badge: 'Precise' },
]

type PlaygroundMsg = { role: 'user' | 'assistant'; content: string }

const defaultPrompt = `You are HTech Store's AI Sales Concierge — a premium, knowledgeable tech advisor for a high-end electronics retailer in Vietnam.

Your responsibilities:
1. Help customers choose the right iPhone, MacBook, or PC Gaming setup
2. Provide accurate spec comparisons and price information
3. Guide customers through warranty and trade-in programs
4. Recommend PC builds within customer budgets
5. Maintain a friendly, expert, and professional tone at all times

Store info:
- All products come with official 24-month warranty
- Free nationwide shipping on orders over 5,000,000₫
- Trade-in program available for all Apple devices
- AI-powered support available 24/7

Always respond in the same language as the customer (Vietnamese or English).`

export default function AIAgentPage() {
  const [selectedModel, setSelectedModel] = useState(models[0].id)
  const [systemPrompt, setSystemPrompt] = useState(defaultPrompt)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(512)
  const [playgroundInput, setPlaygroundInput] = useState('')
  const [playgroundMessages, setPlaygroundMessages] = useState<PlaygroundMsg[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [saved, setSaved] = useState(false)

  const sendPlayground = () => {
    if (!playgroundInput.trim()) return
    const userMsg: PlaygroundMsg = { role: 'user', content: playgroundInput }
    setPlaygroundMessages((prev) => [...prev, userMsg])
    setPlaygroundInput('')
    setIsThinking(true)

    setTimeout(() => {
      setPlaygroundMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `[${models.find((m) => m.id === selectedModel)?.label}] Based on your query, I can help you with that. As HTech Store's AI concierge, I have access to our full product catalog, pricing, and support information. Would you like me to provide specific recommendations or compare products for you?`,
        },
      ])
      setIsThinking(false)
    }, 1500)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="AI Agent Configuration" subtitle="Configure system prompts, select models, and test responses" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          {/* Left — Config panel */}
          <div className="flex flex-col gap-5">
            {/* Model selection */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-accent" />
                LLM Model
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all',
                      selectedModel === model.id
                        ? 'border-accent bg-blue-light'
                        : 'border-border hover:border-foreground/30 bg-background',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-foreground">{model.label}</p>
                      <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold">
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Parameters</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Temperature</label>
                    <span className="text-xs font-bold text-foreground">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Precise</span>
                    <span className="text-[10px] text-muted-foreground">Creative</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Max Tokens</label>
                    <span className="text-xs font-bold text-foreground">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min={128}
                    max={2048}
                    step={128}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            </div>

            {/* System prompt */}
            <div className="bg-card border border-border rounded-2xl p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  System Prompt
                </h3>
                <button
                  onClick={handleSave}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    saved ? 'bg-green-500 text-white' : 'bg-accent text-accent-foreground hover:bg-blue-dark',
                  )}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saved ? 'Saved!' : 'Save'}
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm font-mono text-foreground focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Right — Playground */}
          <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h3 className="text-sm font-bold text-foreground">Response Playground</h3>
              </div>
              <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-lg bg-muted border border-border">
                {models.find((m) => m.id === selectedModel)?.label}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {playgroundMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-50 py-16">
                  <Bot className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Send a test message to preview the AI response with the current configuration.
                  </p>
                </div>
              )}
              {playgroundMessages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5',
                      msg.role === 'assistant' ? 'bg-accent text-accent-foreground' : 'bg-muted border border-border text-muted-foreground',
                    )}
                  >
                    {msg.role === 'assistant' ? 'AI' : 'U'}
                  </div>
                  <div
                    className={cn(
                      'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'assistant'
                        ? 'bg-muted text-foreground rounded-tl-sm border border-border'
                        : 'bg-accent text-accent-foreground rounded-tr-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground">AI</div>
                  <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playgroundInput}
                  onChange={(e) => setPlaygroundInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendPlayground()}
                  placeholder="Test a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={sendPlayground}
                  disabled={!playgroundInput.trim() || isThinking}
                  className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:bg-blue-dark transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
