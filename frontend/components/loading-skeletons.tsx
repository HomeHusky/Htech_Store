import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <article className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="relative h-52 bg-surface">
        <Skeleton className="absolute left-3 top-3 h-6 w-16 rounded-full" />
        <Skeleton className="absolute right-3 top-3 h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-4 w-4 rounded-full" />
          ))}
        </div>
        <div className="flex items-end justify-between gap-3 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </article>
  )
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function ProductListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[180px_1fr]">
          <Skeleton className="h-44 rounded-lg" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
            <div className="mt-auto flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-4 w-80" />
      <Skeleton className="mb-6 h-5 w-36" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-5 w-44" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
          </div>
          <Skeleton className="h-10 w-56" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-14 flex-1 rounded-2xl" />
            <Skeleton className="h-14 flex-1 rounded-2xl" />
          </div>
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border bg-surface p-5">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="mx-auto h-6 w-6 rounded-full" />
                <Skeleton className="mx-auto h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
    </div>
  )
}

export function SearchResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="py-2">
      <Skeleton className="mx-5 my-2 h-3 w-36" />
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminTableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number
  rows?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} className="border-b border-border last:border-0">
          {Array.from({ length: columns }).map((__, column) => (
            <td key={column} className="px-5 py-4">
              <Skeleton className={cn('h-4', column === 0 ? 'w-40' : column % 2 ? 'w-24' : 'w-28')} />
              {column === 0 && <Skeleton className="mt-2 h-3 w-24" />}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function AdminStatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function AdminCardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </article>
      ))}
    </div>
  )
}

export function AdminListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export function AdminFormSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-36 rounded-lg md:col-span-2" />
    </div>
  )
}
