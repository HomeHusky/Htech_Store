'use client'

import { useEffect, useRef } from 'react'
import { Truck, ShieldCheck, Bot, RotateCcw, Phone, Award } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function TrustSignals() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)

  const signals = [
    {
      icon: Truck,
      title: t('trust.shipping'),
      desc: t('trust.shipping.full'),
    },
    {
      icon: ShieldCheck,
      title: t('trust.warranty'),
      desc: t('trust.warranty.full'),
    },
    {
      icon: Bot,
      title: t('trust.ai.title'),
      desc: t('trust.ai.desc'),
    },
    {
      icon: RotateCcw,
      title: t('trust.return'),
      desc: t('trust.return.full'),
    },
    {
      icon: Phone,
      title: t('trust.expert.title'),
      desc: t('trust.expert.desc'),
    },
    {
      icon: Award,
      title: t('trust.authentic.title'),
      desc: t('trust.authentic.desc'),
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 },
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="overflow-hidden border-y border-border bg-surface-alt py-20 text-foreground dark:border-white/10 dark:bg-foreground dark:text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-12">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            {t('trust.title')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">
            {t('trust.subtitle')}
          </h2>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3 lg:grid-cols-6 dark:border-white/10 dark:bg-white/10">
          {signals.map((signal, i) => {
            const Icon = signal.icon
            return (
              <div
                key={signal.title}
                className="reveal flex flex-col items-center gap-3 bg-card p-6 text-center transition-colors hover:bg-muted dark:bg-foreground dark:hover:bg-white/5"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm shadow-accent/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug text-foreground dark:text-background">{signal.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-background/65">{signal.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
