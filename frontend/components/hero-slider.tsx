import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSlider() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 lg:p-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Welcome
          </span>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground text-balance lg:text-5xl">
            H-TECH
          </h1>
          <p className="max-w-md text-base text-muted-foreground text-pretty">
            Laptop, điện thoại, linh phụ kiện.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/category/laptop">
                Khám phá sản phẩm
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full">
              <Link href="/repair">
                <Wrench className="mr-1.5 h-4 w-4" />
                Repair Service
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative grid min-h-[280px] place-items-center bg-secondary/40 lg:min-h-[420px]">
          <Image
            src="/htech-logo.png"
            alt="H-TECH"
            width={360}
            height={360}
            className="h-auto w-3/4 max-w-[360px] object-contain"
            priority
          />
        </div>
      </div>
    </section>
  )
}
