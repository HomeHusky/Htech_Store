'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock, Search, TrendingUp, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Product } from '@/lib/store'
import { searchProducts } from '@/lib/products-api'
import { SearchResultsSkeleton } from '@/components/loading-skeletons'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const recentSearches = ['iPhone 15 Pro', 'MacBook Air', 'RTX 4070']
const popularSearches = ['iPhone', 'Android', 'Laptop Windows', 'May cu']

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { locale, t } = useI18n()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    const trimmed = query.trim()
    if (!open || trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const timeout = window.setTimeout(() => {
      searchProducts(trimmed, { locale, limit: 8 })
        .then((items) => {
          if (!cancelled) setResults(items)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [open, query, locale])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    if (!open) return

    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const submitSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    onClose()
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 animate-fade-in bg-foreground/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-auto mt-20 max-w-2xl px-4 sm:mt-32">
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitSearch()
              }}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            )}
            <button onClick={onClose} className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              ESC
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {query.length === 0 ? (
              <div className="space-y-6 p-5">
                <div>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t('search.recent')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t('search.popular')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : loading ? (
              <SearchResultsSkeleton count={4} />
            ) : results.length > 0 ? (
              <div className="py-2">
                <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('search.results')} ({results.length})
                </p>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug || product.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                      <Image src={product.image} alt={product.name} width={56} height={56} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{product.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{product.subtitle}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-foreground">{product.priceFormatted}</p>
                      {product.originalPriceFormatted && <p className="text-xs text-muted-foreground line-through">{product.originalPriceFormatted}</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-accent transition-colors hover:bg-blue-light"
                >
                  {t('products.viewall')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="p-10 text-center">
                <Search className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">{t('search.noresults')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
