'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
export type BrandTheme = {
  primary: string
  surface: string
  font: string
  layout: string
  compactCards: boolean
  announcementEnabled: boolean
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  brandTheme: BrandTheme
  setBrandTheme: (theme: BrandTheme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)
const defaultBrandTheme: BrandTheme = {
  primary: '#0071e3',
  surface: '#f5f9ff',
  font: 'Inter, system-ui, sans-serif',
  layout: 'default',
  compactCards: false,
  announcementEnabled: true,
}

function applyBrandTheme(brandTheme: BrandTheme) {
  const root = document.documentElement
  root.style.setProperty('--accent', brandTheme.primary)
  root.style.setProperty('--ring', brandTheme.primary)
  root.style.setProperty('--blue', brandTheme.primary)
  root.style.setProperty('--blue-dark', brandTheme.primary)
  root.style.setProperty('--surface', brandTheme.surface)
  root.style.setProperty('--font-brand', brandTheme.font)
  document.body.style.fontFamily = brandTheme.font
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [brandTheme, setBrandThemeState] = useState<BrandTheme>(defaultBrandTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('htech-theme') as Theme | null
    if (stored) {
      setThemeState(stored)
    }
    const storedBrand = localStorage.getItem('htech-brand-theme')
    if (storedBrand) {
      try {
        const parsed = { ...defaultBrandTheme, ...JSON.parse(storedBrand) }
        setBrandThemeState(parsed)
        applyBrandTheme(parsed)
      } catch {
        applyBrandTheme(defaultBrandTheme)
      }
    } else {
      applyBrandTheme(defaultBrandTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('htech-theme', theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setBrandTheme = (newBrandTheme: BrandTheme) => {
    setBrandThemeState(newBrandTheme)
    if (typeof window !== 'undefined') {
      applyBrandTheme(newBrandTheme)
      localStorage.setItem('htech-brand-theme', JSON.stringify(newBrandTheme))
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, brandTheme, setBrandTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
