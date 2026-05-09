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

export const allProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    subtitle: '256GB · Natural Titanium',
    price: 29990000,
    priceFormatted: '29,990,000₫',
    image: '/images/iphone-15-pro.jpg',
    badge: 'New',
    rating: 4.9,
    reviews: 1284,
    stock: 8,
    colors: ['#E5E4E2', '#3D3C3C', '#1C1C1C', '#4A7C59'],
    category: 'iPhone',
    brand: 'Apple',
    specs: {
      'Màn hình': '6.1 inch Super Retina XDR',
      'Chip': 'A17 Pro',
      'RAM': '8GB',
      'Camera': '48MP + 12MP + 12MP',
      'Pin': '3274mAh',
      'Hệ điều hành': 'iOS 17',
    },
    description: 'iPhone 15 Pro với chip A17 Pro mạnh mẽ nhất, khung titanium siêu nhẹ và camera chuyên nghiệp. Thiết kế đỉnh cao của Apple.',
  },
  {
    id: '2',
    name: 'MacBook Air 15"',
    subtitle: 'M3 · 16GB · 512GB',
    price: 38990000,
    priceFormatted: '38,990,000₫',
    originalPrice: 41990000,
    originalPriceFormatted: '41,990,000₫',
    image: '/images/macbook-air.jpg',
    badge: 'Hot',
    rating: 4.8,
    reviews: 876,
    stock: 5,
    colors: ['#1C1C1C', '#C0C0C0', '#F5E6C8'],
    category: 'MacBook',
    brand: 'Apple',
    specs: {
      'Màn hình': '15.3 inch Liquid Retina',
      'Chip': 'Apple M3',
      'RAM': '16GB',
      'SSD': '512GB',
      'Pin': '18 giờ',
      'Hệ điều hành': 'macOS Sonoma',
    },
    description: 'MacBook Air 15 inch với chip M3 mạnh mẽ, màn hình rộng rãi và thiết kế siêu mỏng. Lý tưởng cho công việc và giải trí.',
  },
  {
    id: '3',
    name: 'ROG Gaming Laptop',
    subtitle: 'RTX 4070 · 32GB · 1TB',
    price: 52990000,
    priceFormatted: '52,990,000₫',
    image: '/images/gaming-laptop.jpg',
    badge: 'Hot',
    rating: 4.7,
    reviews: 432,
    stock: 3,
    colors: ['#1C1C1C', '#0A0A14'],
    category: 'Gaming',
    brand: 'ASUS',
    specs: {
      'Màn hình': '16 inch QHD 240Hz',
      'CPU': 'Intel Core i9-13900HX',
      'GPU': 'RTX 4070 8GB',
      'RAM': '32GB DDR5',
      'SSD': '1TB NVMe',
      'Hệ điều hành': 'Windows 11',
    },
    description: 'Laptop gaming ROG với RTX 4070, màn hình 240Hz và hệ thống tản nhiệt tiên tiến. Chinh phục mọi tựa game đỉnh cao.',
  },
  {
    id: '4',
    name: 'Ultra 27" Gaming Monitor',
    subtitle: '240Hz · 2K · 1ms',
    price: 12990000,
    priceFormatted: '12,990,000₫',
    originalPrice: 15990000,
    originalPriceFormatted: '15,990,000₫',
    image: '/images/gaming-monitor.jpg',
    badge: 'Sale',
    rating: 4.8,
    reviews: 654,
    stock: 12,
    colors: ['#1C1C1C'],
    category: 'Gaming',
    brand: 'Samsung',
    specs: {
      'Kích thước': '27 inch',
      'Độ phân giải': '2560x1440 (QHD)',
      'Tần số quét': '240Hz',
      'Thời gian phản hồi': '1ms',
      'Tấm nền': 'IPS',
      'HDR': 'HDR400',
    },
    description: 'Màn hình gaming 27 inch với tần số quét 240Hz, độ phản hồi 1ms và công nghệ G-Sync. Trải nghiệm game mượt mà tuyệt đối.',
  },
  {
    id: '5',
    name: 'iPhone 15 Pro Max',
    subtitle: '512GB · Black Titanium',
    price: 39990000,
    priceFormatted: '39,990,000₫',
    image: '/images/iphone-hero.jpg',
    badge: 'New',
    rating: 4.9,
    reviews: 2156,
    stock: 6,
    colors: ['#1C1C1C', '#E5E4E2', '#3D3C3C', '#4A7C59'],
    category: 'iPhone',
    brand: 'Apple',
    specs: {
      'Màn hình': '6.7 inch Super Retina XDR',
      'Chip': 'A17 Pro',
      'RAM': '8GB',
      'Camera': '48MP + 12MP + 12MP',
      'Pin': '4422mAh',
      'Hệ điều hành': 'iOS 17',
    },
    description: 'iPhone 15 Pro Max với màn hình lớn nhất, pin trâu nhất và camera zoom 5x quang học. Đỉnh cao công nghệ di động.',
  },
  {
    id: '6',
    name: 'MacBook Pro 14"',
    subtitle: 'M3 Pro · 18GB · 512GB',
    price: 54990000,
    priceFormatted: '54,990,000₫',
    image: '/images/macbook-pro.jpg',
    badge: 'New',
    rating: 4.9,
    reviews: 567,
    stock: 4,
    colors: ['#1C1C1C', '#C0C0C0'],
    category: 'MacBook',
    brand: 'Apple',
    specs: {
      'Màn hình': '14.2 inch Liquid Retina XDR',
      'Chip': 'Apple M3 Pro',
      'RAM': '18GB',
      'SSD': '512GB',
      'Pin': '17 giờ',
      'Hệ điều hành': 'macOS Sonoma',
    },
    description: 'MacBook Pro 14 inch với chip M3 Pro cho hiệu năng chuyên nghiệp. Màn hình XDR siêu sáng và thiết kế hoàn hảo.',
  },
  {
    id: '7',
    name: 'Gaming PC RTX 4080',
    subtitle: 'i9-14900K · 64GB · 2TB',
    price: 89990000,
    priceFormatted: '89,990,000₫',
    image: '/images/gaming-pc.jpg',
    badge: 'Hot',
    rating: 4.8,
    reviews: 234,
    stock: 2,
    colors: ['#1C1C1C'],
    category: 'Gaming',
    brand: 'HTech Custom',
    specs: {
      'CPU': 'Intel Core i9-14900K',
      'GPU': 'RTX 4080 16GB',
      'RAM': '64GB DDR5',
      'SSD': '2TB NVMe',
      'PSU': '1000W 80+ Gold',
      'Case': 'NZXT H7 Flow',
    },
    description: 'PC Gaming custom build với RTX 4080 và i9-14900K. Cấu hình đỉnh cao cho gaming và streaming chuyên nghiệp.',
  },
  {
    id: '8',
    name: 'AirPods Pro 2',
    subtitle: 'USB-C · Noise Cancelling',
    price: 6490000,
    priceFormatted: '6,490,000₫',
    image: '/images/accessories.jpg',
    rating: 4.8,
    reviews: 3421,
    stock: 25,
    colors: ['#FFFFFF'],
    category: 'Accessories',
    brand: 'Apple',
    specs: {
      'Driver': 'Apple-designed H2 chip',
      'ANC': 'Active Noise Cancellation',
      'Pin tai nghe': '6 giờ',
      'Pin hộp sạc': '30 giờ',
      'Kết nối': 'Bluetooth 5.3',
      'Sạc': 'USB-C, MagSafe',
    },
    description: 'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động và âm thanh spatial. Trải nghiệm âm nhạc đỉnh cao.',
  },
]

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
