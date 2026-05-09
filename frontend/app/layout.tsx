import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { I18nProvider } from '@/lib/i18n'
import { CartProvider } from '@/lib/store'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HTech Store — iPhone, Laptop & PC Gaming cao cấp',
  description:
    'HTech Store — Cửa hàng công nghệ hàng đầu Việt Nam. iPhone, MacBook, PC Gaming chính hãng. Bảo hành toàn quốc, trả góp 0%, giao hàng miễn phí.',
  generator: 'v0.app',
  keywords: ['iPhone', 'MacBook', 'gaming PC', 'laptop', 'Việt Nam', 'cửa hàng công nghệ', 'HTech'],
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <ThemeProvider>
          <I18nProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
