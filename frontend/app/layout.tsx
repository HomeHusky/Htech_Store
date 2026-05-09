import type { Metadata, Viewport } from "next"
import { Inter, Lexend } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AiChatBubble } from "@/components/ai-chat-bubble"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
})

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-lexend",
})

export const metadata: Metadata = {
  title: {
    default: "H-TECH — Laptop, điện thoại, linh phụ kiện",
    template: "%s | H-TECH",
  },
  description: "H-TECH — Laptop, điện thoại, linh phụ kiện.",
  generator: "v0.app",
  icons: {
    icon: "/htech-logo.png",
    apple: "/htech-logo.png",
  },
  openGraph: {
    title: "H-TECH — Laptop, điện thoại, linh phụ kiện",
    description: "Laptop, điện thoại, linh phụ kiện.",
    type: "website",
    images: [{ url: "/htech-logo.png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${lexend.variable} bg-background`}>
      <body className="font-sans antialiased text-foreground">
        {children}
        <AiChatBubble />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
