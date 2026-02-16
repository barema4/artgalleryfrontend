import type {
  Tag,
  CreateTagData,
  UpdateTagData,
  TagListParams,
  TagListResponse,
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

export function useTagService() {
  return {
    getTags: async (params?: TagListParams): Promise<TagListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.search) query.set('search', params.search)
      const queryString = query.toString()

      return $fetch<TagListResponse>(`${API_BASE}/tags${queryString ? `?${queryString}` : ''}`)
    },

    getPopularTags: async (limit?: number): Promise<Tag[]> => {
      const query = limit ? `?limit=${limit}` : ''
      return $fetch<Tag[]>(`${API_BASE}/tags/popular${query}`)
    },

    getTagBySlug: async (slug: string): Promise<Tag> => {
      return $fetch<Tag>(`${API_BASE}/tags/${slug}`)
    },

    createTag: async (data: CreateTagData): Promise<Tag> => {
      return $fetch<Tag>(`${API_BASE}/tags`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateTag: async (id: string, data: UpdateTagData): Promise<Tag> => {
      return $fetch<Tag>(`${API_BASE}/tags/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteTag: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/tags/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}
