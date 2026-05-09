'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Locale = 'vi' | 'en'

const translations = {
  vi: {
    // Navigation
    'nav.iphone': 'iPhone',
    'nav.macbook': 'MacBook',
    'nav.gaming': 'PC Gaming',
    'nav.accessories': 'Phụ kiện',
    'nav.deals': 'Khuyến mãi',
    'nav.search': 'Tìm kiếm',
    'nav.cart': 'Giỏ hàng',
    'nav.account': 'Tài khoản',
    'nav.menu': 'Menu',
    'nav.admin': 'Quản trị viên',
    
    // Notification bar
    'notif.tradein': 'Thu cũ đổi mới iPhone 15 Pro — tiết kiệm đến',
    'notif.learnmore': 'Tìm hiểu thêm',
    
    // Hero
    'hero.tagline': 'Đại lý ủy quyền chính hãng',
    'hero.title1': 'iPhone 15 Pro.',
    'hero.title2': 'Titanium đẳng cấp.',
    'hero.desc': 'Trải nghiệm sức mạnh chip A17 Pro với thiết kế titanium siêu nhẹ. Đặt hàng ngay tại HTech Store.',
    'hero.cta.buy': 'Mua ngay',
    'hero.cta.compare': 'So sánh model',
    'hero.spec.chip': 'Chip A17 Pro',
    'hero.spec.camera': 'Camera 48MP',
    'hero.spec.display': 'ProMotion 120Hz',
    
    // Categories
    'cat.title': 'Danh mục sản phẩm',
    'cat.subtitle': 'Khám phá bộ sưu tập',
    'cat.iphone': 'iPhone',
    'cat.iphone.desc': 'Dòng điện thoại cao cấp',
    'cat.macbook': 'MacBook',
    'cat.macbook.desc': 'Laptop chuyên nghiệp',
    'cat.gaming': 'PC Gaming',
    'cat.gaming.desc': 'Máy tính chơi game',
    'cat.accessories': 'Phụ kiện',
    'cat.accessories.desc': 'Phụ kiện chính hãng',
    'cat.viewall': 'Xem tất cả',
    
    // Products
    'products.featured': 'Sản phẩm nổi bật',
    'products.title': 'Dành riêng cho bạn.',
    'products.all': 'Tất cả',
    'products.quickadd': 'Thêm nhanh',
    'products.added': 'Đã thêm!',
    'products.only': 'Chỉ còn',
    'products.left': 'sản phẩm',
    'products.viewall': 'Xem tất cả sản phẩm',
    'products.new': 'Mới',
    'products.hot': 'Hot',
    'products.sale': 'Giảm giá',
    'products.reviews': 'đánh giá',
    
    // Product details
    'product.addtocart': 'Thêm vào giỏ',
    'product.buynow': 'Mua ngay',
    'product.specs': 'Thông số kỹ thuật',
    'product.description': 'Mô tả sản phẩm',
    'product.related': 'Sản phẩm liên quan',
    'product.color': 'Màu sắc',
    'product.storage': 'Dung lượng',
    'product.quantity': 'Số lượng',
    'product.instock': 'Còn hàng',
    'product.outstock': 'Hết hàng',
    'product.warranty': 'Bảo hành chính hãng',
    'product.shipping': 'Giao hàng miễn phí',
    'product.return': 'Đổi trả trong 30 ngày',
    
    // Cart
    'cart.title': 'Giỏ hàng của bạn',
    'cart.empty': 'Giỏ hàng trống',
    'cart.emptydesc': 'Bạn chưa có sản phẩm nào trong giỏ hàng.',
    'cart.continue': 'Tiếp tục mua sắm',
    'cart.subtotal': 'Tạm tính',
    'cart.shipping': 'Phí vận chuyển',
    'cart.free': 'Miễn phí',
    'cart.total': 'Tổng cộng',
    'cart.checkout': 'Thanh toán',
    'cart.remove': 'Xóa',
    'cart.items': 'sản phẩm',
    
    // Trust signals
    'trust.shipping': 'Miễn phí vận chuyển',
    'trust.shipping.desc': 'Đơn hàng từ 2 triệu',
    'trust.warranty': 'Bảo hành chính hãng',
    'trust.warranty.desc': '12 tháng toàn quốc',
    'trust.support': 'Hỗ trợ 24/7',
    'trust.support.desc': 'Tư vấn nhiệt tình',
    'trust.return': 'Đổi trả dễ dàng',
    'trust.return.desc': '30 ngày hoàn tiền',
    
    // Footer
    'footer.newsletter': 'Đăng ký nhận tin',
    'footer.newsletter.desc': 'Nhận thông tin khuyến mãi và sản phẩm mới nhất',
    'footer.email': 'Nhập email của bạn',
    'footer.subscribe': 'Đăng ký',
    'footer.products': 'Sản phẩm',
    'footer.support': 'Hỗ trợ',
    'footer.company': 'Công ty',
    'footer.rights': 'Đã đăng ký bản quyền',
    'footer.contact': 'Liên hệ',
    'footer.about': 'Về chúng tôi',
    'footer.careers': 'Tuyển dụng',
    'footer.policy': 'Chính sách',
    
    // AI Concierge
    'ai.title': 'Trợ lý AI HTech',
    'ai.welcome': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'ai.placeholder': 'Nhập tin nhắn...',
    'ai.suggestions': 'Gợi ý nhanh',
    'ai.compare': 'So sánh iPhone',
    'ai.recommend': 'Tư vấn laptop',
    'ai.promo': 'Khuyến mãi',
    
    // Search
    'search.title': 'Tìm kiếm sản phẩm',
    'search.placeholder': 'Nhập tên sản phẩm...',
    'search.recent': 'Tìm kiếm gần đây',
    'search.popular': 'Tìm kiếm phổ biến',
    'search.noresults': 'Không tìm thấy kết quả',
    'search.results': 'Kết quả tìm kiếm',
    
    // Filters
    'filter.title': 'Bộ lọc',
    'filter.category': 'Danh mục',
    'filter.price': 'Giá',
    'filter.brand': 'Thương hiệu',
    'filter.rating': 'Đánh giá',
    'filter.sort': 'Sắp xếp',
    'filter.sort.newest': 'Mới nhất',
    'filter.sort.pricelow': 'Giá thấp đến cao',
    'filter.sort.pricehigh': 'Giá cao đến thấp',
    'filter.sort.popular': 'Phổ biến nhất',
    'filter.clear': 'Xóa bộ lọc',
    'filter.apply': 'Áp dụng',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Có lỗi xảy ra',
    'common.retry': 'Thử lại',
    'common.cancel': 'Hủy',
    'common.save': 'Lưu',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.add': 'Thêm',
    'common.close': 'Đóng',
    'common.back': 'Quay lại',
    'common.next': 'Tiếp theo',
    'common.previous': 'Trước đó',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.sort': 'Sắp xếp',
    'common.view': 'Xem',
    'common.download': 'Tải xuống',
    'common.upload': 'Tải lên',
    'common.export': 'Xuất',
    'common.import': 'Nhập',
    'common.confirm': 'Xác nhận',
    'common.yes': 'Có',
    'common.no': 'Không',
    
    // Theme
    'theme.light': 'Sáng',
    'theme.dark': 'Tối',
    'theme.system': 'Hệ thống',
    
    // Language
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
  },
  en: {
    // Navigation
    'nav.iphone': 'iPhone',
    'nav.macbook': 'MacBook',
    'nav.gaming': 'PC Gaming',
    'nav.accessories': 'Accessories',
    'nav.deals': 'Deals',
    'nav.search': 'Search',
    'nav.cart': 'Cart',
    'nav.account': 'Account',
    'nav.menu': 'Menu',
    'nav.admin': 'Admin Dashboard',
    
    // Notification bar
    'notif.tradein': 'Trade-in iPhone 15 Pro — save up to',
    'notif.learnmore': 'Learn more',
    
    // Hero
    'hero.tagline': 'Authorized Retailer',
    'hero.title1': 'iPhone 15 Pro.',
    'hero.title2': 'Premium Titanium.',
    'hero.desc': 'Experience the power of A17 Pro chip with ultra-lightweight titanium design. Order now at HTech Store.',
    'hero.cta.buy': 'Buy Now',
    'hero.cta.compare': 'Compare Models',
    'hero.spec.chip': 'A17 Pro Chip',
    'hero.spec.camera': '48MP Camera',
    'hero.spec.display': 'ProMotion 120Hz',
    
    // Categories
    'cat.title': 'Product Categories',
    'cat.subtitle': 'Explore our collection',
    'cat.iphone': 'iPhone',
    'cat.iphone.desc': 'Premium smartphones',
    'cat.macbook': 'MacBook',
    'cat.macbook.desc': 'Professional laptops',
    'cat.gaming': 'PC Gaming',
    'cat.gaming.desc': 'Gaming computers',
    'cat.accessories': 'Accessories',
    'cat.accessories.desc': 'Official accessories',
    'cat.viewall': 'View all',
    
    // Products
    'products.featured': 'Featured Products',
    'products.title': 'Top picks for you.',
    'products.all': 'All',
    'products.quickadd': 'Quick Add',
    'products.added': 'Added!',
    'products.only': 'Only',
    'products.left': 'left',
    'products.viewall': 'View all products',
    'products.new': 'New',
    'products.hot': 'Hot',
    'products.sale': 'Sale',
    'products.reviews': 'reviews',
    
    // Product details
    'product.addtocart': 'Add to Cart',
    'product.buynow': 'Buy Now',
    'product.specs': 'Specifications',
    'product.description': 'Description',
    'product.related': 'Related Products',
    'product.color': 'Color',
    'product.storage': 'Storage',
    'product.quantity': 'Quantity',
    'product.instock': 'In Stock',
    'product.outstock': 'Out of Stock',
    'product.warranty': 'Official Warranty',
    'product.shipping': 'Free Shipping',
    'product.return': '30-Day Returns',
    
    // Cart
    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptydesc': 'You have no items in your cart.',
    'cart.continue': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.free': 'Free',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',
    'cart.items': 'items',
    
    // Trust signals
    'trust.shipping': 'Free Shipping',
    'trust.shipping.desc': 'Orders over 2 million',
    'trust.warranty': 'Official Warranty',
    'trust.warranty.desc': '12 months nationwide',
    'trust.support': '24/7 Support',
    'trust.support.desc': 'Dedicated assistance',
    'trust.return': 'Easy Returns',
    'trust.return.desc': '30-day refund',
    
    // Footer
    'footer.newsletter': 'Newsletter',
    'footer.newsletter.desc': 'Get the latest deals and new arrivals',
    'footer.email': 'Enter your email',
    'footer.subscribe': 'Subscribe',
    'footer.products': 'Products',
    'footer.support': 'Support',
    'footer.company': 'Company',
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact',
    'footer.about': 'About Us',
    'footer.careers': 'Careers',
    'footer.policy': 'Policies',
    
    // AI Concierge
    'ai.title': 'HTech AI Assistant',
    'ai.welcome': 'Hello! How can I help you today?',
    'ai.placeholder': 'Type a message...',
    'ai.suggestions': 'Quick suggestions',
    'ai.compare': 'Compare iPhones',
    'ai.recommend': 'Laptop advice',
    'ai.promo': 'Promotions',
    
    // Search
    'search.title': 'Search Products',
    'search.placeholder': 'Search for products...',
    'search.recent': 'Recent searches',
    'search.popular': 'Popular searches',
    'search.noresults': 'No results found',
    'search.results': 'Search results',
    
    // Filters
    'filter.title': 'Filters',
    'filter.category': 'Category',
    'filter.price': 'Price',
    'filter.brand': 'Brand',
    'filter.rating': 'Rating',
    'filter.sort': 'Sort by',
    'filter.sort.newest': 'Newest',
    'filter.sort.pricelow': 'Price: Low to High',
    'filter.sort.pricehigh': 'Price: High to Low',
    'filter.sort.popular': 'Most Popular',
    'filter.clear': 'Clear filters',
    'filter.apply': 'Apply',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Language
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
  },
} as const

type TranslationKey = keyof typeof translations.vi

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi')

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('htech-locale', newLocale)
    }
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale][key] || key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function useTranslation() {
  return useI18n()
}
