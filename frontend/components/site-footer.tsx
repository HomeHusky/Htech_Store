import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Youtube } from "lucide-react"

const COLUMNS = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Laptop", href: "/category/laptop" },
      { label: "PC / Desktop", href: "/category/pc" },
      { label: "Smartphone", href: "/category/smartphone" },
      { label: "Tablet", href: "/category/tablet" },
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      { label: "Sửa chữa", href: "/repair" },
      { label: "Bảo hành", href: "/warranty" },
      { label: "Trả góp 0%", href: "/installment" },
      { label: "Thu cũ đổi mới", href: "/trade-in" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Chính sách đổi trả", href: "/policy/return" },
      { label: "Chính sách bảo mật", href: "/policy/privacy" },
      { label: "FAQs", href: "/faq" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/htech-logo.png"
                alt="H-TECH logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                H-TECH
              </span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground text-pretty">
              Laptop, điện thoại, linh phụ kiện.
            </p>
            <p className="text-xs text-muted-foreground">
              Thông tin liên hệ sẽ được cập nhật trong Admin → Cài đặt.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} H-TECH.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Facebook className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="YouTube"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Youtube className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
