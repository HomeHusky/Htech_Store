export type Category = "laptop" | "pc" | "smartphone" | "tablet"
export type Condition = "Mới 100%" | "Likenew 99%" | "Cũ giá rẻ"

export type LaptopSpecs = {
  cpu: string
  ram: string
  gpu: string
  screen: string
  weight: string
}

export type PcSpecs = {
  cpu: string
  ram: string
  gpu: string
  storage: string
}

export type PhoneSpecs = {
  chipset: string
  screen: string
  battery: string
  camera: string
  os: "iOS" | "Android"
}

export type TabletSpecs = {
  chipset: string
  screen: string
  battery: string
  os: "iPadOS" | "Android" | "Windows"
}

export type ProductSpecs =
  | { category: "laptop"; specs: LaptopSpecs }
  | { category: "pc"; specs: PcSpecs }
  | { category: "smartphone"; specs: PhoneSpecs }
  | { category: "tablet"; specs: TabletSpecs }

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  image: string
  price: number
  oldPrice?: number
  condition: Condition
  inStock: boolean
  hub?: "gaming" | "office" | "mobile"
  badge?: string
} & ProductSpecs

export const CATEGORY_LABEL: Record<Category, string> = {
  laptop: "Laptop",
  pc: "PC / Desktop",
  smartphone: "Smartphone",
  tablet: "Tablet",
}

export const CATEGORY_SUBMENU: Record<Category, string[]> = {
  laptop: ["Gaming", "Office", "Workstation", "MacBook"],
  pc: ["Gaming Rig", "Workstation", "All-in-One"],
  smartphone: ["iPhone", "Samsung", "Xiaomi", "Android"],
  tablet: ["iPad", "Galaxy Tab", "Surface"],
}

// Brand partners — sẽ được cấu hình trong Admin → CMS → Brand Logos.
export const BRANDS: readonly string[] = []

export function formatVND(value: number) {
  return value.toLocaleString("vi-VN") + "₫"
}

// Sản phẩm sẽ được nhập từ Admin → Kho & Danh mục.
export const PRODUCTS: Product[] = []

export function getProductsByCategory(category: Category) {
  return PRODUCTS.filter((p) => p.category === category)
}

export function getProductsByHub(hub: "gaming" | "office" | "mobile") {
  return PRODUCTS.filter((p) => p.hub === hub)
}
