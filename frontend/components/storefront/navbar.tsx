'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  X,
  Menu,
  Zap,
  Sun,
  Moon,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { useI18n } from '@/lib/i18n'
import { useCart } from '@/lib/store'
import { SearchModal } from './search-modal'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifVisible, setNotifVisible] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useI18n()
  const { totalItems } = useCart()

  const navLinks = [
    { label: t('nav.iphone'), href: '/products?category=phone' },
    { label: t('nav.macbook'), href: '/products?category=laptop' },
    { label: t('nav.gaming'), href: '/products?category=pc' },
    { label: t('nav.accessories'), href: '/products?category=accessory' },
    { label: t('nav.deals'), href: '/products?badge=Sale' },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClick = () => setLangMenuOpen(false)
    if (langMenuOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [langMenuOpen])

  return (
    <>
      {/* Notification bar */}
      {notifVisible && (
        <div className="w-full bg-foreground text-background text-xs font-medium py-2.5 text-center relative flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5 fill-accent stroke-accent" />
          <span>
            {t('notif.tradein')}{' '}
            <span className="text-accent font-semibold">20,000,000 VND</span>.{' '}
            <Link href="/products" className="underline underline-offset-2 hover:no-underline">
              {t('notif.learnmore')}
            </Link>
          </span>
          <button
            onClick={() => setNotifVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main nav */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled ? 'glass shadow-sm' : 'bg-background/95 backdrop-blur-sm',
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-lg tracking-tight text-foreground shrink-0"
            >
              <Image src="/favicon.jpg" alt="HTech" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
              HTech
            </Link>

            {/* Desktop links */}
            <ul className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all duration-200 flex items-center gap-1"
                  >
                    {link.label}
                    {link.label === t('nav.iphone') && (
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label={t('nav.search')}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLangMenuOpen(!langMenuOpen)
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1"
                  aria-label="Language"
                >
                  <Globe className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs font-medium uppercase">{locale}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl py-1 min-w-[140px] animate-fade-in z-50">
                    <button
                      onClick={() => { setLocale('vi'); setLangMenuOpen(false) }}
                      className={cn(
                        'w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2',
                        locale === 'vi' && 'text-accent font-medium'
                      )}
                    >
                      <span className="text-base">🇻🇳</span>
                      {t('lang.vi')}
                    </button>
                    <button
                      onClick={() => { setLocale('en'); setLangMenuOpen(false) }}
                      className={cn(
                        'w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2',
                        locale === 'en' && 'text-accent font-medium'
                      )}
                    >
                      <span className="text-base">🇺🇸</span>
                      {t('lang.en')}
                    </button>
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Account */}
              <Link
                href="/admin"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all hidden sm:flex"
                aria-label={t('nav.account')}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all relative"
                aria-label={t('nav.cart')}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu */}
              <button
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={t('nav.menu')}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-lg px-4 py-4 flex flex-col gap-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-accent hover:bg-blue-light transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {t('nav.admin')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
