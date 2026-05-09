'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useI18n } from '@/lib/i18n'
import { useCart } from '@/lib/store'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPriceFormatted, totalPrice } = useCart()
  const { t } = useI18n()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const shipping = totalPrice >= 2000000 ? 0 : 50000
  const discount = promoApplied ? Math.round(totalPrice * 0.1) : 0
  const finalTotal = totalPrice + shipping - discount

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + '₫'

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'htech10') {
      setPromoApplied(true)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('cart.empty')}</h1>
            <p className="text-muted-foreground mb-8">{t('cart.emptydesc')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-foreground text-background font-semibold hover:bg-accent transition-colors"
            >
              {t('cart.continue')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('cart.continue')}
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
          {t('cart.title')}
        </h1>
        <p className="text-muted-foreground mb-8">
          {totalItems} {t('cart.items')}
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <article
                key={item.product.id}
                className="flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-card border border-border"
              >
                {/* Image */}
                <Link href={`/products/${item.product.id}`} className="shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-surface overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-bold text-foreground hover:text-accent transition-colors truncate">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">{item.product.subtitle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: item.product.colors[item.selectedColor] }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {t('product.color')} {item.selectedColor + 1}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      aria-label={t('cart.remove')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-auto pt-4 flex flex-wrap items-end justify-between gap-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-14 h-10 text-center border border-border rounded-lg font-semibold bg-background"
                        min={1}
                        max={item.product.stock}
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-black text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {item.product.priceFormatted} x {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl bg-card border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Tóm tắt đơn hàng</h2>

              {/* Promo code */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Nhập mã..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={promoApplied}
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    disabled={promoApplied || !promoCode}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      promoApplied
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-foreground text-background hover:bg-accent disabled:opacity-50'
                    )}
                  >
                    {promoApplied ? 'Đã áp dụng' : 'Áp dụng'}
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 mt-2">Giảm 10% đã được áp dụng!</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Thử mã: HTECH10</p>
              </div>

              {/* Summary */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-medium text-foreground">{totalPriceFormatted}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá (10%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
                  <span className={cn('font-medium', shipping === 0 ? 'text-green-600' : 'text-foreground')}>
                    {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Miễn phí vận chuyển cho đơn từ 2,000,000₫
                  </p>
                )}
                <div className="h-px bg-border my-4" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-foreground">{t('cart.total')}</span>
                  <span className="font-black text-foreground">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button className="w-full mt-6 py-4 rounded-2xl bg-foreground text-background font-semibold text-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
                {t('cart.checkout')}
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="w-4 h-4 text-accent" />
                  <span>{t('trust.shipping')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>{t('trust.warranty')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
