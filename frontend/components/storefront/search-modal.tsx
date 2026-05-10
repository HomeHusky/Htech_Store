'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Product } from '@/lib/store'
import { searchProducts } from '@/lib/products-api'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const recentSearches = ['iPhone 15 Pro', 'MacBook Air', 'RTX 4070']
const popularSearches = ['iPhone', 'MacBook', 'Gaming Laptop', 'AirPods']

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

  const submitSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    onClose()
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = ''
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-2xl mx-auto mt-20 sm:mt-32 px-4">
        <div className="bg-popover rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-up">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch()
              }}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border"
            >
              ESC
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.length === 0 ? (
              <div className="p-5 space-y-6">
                {/* Recent searches */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {t('search.recent')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular searches */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t('search.popular')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="p-10 text-center">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3 animate-pulse" />
                <p className="text-muted-foreground">Đang tìm sản phẩm...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <p className="px-5 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('search.results')} ({results.length})
                </p>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug || product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-muted transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{product.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">{product.priceFormatted}</p>
                      {product.originalPriceFormatted && (
                        <p className="text-xs text-muted-foreground line-through">{product.originalPriceFormatted}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm text-accent font-medium hover:bg-blue-light transition-colors"
                >
                  {t('products.viewall')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="p-10 text-center">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t('search.noresults')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
