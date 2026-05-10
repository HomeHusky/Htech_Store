'use client'

import api from '@/lib/api'

export type AuthUser = {
  id: string
  email: string
  name?: string | null
  username?: string | null
  role: 'USER' | 'STAFF' | 'ADMIN'
  permission: 'NONE' | 'READ_ONLY' | 'FULL'
}

type LoginResponse = {
  access_token: string
  token_type: string
  user: AuthUser
}

export const AUTH_TOKEN_KEY = 'htech-auth-token'

export function getStoredToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null
}

export function storeToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function canAccessAdmin(user?: AuthUser | null) {
  return !!user && (user.role === 'ADMIN' || user.role === 'STAFF') && user.permission !== 'NONE'
}

export function canManageAccounts(user?: AuthUser | null) {
  return !!user && user.role === 'ADMIN' && user.permission === 'FULL'
}

export async function loginWithPassword(identifier: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { identifier, password })
  storeToken(data.access_token)
  return data.user
}

export async function fetchMe() {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

export function googleLoginUrl() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/api`
      : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8000/api`)
  return `${apiBase.replace(/\/$/, '')}/auth/google/login`
}
