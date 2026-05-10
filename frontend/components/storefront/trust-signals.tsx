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
    <section ref={sectionRef} className="py-20 bg-foreground text-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-12">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            {t('trust.title')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">
            {t('trust.subtitle')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {signals.map((signal, i) => {
            const Icon = signal.icon
            return (
              <div
                key={signal.title}
                className={`reveal bg-foreground p-6 flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-background leading-snug">{signal.title}</p>
                  <p className="text-xs text-background/50 mt-1 leading-relaxed">{signal.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
