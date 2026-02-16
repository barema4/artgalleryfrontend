import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryListParams,
  CategoryListResponse,
  CategoryTreeResponse,
} from '~/types/category'
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

export function useCategoryService() {
  return {
    getCategories: async (params?: CategoryListParams): Promise<CategoryListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.parentId !== undefined) query.set('parentId', params.parentId === null ? 'null' : params.parentId)
      if (params?.search) query.set('search', params.search)
      const queryString = query.toString()

      return $fetch<CategoryListResponse>(`${API_BASE}/categories${queryString ? `?${queryString}` : ''}`)
    },

    getCategoryTree: async (): Promise<CategoryTreeResponse> => {
      return $fetch<CategoryTreeResponse>(`${API_BASE}/categories/tree`)
    },

    getCategoryBySlug: async (slug: string): Promise<Category> => {
      return $fetch<Category>(`${API_BASE}/categories/${slug}`)
    },

    createCategory: async (data: CreateCategoryData): Promise<Category> => {
      return $fetch<Category>(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
      return $fetch<Category>(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteCategory: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}
