'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

const categories = [
  {
    id: 'iphone',
    label: 'iPhone',
    image: '/images/iphone-15-pro.jpg',
    href: '/products?category=phone',
    accent: 'from-slate-50 to-blue-light',
    span: 'lg:col-span-2 lg:row-span-2',
    textColor: 'text-foreground',
    tag: true,
  },
  {
    id: 'macbook',
    label: 'MacBook',
    image: '/images/macbook-pro.jpg',
    href: '/products?category=laptop',
    accent: 'from-slate-50 to-slate-100',
    span: 'lg:col-span-1',
    textColor: 'text-foreground',
    tag: true,
  },
  {
    id: 'gaming',
    label: 'PC Gaming',
    image: '/images/gaming-pc.jpg',
    href: '/products?category=pc',
    accent: 'from-slate-900 to-slate-800',
    span: 'lg:col-span-1',
    textColor: 'text-white',
    tag: true,
  },
  {
    id: 'accessories',
    label: 'Phụ kiện',
    image: '/images/accessories.jpg',
    href: '/products?category=accessory',
    accent: 'from-slate-50 to-slate-100',
    span: 'lg:col-span-2',
    textColor: 'text-foreground',
    tag: false,
  },
]

export function CategoryGrid() {
  const { locale, t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.05 },
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="categories" className="py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
              {t('cat.title')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground text-balance">
              {t('cat.subtitle')}
            </h2>
          </div>
          <Link
            href="#products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-blue-dark transition-colors"
          >
            {t('products.viewall')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 auto-rows-[240px]">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'reveal group relative overflow-hidden rounded-2xl bg-gradient-to-br cursor-pointer',
                cat.accent,
                cat.span,
                'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/10',
              )}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Tag badge */}
              {cat.tag && (
                <span
                  className={cn(
                    'absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    cat.id === 'gaming'
                      ? 'bg-accent text-accent-foreground'
                      : cat.id === 'macbook'
                        ? 'bg-foreground text-background'
                        : 'bg-amber-400 text-amber-900',
                  )}
                >
                  {t(`cat.tag.${cat.id === 'iphone' ? 'best' : cat.id === 'macbook' ? 'new' : 'hot'}` as any)}
                </span>
              )}

              {/* Image */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay gradient */}
                <div
                  className={cn(
                    'absolute inset-0',
                    cat.textColor === 'text-white'
                      ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
                      : 'bg-gradient-to-t from-background/80 via-background/20 to-transparent',
                  )}
                />
              </div>

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <p
                  className={cn(
                    'text-xs font-medium uppercase tracking-wider mb-0.5 opacity-70',
                    cat.textColor,
                  )}
                >
                  {t(`cat.${cat.id}.desc` as any)}
                </p>
                <div className="flex items-center justify-between">
                  <h3
                    className={cn(
                      'text-xl font-black tracking-tight',
                      cat.id === 'iphone' ? 'text-2xl' : '',
                      cat.textColor,
                    )}
                  >
                    {t(`cat.${cat.id}` as any) || cat.label}
                  </h3>
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full bg-background/10 backdrop-blur flex items-center justify-center transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground',
                      cat.textColor,
                    )}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
