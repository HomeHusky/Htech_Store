type RequestConfig = Omit<RequestInit, 'body' | 'method'> & {
  params?: Record<string, string | number | boolean | null | undefined>
}

type ApiResponse<T = any> = {
  data: T
  status: number
  headers: Headers
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/api`
    : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8000/api`)

export function buildApiUrl(path: string, params?: RequestConfig['params']) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

async function request<T = any>(method: string, path: string, body?: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> {
  const { params, headers, ...init } = config
  const token = typeof window !== 'undefined' ? localStorage.getItem('htech-auth-token') : null
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const response = await fetch(buildApiUrl(path, params), {
    ...init,
    method,
    headers: {
      ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    throw Object.assign(new Error(`API request failed with status ${response.status}`), {
      status: response.status,
      data,
    })
  }

  return {
    data: data as T,
    status: response.status,
    headers: response.headers,
  }
}

const api = {
  get: <T = any>(path: string, config?: RequestConfig) => request<T>('GET', path, undefined, config),
  post: <T = any>(path: string, body?: unknown, config?: RequestConfig) => request<T>('POST', path, body, config),
  put: <T = any>(path: string, body?: unknown, config?: RequestConfig) => request<T>('PUT', path, body, config),
  patch: <T = any>(path: string, body?: unknown, config?: RequestConfig) => request<T>('PATCH', path, body, config),
  delete: <T = any>(path: string, config?: RequestConfig) => request<T>('DELETE', path, undefined, config),
}

export default api
