'use client'

import { useMemo, useState } from 'react'
import { Check, Image as ImageIcon, Layout, Monitor, Moon, Palette, RotateCcw, Save, Sun, Type } from 'lucide-react'
import { AdminHeader } from '@/components/admin/header'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'

const colorPresets = [
  { name: 'Royal Blue', primary: '#0071e3', surface: '#f5f9ff' },
  { name: 'Graphite', primary: '#111827', surface: '#f7f7f8' },
  { name: 'Emerald', primary: '#059669', surface: '#f1fbf7' },
  { name: 'Ruby', primary: '#e11d48', surface: '#fff5f7' },
  { name: 'Amber', primary: '#d97706', surface: '#fff8ed' },
  { name: 'Teal', primary: '#0f766e', surface: '#effafa' },
]

const fontPresets = [
  { name: 'Inter', value: 'Inter, system-ui, sans-serif', sample: 'HTech Store' },
  { name: 'SF Pro', value: 'SF Pro Display, system-ui, sans-serif', sample: 'Premium devices' },
  { name: 'Roboto', value: 'Roboto, system-ui, sans-serif', sample: 'Fast checkout' },
  { name: 'Open Sans', value: 'Open Sans, system-ui, sans-serif', sample: 'Clear product specs' },
]

const layoutPresets = [
  { name: 'Default', value: 'default', description: 'Can bang giua banner, danh muc va san pham noi bat.' },
  { name: 'Catalog Dense', value: 'dense', description: 'Nhieu san pham hon tren moi dong, phu hop ban hang lap lai.' },
  { name: 'Editorial', value: 'editorial', description: 'Hinh anh lon hon cho cac chien dich san pham moi.' },
]

export default function AppearancePage() {
  const { theme, setTheme } = useTheme()
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedFont, setSelectedFont] = useState(0)
  const [selectedLayout, setSelectedLayout] = useState('default')
  const [heroStyle, setHeroStyle] = useState('product')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [compactCards, setCompactCards] = useState(false)
  const [saved, setSaved] = useState(false)

  const preview = useMemo(() => {
    return {
      color: colorPresets[selectedColor],
      font: fontPresets[selectedFont],
      layout: layoutPresets.find((item) => item.value === selectedLayout) ?? layoutPresets[0],
    }
  }, [selectedColor, selectedFont, selectedLayout])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <>
      <AdminHeader title="Appearance" subtitle="Tinh chinh giao dien storefront va trai nghiem mua hang" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-5">
              <SectionTitle icon={Palette} title="Theme mode" subtitle="Chon nen sang, toi hoac theo he thong." />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'light', label: 'Light', description: 'Sang va gon', icon: Sun, available: true },
                  { id: 'dark', label: 'Dark', description: 'Tap trung hon', icon: Moon, available: true },
                  { id: 'system', label: 'System', description: 'Theo thiet bi', icon: Monitor, available: false },
                ].map((item) => {
                  const Icon = item.icon
                  const active = theme === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.available && setTheme(item.id as 'light' | 'dark')}
                      className={cn('rounded-xl border p-4 text-left transition', active ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40', !item.available && 'opacity-60')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        {active && <Check className="h-5 w-5 text-accent" />}
                      </div>
                      <p className="mt-4 font-semibold text-foreground">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <SectionTitle icon={Palette} title="Brand color" subtitle="Mau nhan cho nut, lien ket va cac trang thai quan trong." />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {colorPresets.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(index)}
                    className={cn('flex items-center gap-3 rounded-xl border p-4 text-left transition', selectedColor === index ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}
                  >
                    <span className="h-9 w-9 rounded-lg border border-border" style={{ background: color.primary }} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{color.name}</span>
                      <span className="block text-xs text-muted-foreground">{color.primary}</span>
                    </span>
                    {selectedColor === index && <Check className="h-4 w-4 text-accent" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <SectionTitle icon={Type} title="Typography" subtitle="Font chinh cho storefront va noi dung san pham." />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {fontPresets.map((font, index) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(index)}
                    className={cn('rounded-xl border p-4 text-left transition', selectedFont === index ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{font.name}</p>
                      {selectedFont === index && <Check className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="mt-3 text-2xl text-foreground" style={{ fontFamily: font.value }}>
                      {font.sample}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <SectionTitle icon={Layout} title="Store layout" subtitle="Chon mat do hien thi va cach sap xep noi dung." />
              <div className="mt-5 space-y-3">
                {layoutPresets.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => setSelectedLayout(layout.value)}
                    className={cn('flex w-full items-center gap-4 rounded-xl border p-4 text-left transition', selectedLayout === layout.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}
                  >
                    <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border', selectedLayout === layout.value ? 'border-accent' : 'border-border')}>
                      {selectedLayout === layout.value && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                    </span>
                    <span>
                      <span className="block font-semibold text-foreground">{layout.name}</span>
                      <span className="block text-sm text-muted-foreground">{layout.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <SectionTitle icon={ImageIcon} title="Homepage modules" subtitle="Bat tat cac module chinh tren trang chu." />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ToggleRow label="Announcement bar" description="Hien thanh thong bao khuyen mai dau trang." checked={announcementEnabled} onChange={setAnnouncementEnabled} />
                <ToggleRow label="Compact product cards" description="Giam chieu cao card de xem duoc nhieu san pham hon." checked={compactCards} onChange={setCompactCards} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { id: 'product', label: 'Product focus' },
                  { id: 'campaign', label: 'Campaign focus' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setHeroStyle(item.id)}
                    className={cn('rounded-xl border p-4 text-left transition', heroStyle === item.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40')}
                  >
                    <div className="h-20 rounded-lg border border-border bg-muted p-3">
                      <div className={cn('h-full rounded-md', item.id === 'product' ? 'bg-background' : 'bg-accent/20')} />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{item.label}</p>
                  </button>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button onClick={handleSave} className={cn('inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition', saved ? 'bg-green-600' : 'bg-accent hover:bg-accent/90')}>
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? 'Da luu' : 'Luu thay doi'}
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
                <RotateCcw className="h-4 w-4" />
                Khoi phuc mac dinh
              </button>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5 xl:sticky xl:top-6 xl:self-start">
            <h2 className="font-bold text-foreground">Live preview</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ban xem nhanh cua storefront voi lua chon hien tai.</p>
            <div className="mt-5 overflow-hidden rounded-xl border border-border" style={{ background: preview.color.surface, fontFamily: preview.font.value }}>
              <div className="flex items-center justify-between border-b border-black/10 bg-white/80 px-4 py-3">
                <div className="font-black" style={{ color: preview.color.primary }}>
                  HTech
                </div>
                <div className="flex gap-2">
                  <span className="h-2 w-8 rounded-full bg-black/10" />
                  <span className="h-2 w-8 rounded-full bg-black/10" />
                </div>
              </div>
              {announcementEnabled && <div className="px-4 py-2 text-center text-xs font-semibold text-white" style={{ background: preview.color.primary }}>Dat coc 20%, giu hang nhanh trong ngay</div>}
              <div className="p-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase text-black/50">{preview.layout.name}</p>
                  <h3 className="mt-2 text-xl font-black text-black">iPhone 15 Pro Max</h3>
                  <p className="mt-1 text-sm text-black/60">Hang moi, bao hanh chinh hang, ho tro tra gop.</p>
                  <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: preview.color.primary }}>
                    Dat hang
                  </button>
                </div>
                <div className={cn('mt-3 grid gap-3', compactCards ? 'grid-cols-3' : 'grid-cols-2')}>
                  {[1, 2, 3].slice(0, compactCards ? 3 : 2).map((item) => (
                    <div key={item} className="h-20 rounded-lg bg-white shadow-sm" />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Palette; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-left transition hover:border-accent/40">
      <span>
        <span className="block font-semibold text-foreground">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
      <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-accent' : 'bg-muted')}>
        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition', checked ? 'left-6' : 'left-1')} />
      </span>
    </button>
  )
}
