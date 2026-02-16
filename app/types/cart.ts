// ============================================
// Cart Item Types
// ============================================

export interface CartItemProductImage {
  url: string
  altText?: string
}

export interface CartItemProduct {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  compareAtPrice?: number
  currency: string
  stock: number
  isDigital: boolean
  isLimitedEdition: boolean
  weight?: number
  primaryImage?: CartItemProductImage
}

export interface CartItemVariant {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  attributes?: Record<string, unknown>
}

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  lineTotal: number
  currency: string
  inStock: boolean
  availableStock: number
  product: CartItemProduct
  variant?: CartItemVariant
  createdAt: string
  updatedAt: string
}

// ============================================
// Cart Summary Types
// ============================================

export interface CartSummary {
  subtotal: number
  itemCount: number
  uniqueItemCount: number
  currency: string
  totalWeight: number
  allItemsInStock: boolean
  hasDigitalItems: boolean
  hasPhysicalItems: boolean
}

// ============================================
// Cart Types
// ============================================

export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  summary: CartSummary
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// DTOs for Cart Operations
// ============================================

export interface AddToCartData {
  productId: string
  variantId?: string
  quantity?: number
}

export interface UpdateCartItemData {
  quantity: number
}

export interface MergeCartData {
  sessionId: string
}

// ============================================
// Validation Types
// ============================================

export interface CartValidationIssue {
  itemId: string
  productId: string
  issue: string
  availableStock: number
}

export interface CartValidationResult {
  valid: boolean
  issues: CartValidationIssue[]
}
