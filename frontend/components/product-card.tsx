import Image from "next/image"
import Link from "next/link"
import { Cpu, MemoryStick, Gauge, Monitor, BatteryFull, Camera, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Product, formatVND } from "@/lib/products"
import { cn } from "@/lib/utils"

function SpecRow({
  icon: Icon,
  label,
}: {
  icon: typeof Cpu
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" />
      <span className="truncate">{label}</span>
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Top badges */}
      <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
              -{discount}%
            </span>
          )}
        </div>
        <button
          aria-label="Yêu thích"
          className="grid h-8 w-8 place-items-center rounded-full bg-card/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-rose-500 group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-secondary/50">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">{product.brand}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              product.inStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                product.inStock ? "bg-emerald-500" : "bg-slate-400",
              )}
            />
            {product.inStock ? "In Stock" : "Hết hàng"}
          </span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Adaptive specs */}
        <div className="grid grid-cols-1 gap-1.5 rounded-lg bg-secondary/60 p-2.5">
          {product.category === "laptop" && (
            <>
              <SpecRow icon={Cpu} label={product.specs.cpu} />
              <SpecRow icon={MemoryStick} label={`RAM ${product.specs.ram}`} />
              <SpecRow icon={Gauge} label={product.specs.gpu} />
            </>
          )}
          {product.category === "pc" && (
            <>
              <SpecRow icon={Cpu} label={product.specs.cpu} />
              <SpecRow icon={MemoryStick} label={product.specs.ram} />
              <SpecRow icon={Gauge} label={product.specs.gpu} />
            </>
          )}
          {product.category === "smartphone" && (
            <>
              <SpecRow icon={Cpu} label={product.specs.chipset} />
              <SpecRow icon={Monitor} label={product.specs.screen} />
              <SpecRow icon={BatteryFull} label={product.specs.battery} />
              <SpecRow icon={Camera} label={product.specs.camera} />
            </>
          )}
          {product.category === "tablet" && (
            <>
              <SpecRow icon={Cpu} label={product.specs.chipset} />
              <SpecRow icon={Monitor} label={product.specs.screen} />
              <SpecRow icon={BatteryFull} label={product.specs.battery} />
            </>
          )}
        </div>

        {/* Price + condition */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="font-heading text-lg font-bold text-primary">
              {formatVND(product.price)}
            </p>
            {product.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatVND(product.oldPrice)}
              </p>
            )}
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground">
            {product.condition}
          </span>
        </div>

        <Button asChild size="sm" className="mt-2 w-full rounded-full">
          <Link href={`/product/${product.slug}`}>Xem chi tiết</Link>
        </Button>
      </div>
    </article>
  )
}
