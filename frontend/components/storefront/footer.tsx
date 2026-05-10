'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Facebook, Youtube, Instagram } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function Footer() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const footerLinks = {
    [t('footer.products')]: [t('nav.iphone'), t('nav.macbook'), 'iPad', t('nav.gaming'), t('nav.accessories'), t('nav.deals')],
    [t('footer.support')]: [t('footer.track'), t('footer.refunds'), t('trust.warranty'), t('admin.repairs'), t('footer.contact_us')],
    [t('footer.company')]: [t('footer.about'), t('footer.careers'), t('footer.press'), t('footer.partners'), t('footer.blog')],
    [t('footer.legal')]: [t('footer.privacy'), t('footer.terms'), 'Cookie Policy'],
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-foreground text-background border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground text-xs font-black">H</span>
                </div>
                <span className="font-bold text-lg text-background">HTech Store</span>
              </div>
              <p className="text-sm text-background/50 leading-relaxed max-w-xs">
                {t('footer.desc')}
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-background mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                {t('footer.stay_loop')}
              </p>
              {subscribed ? (
                <p className="text-sm text-accent font-medium">
                  {t('footer.thanks')}
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-background placeholder:text-background/30 focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl hover:bg-blue-dark transition-colors flex items-center gap-1.5 text-sm font-semibold shrink-0"
                  >
                    {t('footer.join')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
              <p className="text-xs text-background/30 mt-2">
                {t('footer.exclusive')}
              </p>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Social media"
                >
                  <Icon className="w-4 h-4 text-background" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-widest text-background/40">
                {section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/30">
            &copy; {new Date().getFullYear()} HTech Store. {t('footer.rights')}.
          </p>
          <div className="flex items-center gap-4">
            {[t('footer.privacy'), t('footer.terms'), t('footer.sitemap')].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-background/30 hover:text-background/60 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
