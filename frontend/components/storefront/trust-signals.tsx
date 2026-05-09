'use client'

import { useEffect, useRef } from 'react'
import { Truck, ShieldCheck, Bot, RotateCcw, Phone, Award } from 'lucide-react'

const signals = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'On all orders over 5,000,000₫ nationwide.',
  },
  {
    icon: ShieldCheck,
    title: '24-Month Warranty',
    desc: 'Official manufacturer warranty on every product.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Support',
    desc: '24/7 AI concierge for instant answers and recommendations.',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    desc: 'Hassle-free returns and exchanges on all items.',
  },
  {
    icon: Phone,
    title: 'Expert Consultation',
    desc: 'Speak with a tech specialist before you buy.',
  },
  {
    icon: Award,
    title: 'Certified Authentic',
    desc: '100% genuine products from official distributors.',
  },
]

export function TrustSignals() {
  const sectionRef = useRef<HTMLElement>(null)

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
            Why HTech Store
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">
            Shop with confidence.
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
