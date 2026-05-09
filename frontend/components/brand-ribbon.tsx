import { BRANDS } from "@/lib/products"

export function BrandRibbon() {
  if (BRANDS.length === 0) return null

  return (
    <section
      aria-label="Thương hiệu phân phối"
      className="rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center gap-6 overflow-x-auto px-6 py-5 no-scrollbar">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Phân phối
          <br />
          chính hãng
        </p>
        <div className="h-10 w-px shrink-0 bg-border" />
        <ul className="flex items-center gap-8">
          {BRANDS.map((brand) => (
            <li key={brand} className="shrink-0">
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground/60 transition-colors hover:text-foreground">
                {brand}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
