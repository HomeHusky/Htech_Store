'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Truck } from 'lucide-react'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 },
    )
    const reveals = sectionRef.current?.querySelectorAll('.reveal')
    reveals?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-background"
    >
      {/* Subtle blue glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Badge */}
            <div className="reveal inline-flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full border border-accent/30 bg-blue-light text-accent text-xs font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-blue" />
              New — iPhone 15 Pro Series
            </div>

            {/* Headline */}
            <div className="reveal delay-100 space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05] text-balance">
                Titanium.
                <br />
                <span className="text-accent">Strong.</span>
                <br />
                Light.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md mt-4">
                The most powerful iPhone ever. Pro camera system with 5x optical zoom,
                A17 Pro chip, and a beautiful titanium design.
              </p>
            </div>

            {/* Social proof */}
            <div className="reveal delay-200 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-background"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-semibold text-foreground ml-1">4.9</span>
                </div>
                <span className="text-xs text-muted-foreground">from 2,400+ reviews</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="reveal delay-300 flex flex-wrap gap-3">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-dark transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 active:scale-95"
              >
                Shop iPhone 15 Pro
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#categories"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-muted transition-all duration-200 border border-border"
              >
                Browse All
              </Link>
            </div>

            {/* Trust pills */}
            <div className="reveal delay-400 flex flex-wrap gap-3">
              {[
                { icon: Truck, text: 'Free shipping' },
                { icon: Shield, text: '24-month warranty' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5 text-accent" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — product visual */}
          <div className="reveal delay-200 relative flex items-center justify-center">
            {/* Glow ring */}
            <div className="absolute inset-8 rounded-[3rem] bg-accent/8 blur-2xl" />

            {/* Product image */}
            <div className="relative z-10 animate-float">
              <Image
                src="/images/iphone-hero.jpg"
                alt="iPhone 15 Pro in titanium"
                width={520}
                height={580}
                className="object-contain drop-shadow-2xl max-h-[520px] w-auto"
                priority
              />
            </div>

            {/* Floating spec cards */}
            <div className="absolute top-8 left-4 glass rounded-2xl px-4 py-3 shadow-lg animate-fade-in delay-500">
              <p className="text-xs text-muted-foreground">Chip</p>
              <p className="text-sm font-bold text-foreground">A17 Pro</p>
            </div>
            <div className="absolute bottom-12 right-2 glass rounded-2xl px-4 py-3 shadow-lg animate-fade-in delay-500">
              <p className="text-xs text-muted-foreground">Camera</p>
              <p className="text-sm font-bold text-foreground">48 MP · 5x zoom</p>
            </div>
            <div className="absolute top-1/2 right-0 translate-y-4 glass rounded-2xl px-4 py-3 shadow-lg animate-fade-in delay-400">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-bold text-accent">29,990,000₫</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
