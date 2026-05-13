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
    labelKey: 'cat.iphone',
    descKey: 'cat.iphone.desc',
    image: '/images/iphone-15-pro.jpg',
    href: '/products?segment=iphone',
    accent: 'from-slate-50 via-blue-light to-white dark:from-[#1a202c] dark:via-[#152338] dark:to-[#111827]',
    span: 'lg:col-span-2 lg:row-span-2',
    textColor: 'text-foreground',
    imageClass: 'object-contain p-7 sm:p-9',
    tag: true,
  },
  {
    id: 'macbook',
    labelKey: 'cat.macbook',
    descKey: 'cat.macbook.desc',
    image: '/images/macbook-pro.jpg',
    href: '/products?segment=macbook',
    accent: 'from-zinc-50 to-slate-100 dark:from-[#171717] dark:to-[#20242c]',
    span: 'lg:col-span-2',
    textColor: 'text-foreground',
    imageClass: 'object-contain p-6',
    tag: true,
  },
  {
    id: 'android',
    labelKey: 'cat.android',
    descKey: 'cat.android.desc',
    image: '/images/iphone-hero.jpg',
    href: '/products?segment=android',
    accent: 'from-emerald-50 to-cyan-50 dark:from-[#10251c] dark:to-[#0f252a]',
    span: 'lg:col-span-2',
    textColor: 'text-foreground',
    imageClass: 'object-contain p-7',
    tag: true,
  },
  {
    id: 'windows',
    labelKey: 'cat.windows',
    descKey: 'cat.windows.desc',
    image: '/images/gaming-laptop.jpg',
    href: '/products?segment=windows',
    accent: 'from-sky-50 to-slate-100 dark:from-[#102033] dark:to-[#1d2430]',
    span: 'lg:col-span-2',
    textColor: 'text-foreground',
    imageClass: 'object-contain p-6',
    tag: false,
  },
  {
    id: 'gaming',
    labelKey: 'cat.gaming',
    descKey: 'cat.gaming.desc',
    image: '/images/gaming-pc.jpg',
    href: '/products?category=pc',
    accent: 'from-zinc-900 to-slate-800 dark:from-[#141414] dark:to-[#242832]',
    span: 'lg:col-span-2',
    textColor: 'text-white',
    imageClass: 'object-contain p-6',
    tag: true,
  },
  {
    id: 'used',
    labelKey: 'cat.used',
    descKey: 'cat.used.desc',
    image: '/images/macbook-air.jpg',
    href: '/used',
    accent: 'from-amber-50 to-stone-100 dark:from-[#292419] dark:to-[#1f211c]',
    span: 'lg:col-span-1',
    textColor: 'text-foreground',
    imageClass: 'object-contain p-5',
    tag: true,
  },
  {
    id: 'accessories',
    labelKey: 'cat.accessories',
    descKey: 'cat.accessories.desc',
    image: '/images/accessories.jpg',
    href: '/products?category=accessory',
    accent: 'from-zinc-50 to-slate-100 dark:from-[#171717] dark:to-[#21242a]',
    span: 'lg:col-span-1',
    textColor: 'text-foreground',
    imageClass: 'object-contain p-5',
    tag: false,
  },
]

export function CategoryGrid() {
  const { t } = useI18n()
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
    <section ref={sectionRef} id="categories" className="bg-surface-alt py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              {t('cat.title')}
            </p>
            <h2 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {t('cat.subtitle')}
            </h2>
          </div>
          <Link
            href="#products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-blue-dark"
          >
            {t('products.viewall')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 auto-rows-[220px] sm:grid-cols-2 sm:auto-rows-[240px] lg:grid-cols-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'reveal group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br',
                cat.accent,
                cat.span,
                'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/10',
              )}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {cat.tag && (
                <span
                  className={cn(
                    'absolute left-4 top-4 z-20 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                    cat.id === 'gaming'
                      ? 'bg-accent text-accent-foreground'
                      : cat.id === 'macbook' || cat.id === 'windows'
                        ? 'bg-foreground text-background'
                        : 'bg-amber-400 text-amber-900',
                  )}
                >
                  {t(`cat.tag.${cat.id === 'iphone' ? 'best' : cat.id === 'macbook' ? 'new' : 'hot'}` as any)}
                </span>
              )}

              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={t(cat.labelKey as any)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className={cn('transition-transform duration-500 group-hover:scale-105', cat.imageClass)}
                />
                <div
                  className={cn(
                    'absolute inset-0',
                    cat.textColor === 'text-white'
                      ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
                      : 'bg-gradient-to-t from-background/85 via-background/20 to-transparent',
                  )}
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <p className={cn('mb-0.5 text-xs font-medium uppercase tracking-wider opacity-70', cat.textColor)}>
                  {t(cat.descKey as any)}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <h3 className={cn('text-xl font-black tracking-tight', cat.id === 'iphone' && 'text-2xl', cat.textColor)}>
                    {t(cat.labelKey as any)}
                  </h3>
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/10 backdrop-blur transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground',
                      cat.textColor,
                    )}
                  >
                    <ArrowRight className="h-4 w-4" />
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
