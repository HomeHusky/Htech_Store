'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Product = {
  id: string
  slug?: string
  name: string
  subtitle: string
  price: number
  priceFormatted: string
  originalPrice?: number
  originalPriceFormatted?: string
  image: string
  badge?: 'Mới' | 'Hot' | 'Sale' | 'New'
  rating: number
  reviews: number
  stock: number
  colors: string[]
  category: string
  brand: string
  specs?: Record<string, string>
  description?: string
}

export type CartItem = {
  product: Product
  quantity: number
  selectedColor: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, selectedColor?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  totalPriceFormatted: string
}

const CartContext = createContext<CartContextType | null>(null)

export const allProducts: Product[] = []

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫'
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((product: Product, selectedColor = 0) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1, selectedColor }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalPriceFormatted = formatPrice(totalPrice)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        totalPriceFormatted,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
