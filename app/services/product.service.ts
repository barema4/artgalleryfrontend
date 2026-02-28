import type {
  Product,
  ProductVariant,
  ProductImage,
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
  CreateProductVariantData,
  UpdateProductVariantData,
  CreateProductImageData,
  ProductListParams,
  ProductListResponse,
} from '~/types/product'
import { useAuthStore } from '~/stores/auth'

const API_BASE = '/api/v1'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('art-gallery-auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.accessToken || null
    }
  } catch {
  }

  const authStore = useAuthStore()
  return authStore.accessToken
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export function useProductService() {
  return {
    getProducts: async (params?: ProductListParams): Promise<ProductListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.type) query.set('type', params.type)
      if (params?.artworkId) query.set('artworkId', params.artworkId)
      if (params?.active !== undefined) query.set('active', String(params.active))
      if (params?.inStock !== undefined) query.set('inStock', String(params.inStock))
      if (params?.search) query.set('search', params.search)
      if (params?.minPrice) query.set('minPrice', String(params.minPrice))
      if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice))
      if (params?.sortBy) query.set('sortBy', params.sortBy)
      const queryString = query.toString()

      return $fetch<ProductListResponse>(`${API_BASE}/products${queryString ? `?${queryString}` : ''}`)
    },

    getProductBySlug: async (slug: string): Promise<Product> => {
      return $fetch<Product>(`${API_BASE}/products/slug/${slug}`)
    },

    getProductById: async (id: string): Promise<Product> => {
      return $fetch<Product>(`${API_BASE}/products/${id}`, {
        headers: getHeaders(),
      })
    },

    createProduct: async (data: CreateProductData): Promise<Product> => {
      return $fetch<Product>(`${API_BASE}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
      return $fetch<Product>(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteProduct: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    updateStock: async (id: string, data: UpdateStockData): Promise<Product> => {
      return $fetch<Product>(`${API_BASE}/products/${id}/stock`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    createVariant: async (productId: string, data: CreateProductVariantData): Promise<ProductVariant> => {
      return $fetch<ProductVariant>(`${API_BASE}/products/${productId}/variants`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateVariant: async (productId: string, variantId: string, data: UpdateProductVariantData): Promise<ProductVariant> => {
      return $fetch<ProductVariant>(`${API_BASE}/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteVariant: async (productId: string, variantId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    addImage: async (productId: string, data: CreateProductImageData): Promise<ProductImage> => {
      return $fetch<ProductImage>(`${API_BASE}/products/${productId}/images`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    removeImage: async (productId: string, imageId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    setPrimaryImage: async (productId: string, imageId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/products/${productId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    },
  }
}
