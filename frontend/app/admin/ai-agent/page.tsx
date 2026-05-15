'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Bot, RefreshCw, Save, Send, Sparkles } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { AdminFormSkeleton } from '@/components/loading-skeletons'

type ProviderOption = { id: string; label: string; models: Array<{ id: string; label: string }> }
type ModelPick = { provider: string; model: string }
type TaskKey = 'search_catalog' | 'query_policy_rag' | 'verify_voucher' | 'manage_booking' | 'query_transformer'

const tasks: Array<{ id: TaskKey; label: string }> = [
  { id: 'search_catalog', label: 'Tìm sản phẩm' },
  { id: 'query_policy_rag', label: 'Hỏi chính sách' },
  { id: 'verify_voucher', label: 'Kiểm tra voucher' },
  { id: 'manage_booking', label: 'Tạo đơn / giữ hàng' },
  { id: 'query_transformer', label: 'Query transformer' },
]

const fallbackProviders: ProviderOption[] = [
  { id: 'gemini', label: 'Gemini', models: [{ id: 'gemini-1.5-flash', label: 'gemini-1.5-flash' }, { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash' }] },
  { id: 'openai', label: 'ChatGPT', models: [{ id: 'gpt-4o-mini', label: 'gpt-4o-mini' }, { id: 'gpt-4o', label: 'gpt-4o' }] },
  { id: 'phi4', label: 'Phi 4', models: [{ id: 'Phi-4', label: 'Phi-4' }, { id: 'Phi-4-Reasoning', label: 'Phi-4-Reasoning' }] },
  { id: 'ollama', label: 'Ollama', models: [{ id: 'qwen2.5', label: 'qwen2.5' }, { id: 'llama3.2', label: 'llama3.2' }] },
]

const fallbackEmbeddingProviders: ProviderOption[] = [
  { id: 'gemini', label: 'Gemini', models: [{ id: 'gemini-embedding-001', label: 'gemini-embedding-001' }, { id: 'gemini-embedding-2', label: 'gemini-embedding-2' }] },
  { id: 'openai', label: 'ChatGPT', models: [{ id: 'text-embedding-3-small', label: 'text-embedding-3-small' }, { id: 'text-embedding-3-large', label: 'text-embedding-3-large' }] },
  { id: 'ollama', label: 'Ollama', models: [{ id: 'qwen2.5', label: 'qwen2.5' }, { id: 'llama3.2', label: 'llama3.2' }] },
]

const defaultOrder: ModelPick[] = [
  { provider: 'gemini', model: 'gemini-1.5-flash' },
  { provider: 'openai', model: 'gpt-4o-mini' },
  { provider: 'phi4', model: 'Phi-4' },
]

export default function AIAgentPage() {
  const [providers, setProviders] = useState<ProviderOption[]>(fallbackProviders)
  const [embeddingProviders, setEmbeddingProviders] = useState<ProviderOption[]>(fallbackEmbeddingProviders)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    chat_provider: 'gemini',
    chat_model: 'gemini-1.5-flash',
    embedding_provider: 'gemini',
    embedding_model: 'gemini-embedding-001',
    gemini_api_key: '',
    openai_api_key: '',
    openai_text_embed_3_small_key: '',
    phi4_api_key: '',
    phi4_reasoning_api_key: '',
    system_prompt: '',
    chat_model_order: defaultOrder,
    task_model_config: {} as Record<string, ModelPick>,
    reasoning_model_count: 1,
    query_transformer_provider: 'gemini',
    query_transformer_model: 'gemini-1.5-flash',
  })
  const [testPrompt, setTestPrompt] = useState('Tư vấn laptop dưới 20 triệu cho sinh viên thiết kế.')
  const [testAnswer, setTestAnswer] = useState('')
  const [queryQuestion, setQueryQuestion] = useState('Laptop dưới 20 triệu, RAM 16GB, bảo hành tốt?')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<any>('/admin/model-catalog').catch(() => ({ data: { chat_providers: fallbackProviders, embedding_providers: fallbackEmbeddingProviders } })),
      api.get<any>('/admin/settings'),
    ])
      .then(([catalog, current]) => {
        const chatProviders = catalog.data.chat_providers?.length ? catalog.data.chat_providers : fallbackProviders
        const embedProviders = catalog.data.embedding_providers?.length ? catalog.data.embedding_providers : fallbackEmbeddingProviders
        setProviders(chatProviders)
        setEmbeddingProviders(embedProviders)
        const data = current.data
        setSettings((prev) => ({
          ...prev,
          ...data,
          chat_model_order: data.chat_model_order?.length ? data.chat_model_order : defaultOrder,
          task_model_config: data.task_model_config || {},
          reasoning_model_count: data.reasoning_model_count || 1,
          query_transformer_provider: data.query_transformer_provider || data.chat_provider,
          query_transformer_model: data.query_transformer_model || data.chat_model,
        }))
      })
      .finally(() => setLoading(false))
  }, [])

  const providerModels = useMemo(() => {
    return Object.fromEntries(providers.map((provider) => [provider.id, provider.models]))
  }, [providers])

  const embeddingProviderModels = useMemo(() => {
    return Object.fromEntries(embeddingProviders.map((provider) => [provider.id, provider.models]))
  }, [embeddingProviders])

  const updatePick = (pick: ModelPick, provider: string): ModelPick => {
    const model = providerModels[provider]?.[0]?.id || pick.model
    return { provider, model }
  }

  const updateEmbeddingPick = (pick: ModelPick, provider: string): ModelPick => {
    const model = embeddingProviderModels[provider]?.[0]?.id || pick.model
    return { provider, model }
  }

  const moveOrder = (index: number, direction: -1 | 1) => {
    const next = [...settings.chat_model_order]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setSettings({ ...settings, chat_model_order: next })
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 1600)
    } finally {
      setSaving(false)
    }
  }

  const runTest = async () => {
    setBusyAction('test')
    try {
      const { data } = await api.post<any>('/admin/test-model', {
        prompt: testPrompt,
        provider: settings.chat_provider,
        model: settings.chat_model,
      })
      setTestAnswer(data.answer)
    } finally {
      setBusyAction(null)
    }
  }

  const runQueryTransformer = async () => {
    setBusyAction('query')
    try {
      const { data } = await api.post<any>('/admin/query-transformer', {
        question: queryQuestion,
        provider: settings.query_transformer_provider,
        model: settings.query_transformer_model,
      })
      setQueryResult(data)
    } finally {
      setBusyAction(null)
    }
  }

  const renderPick = (pick: ModelPick, onChange: (pick: ModelPick) => void) => (
    <div className="grid gap-2 sm:grid-cols-2">
      <select value={pick.provider} onChange={(event) => onChange(updatePick(pick, event.target.value))} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
        {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.label}</option>)}
      </select>
      <select value={pick.model} onChange={(event) => onChange({ ...pick, model: event.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
        {(providerModels[pick.provider] || []).map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
      </select>
    </div>
  )

  const renderEmbeddingPick = (pick: ModelPick, onChange: (pick: ModelPick) => void) => (
    <div className="grid gap-2 sm:grid-cols-2">
      <select value={pick.provider} onChange={(event) => onChange(updateEmbeddingPick(pick, event.target.value))} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
        {embeddingProviders.map((provider) => <option key={provider.id} value={provider.id}>{provider.label}</option>)}
      </select>
      <select value={pick.model} onChange={(event) => onChange({ ...pick, model: event.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
        {(embeddingProviderModels[pick.provider] || []).map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <AdminHeader title="Cấu hình AI Agent" subtitle="Chọn model chính, thứ tự fallback, model theo tác vụ và query transformer" />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-card p-5">
                <AdminFormSkeleton />
              </section>
              <section className="rounded-xl border border-border bg-card p-5">
                <AdminFormSkeleton />
              </section>
            </div>
            <aside className="rounded-xl border border-border bg-card p-5">
              <AdminFormSkeleton />
            </aside>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={Bot} title="Model suy luận chính" />
                <div className="mt-4">{renderPick({ provider: settings.chat_provider, model: settings.chat_model }, (pick) => setSettings({ ...settings, chat_provider: pick.provider, chat_model: pick.model }))}</div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={RefreshCw} title="Thứ tự model fallback" />
                <div className="mt-4 space-y-3">
                  {settings.chat_model_order.map((pick, index) => (
                    <div key={`${pick.provider}-${pick.model}-${index}`} className="grid gap-3 rounded-lg border border-border p-3 lg:grid-cols-[1fr_auto]">
                      {renderPick(pick, (nextPick) => {
                        const next = [...settings.chat_model_order]
                        next[index] = nextPick
                        setSettings({ ...settings, chat_model_order: next })
                      })}
                      <div className="flex gap-2">
                        <button onClick={() => moveOrder(index, -1)} className="h-10 w-10 rounded-lg border border-border hover:bg-muted" aria-label="Đưa lên"><ArrowUp className="mx-auto h-4 w-4" /></button>
                        <button onClick={() => moveOrder(index, 1)} className="h-10 w-10 rounded-lg border border-border hover:bg-muted" aria-label="Đưa xuống"><ArrowDown className="mx-auto h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-medium text-foreground">
                  Số model được phép suy luận chính
                  <input type="number" min={1} max={settings.chat_model_order.length} value={settings.reasoning_model_count} onChange={(event) => setSettings({ ...settings, reasoning_model_count: Number(event.target.value) || 1 })} className="mt-1 h-10 w-28 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </label>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={Sparkles} title="Model theo tác vụ" />
                <div className="mt-4 grid gap-4">
                  {tasks.map((task) => {
                    const pick = settings.task_model_config[task.id] || { provider: settings.chat_provider, model: settings.chat_model }
                    return (
                      <div key={task.id} className="grid gap-2 rounded-lg border border-border p-3 lg:grid-cols-[180px_1fr] lg:items-center">
                        <p className="text-sm font-semibold text-foreground">{task.label}</p>
                        {renderPick(pick, (nextPick) => setSettings({ ...settings, task_model_config: { ...settings.task_model_config, [task.id]: nextPick } }))}
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={RefreshCw} title="Embedding model" />
                <div className="mt-4">{renderEmbeddingPick({ provider: settings.embedding_provider, model: settings.embedding_model }, (pick) => setSettings({ ...settings, embedding_provider: pick.provider, embedding_model: pick.model }))}</div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={Sparkles} title="API keys" />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SecretInput label="Gemini API key" value={settings.gemini_api_key || ''} onChange={(value) => setSettings({ ...settings, gemini_api_key: value })} />
                  <SecretInput label="OpenAI / GitHub PAT" value={settings.openai_api_key || ''} onChange={(value) => setSettings({ ...settings, openai_api_key: value })} />
                  <SecretInput label="OpenAI embedding key" value={settings.openai_text_embed_3_small_key || ''} onChange={(value) => setSettings({ ...settings, openai_text_embed_3_small_key: value })} />
                  <SecretInput label="Phi-4 API key" value={settings.phi4_api_key || ''} onChange={(value) => setSettings({ ...settings, phi4_api_key: value })} />
                  <SecretInput label="Phi-4 reasoning key" value={settings.phi4_reasoning_api_key || ''} onChange={(value) => setSettings({ ...settings, phi4_reasoning_api_key: value })} />
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={Sparkles} title="System prompt" />
                <textarea value={settings.system_prompt || ''} onChange={(event) => setSettings({ ...settings, system_prompt: event.target.value })} rows={10} className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent" />
              </section>

              <button onClick={saveSettings} disabled={saving} className={cn('inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white', saved ? 'bg-green-600' : 'bg-accent hover:bg-accent/90', saving && 'opacity-60')}>
                <Save className="h-4 w-4" />
                {saved ? 'Đã lưu' : saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>

            <aside className="space-y-6">
              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={Send} title="Test model" />
                <textarea value={testPrompt} onChange={(event) => setTestPrompt(event.target.value)} rows={4} className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
                <button onClick={runTest} disabled={busyAction === 'test'} className="mt-3 h-10 w-full rounded-lg bg-foreground text-sm font-semibold text-background hover:bg-accent disabled:opacity-60">
                  {busyAction === 'test' ? 'Đang test...' : 'Gửi thử'}
                </button>
                {testAnswer && <p className="mt-4 rounded-lg bg-muted p-3 text-sm leading-relaxed text-foreground">{testAnswer}</p>}
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <SectionTitle icon={Sparkles} title="Query transformer" />
                <div className="mt-4">{renderPick({ provider: settings.query_transformer_provider || settings.chat_provider, model: settings.query_transformer_model || settings.chat_model }, (pick) => setSettings({ ...settings, query_transformer_provider: pick.provider, query_transformer_model: pick.model }))}</div>
                <textarea value={queryQuestion} onChange={(event) => setQueryQuestion(event.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
                <button onClick={runQueryTransformer} disabled={busyAction === 'query'} className="mt-3 h-10 w-full rounded-lg bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
                  {busyAction === 'query' ? 'Đang phân tích...' : 'Xem context'}
                </button>
                {queryResult && (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="font-semibold text-foreground">Query đã tối ưu</p>
                      <p className="mt-1 text-muted-foreground">{queryResult.transformed_query}</p>
                    </div>
                    <ContextList title="Sản phẩm" items={queryResult.context?.products || []} nameKey="name" />
                    <ContextList title="Chính sách" items={queryResult.context?.policies || []} nameKey="title" />
                  </div>
                )}
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Bot; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-accent" />
      <h2 className="font-bold text-foreground">{title}</h2>
    </div>
  )
}

function SecretInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input type="password" value={value} onChange={(event) => onChange(event.target.value)} autoComplete="off" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
    </label>
  )
}

function ContextList({ title, items, nameKey }: { title: string; items: any[]; nameKey: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="font-semibold text-foreground">{title}</p>
      <div className="mt-2 space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground">Chưa có context phù hợp.</p>
        ) : items.slice(0, 4).map((item, index) => {
          const raw = item[nameKey]
          const label = typeof raw === 'object' ? raw?.vi || raw?.en : raw
          return <p key={index} className="line-clamp-2 text-muted-foreground">{label || item.slug || item.content}</p>
        })}
      </div>
    </div>
  )
}
