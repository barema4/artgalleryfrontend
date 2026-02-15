// Product Types

export type ProductType = 'ORIGINAL' | 'PRINT' | 'MERCHANDISE' | 'DIGITAL'

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  price: number
  stock: number
  attributes?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface Product {
  id: string
  artworkId?: string
  type: ProductType
  name: string
  slug: string
  description?: string
  sku: string
  price: number
  compareAtPrice?: number
  currency: string
  stock: number
  lowStockThreshold: number
  isLimitedEdition: boolean
  editionSize?: number
  editionNumber?: number
  weight?: number
  isDigital: boolean
  digitalFileUrl?: string
  active: boolean
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
  images?: ProductImage[]
  artwork?: {
    id: string
    title: string
    slug: string
    artist?: {
      id: string
      displayName: string
      slug: string
    }
  }
}

export interface CreateProductData {
  artworkId?: string
  type: ProductType
  name: string
  slug?: string
  description?: string
  sku: string
  price: number
  compareAtPrice?: number
  currency?: string
  stock?: number
  lowStockThreshold?: number
  isLimitedEdition?: boolean
  editionSize?: number
  weight?: number
  isDigital?: boolean
  digitalFileUrl?: string
  active?: boolean
}

export interface UpdateProductData {
  artworkId?: string | null
  type?: ProductType
  name?: string
  slug?: string
  description?: string
  sku?: string
  price?: number
  compareAtPrice?: number | null
  currency?: string
  stock?: number
  lowStockThreshold?: number
  isLimitedEdition?: boolean
  editionSize?: number | null
  weight?: number | null
  isDigital?: boolean
  digitalFileUrl?: string | null
  active?: boolean
}

export interface UpdateStockData {
  quantity: number
  operation?: 'set' | 'increment' | 'decrement'
}

export interface CreateProductVariantData {
  name: string
  sku: string
  price: number
  stock?: number
  attributes?: Record<string, unknown>
}

export interface UpdateProductVariantData {
  name?: string
  sku?: string
  price?: number
  stock?: number
  attributes?: Record<string, unknown>
}

export interface CreateProductImageData {
  url: string
  altText?: string
  isPrimary?: boolean
  sortOrder?: number
}

export interface ProductListParams {
  page?: number
  limit?: number
  type?: ProductType
  artworkId?: string
  active?: boolean
  inStock?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name'
}

export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ORIGINAL: 'Original',
  PRINT: 'Print',
  MERCHANDISE: 'Merchandise',
  DIGITAL: 'Digital',
}
