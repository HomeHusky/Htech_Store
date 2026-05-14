'use client'

import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc'

export type SortState<T extends string> = {
  key: T
  direction: SortDirection
}

export function toggleSort<T extends string>(current: SortState<T>, key: T): SortState<T> {
  if (current.key !== key) return { key, direction: 'asc' }
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
}

export function parseAdminDate(value?: string | null) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function formatAdminDate(value?: string | null) {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function compareValues(a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''), 'vi', { numeric: true, sensitivity: 'base' })
}

export function sortRows<T, K extends string>(
  rows: T[],
  sort: SortState<K>,
  selectors: Record<K, (row: T) => unknown>,
) {
  const selector = selectors[sort.key]
  return [...rows].sort((a, b) => {
    const result = compareValues(selector(a), selector(b))
    return sort.direction === 'asc' ? result : -result
  })
}

export function SortableTh<T extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string
  sortKey: T
  sort: SortState<T>
  onSort: (key: T) => void
  className?: string
}) {
  const active = sort.key === sortKey
  const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ChevronUp : ChevronDown

  return (
    <th className={cn('whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground', className)}>
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1.5 rounded-md transition hover:text-foreground">
        {label}
        <Icon className={cn('h-3.5 w-3.5', active && 'text-foreground')} />
      </button>
    </th>
  )
}
