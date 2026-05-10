'use client'

import { useMemo, useState } from 'react'
import { Check, Layout, Monitor, Moon, Palette, RotateCcw, Save, Sun, Type } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

const colorPresets = [
  { name: 'Royal Blue', primary: '#0071e3', surface: '#f5f9ff' },
  { name: 'Graphite', primary: '#111827', surface: '#f7f7f8' },
  { name: 'Emerald', primary: '#059669', surface: '#f1fbf7' },
  { name: 'Ruby', primary: '#e11d48', surface: '#fff5f7' },
  { name: 'Teal', primary: '#0f766e', surface: '#effafa' },
]

const fontPresets = [
  { name: 'Inter', value: 'Inter, system-ui, sans-serif', sample: 'HTech Store' },
  { name: 'SF Pro', value: 'SF Pro Display, system-ui, sans-serif', sample: 'Premium devices' },
  { name: 'Roboto', value: 'Roboto, system-ui, sans-serif', sample: 'Fast checkout' },
]

const layoutPresets = [
  { name: 'Mặc định', value: 'default', description: 'Cân bằng banner, danh mục và sản phẩm nổi bật.' },
  { name: 'Catalog dày', value: 'dense', description: 'Hiển thị nhiều sản phẩm hơn trên mỗi dòng.' },
  { name: 'Editorial', value: 'editorial', description: 'Ảnh lớn hơn cho chiến dịch sản phẩm mới.' },
]

export default function AppearancePage() {
  const { theme, setTheme, setBrandTheme } = useTheme()
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedFont, setSelectedFont] = useState(0)
  const [selectedLayout, setSelectedLayout] = useState('default')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [compactCards, setCompactCards] = useState(false)
  const [saved, setSaved] = useState(false)

  const preview = useMemo(() => ({
    color: colorPresets[selectedColor],
    font: fontPresets[selectedFont],
    layout: layoutPresets.find((item) => item.value === selectedLayout) ?? layoutPresets[0],
  }), [selectedColor, selectedFont, selectedLayout])

  const handleSave = () => {
    setBrandTheme({
      primary: preview.color.primary,
      surface: preview.color.surface,
      font: preview.font.value,
      layout: selectedLayout,
      compactCards,
      announcementEnabled,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <>
      <AdminHeader title="Giao diện" subtitle="Tinh chỉnh giao diện storefront và trải nghiệm mua hàng" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Section title="Chế độ hiển thị" icon={Palette}>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'light', label: 'Sáng', description: 'Sáng và gọn', icon: Sun },
                  { id: 'dark', label: 'Tối', description: 'Tập trung hơn', icon: Moon },
                  { id: 'system', label: 'Hệ thống', description: 'Theo thiết bị', icon: Monitor },
                ].map((item) => {
                  const Icon = item.icon
                  const active = theme === item.id
                  return (
                    <button key={item.id} onClick={() => item.id !== 'system' && setTheme(item.id as 'light' | 'dark')} className={cn('rounded-lg border p-4 text-left transition', active ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40', item.id === 'system' && 'opacity-60')}>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5" /></div>
                        {active && <Check className="h-5 w-5 text-accent" />}
                      </div>
                      <p className="mt-4 font-semibold text-foreground">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </button>
                  )
                })}
              </div>
            </Section>

            <Section title="Màu thương hiệu" icon={Palette}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {colorPresets.map((color, index) => (
                  <button key={color.name} onClick={() => setSelectedColor(index)} className={cn('flex items-center gap-3 rounded-lg border p-4 text-left transition', selectedColor === index ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}>
                    <span className="h-9 w-9 rounded-lg border border-border" style={{ background: color.primary }} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{color.name}</span>
                      <span className="block text-xs text-muted-foreground">{color.primary}</span>
                    </span>
                    {selectedColor === index && <Check className="h-4 w-4 text-accent" />}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Kiểu chữ" icon={Type}>
              <div className="grid gap-3 sm:grid-cols-2">
                {fontPresets.map((font, index) => (
                  <button key={font.name} onClick={() => setSelectedFont(index)} className={cn('rounded-lg border p-4 text-left transition', selectedFont === index ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{font.name}</p>
                      {selectedFont === index && <Check className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="mt-3 text-2xl text-foreground" style={{ fontFamily: font.value }}>{font.sample}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Bố cục cửa hàng" icon={Layout}>
              <div className="space-y-3">
                {layoutPresets.map((layout) => (
                  <button key={layout.value} onClick={() => setSelectedLayout(layout.value)} className={cn('flex w-full items-center gap-4 rounded-lg border p-4 text-left transition', selectedLayout === layout.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}>
                    <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border', selectedLayout === layout.value ? 'border-accent' : 'border-border')}>{selectedLayout === layout.value && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}</span>
                    <span><span className="block font-semibold text-foreground">{layout.name}</span><span className="block text-sm text-muted-foreground">{layout.description}</span></span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Module trang chủ" icon={Layout}>
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleRow label="Thanh thông báo" description="Hiện thanh thông báo khuyến mãi đầu trang." checked={announcementEnabled} onChange={setAnnouncementEnabled} />
                <ToggleRow label="Card sản phẩm gọn" description="Giảm chiều cao card để xem được nhiều sản phẩm hơn." checked={compactCards} onChange={setCompactCards} />
              </div>
            </Section>

            <div className="flex flex-wrap gap-3">
              <button onClick={handleSave} className={cn('inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition', saved ? 'bg-green-600' : 'bg-accent hover:bg-accent/90')}>
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? 'Đã lưu' : 'Lưu thay đổi'}
              </button>
              <button onClick={() => setBrandTheme({ primary: '#0071e3', surface: '#f5f9ff', font: 'Inter, system-ui, sans-serif', layout: 'default', compactCards: false, announcementEnabled: true })} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
                <RotateCcw className="h-4 w-4" />
                Khôi phục mặc định
              </button>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5 xl:sticky xl:top-6 xl:self-start">
            <h2 className="font-bold text-foreground">Xem trước</h2>
            <p className="mt-1 text-sm text-muted-foreground">Bản xem nhanh của storefront với lựa chọn hiện tại.</p>
            <div className="mt-5 overflow-hidden rounded-xl border border-border" style={{ background: preview.color.surface, fontFamily: preview.font.value }}>
              <div className="flex items-center justify-between border-b border-black/10 bg-white/80 px-4 py-3">
                <div className="font-black" style={{ color: preview.color.primary }}>HTech</div>
                <div className="flex gap-2"><span className="h-2 w-8 rounded-full bg-black/10" /><span className="h-2 w-8 rounded-full bg-black/10" /></div>
              </div>
              {announcementEnabled && <div className="px-4 py-2 text-center text-xs font-semibold text-white" style={{ background: preview.color.primary }}>Đặt cọc 20%, giữ hàng nhanh trong ngày</div>}
              <div className="p-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase text-black/50">{preview.layout.name}</p>
                  <h3 className="mt-2 text-xl font-black text-black">iPhone 15 Pro Max</h3>
                  <p className="mt-1 text-sm text-black/60">Hàng mới, bảo hành chính hãng, hỗ trợ trả góp.</p>
                  <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: preview.color.primary }}>Đặt hàng</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof Palette; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon className="h-5 w-5" /></div>
        <h2 className="font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 text-left transition hover:border-accent/40">
      <span><span className="block font-semibold text-foreground">{label}</span><span className="block text-sm text-muted-foreground">{description}</span></span>
      <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-accent' : 'bg-muted')}><span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition', checked ? 'left-6' : 'left-1')} /></span>
    </button>
  )
}
