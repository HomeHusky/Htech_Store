import { buildApiUrl } from '@/lib/api'
import type { ProductDTO } from '@/lib/products-api'

export type AIImportRowInput = {
  id: string
  category: string
  files: File[]
}

export type AIImportEvent =
  | { type: 'received'; row_count: number }
  | { type: 'uploading'; row_id: string; image_count: number }
  | { type: 'uploaded'; row_id: string; image_urls: string[] }
  | { type: 'analyzing'; row_id: string; image_count: number }
  | { type: 'creating'; row_id: string }
  | { type: 'created'; row_id: string; product: ProductDTO }
  | { type: 'failed'; row_id: string; error: string }
  | { type: 'done'; created: number; failed: number }

export function buildAIProductImportFormData(rows: AIImportRowInput[]) {
  const formData = new FormData()
  formData.append('rows', JSON.stringify(rows.map(({ id, category }) => ({ id, category }))))
  rows.forEach((row) => {
    row.files.forEach((file) => {
      formData.append(`files:${row.id}`, file)
    })
  })
  return formData
}

export async function streamAIProductImport(
  rows: AIImportRowInput[],
  onEvent: (event: AIImportEvent) => void,
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('htech-auth-token') : null
  const response = await fetch(buildApiUrl('/admin/products/ai-create/stream'), {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: buildAIProductImportFormData(rows),
  })

  if (!response.ok || !response.body) {
    throw new Error(`AI import failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    lines.filter(Boolean).forEach((line) => onEvent(JSON.parse(line) as AIImportEvent))
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as AIImportEvent)
  }
}
