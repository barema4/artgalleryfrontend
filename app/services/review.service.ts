import type {
  Review,
  CreateReviewData,
  UpdateReviewData,
  ReviewStats,
  ReviewListParams,
  ReviewListResponse,
} from '~/types/review'
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

export function useReviewService() {
  return {
    getArtworkReviews: async (artworkId: string, params?: ReviewListParams): Promise<ReviewListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.sortBy) query.set('sortBy', params.sortBy)
      if (params?.minRating) query.set('minRating', String(params.minRating))
      const queryString = query.toString()

      return $fetch<ReviewListResponse>(`${API_BASE}/artworks/${artworkId}/reviews${queryString ? `?${queryString}` : ''}`)
    },

    getArtworkReviewStats: async (artworkId: string): Promise<ReviewStats> => {
      return $fetch<ReviewStats>(`${API_BASE}/artworks/${artworkId}/reviews/stats`)
    },

    createReview: async (artworkId: string, data: CreateReviewData): Promise<Review> => {
      return $fetch<Review>(`${API_BASE}/artworks/${artworkId}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    getMyReviews: async (params?: ReviewListParams): Promise<ReviewListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.sortBy) query.set('sortBy', params.sortBy)
      const queryString = query.toString()

      return $fetch<ReviewListResponse>(`${API_BASE}/reviews/me${queryString ? `?${queryString}` : ''}`, {
        headers: getHeaders(),
      })
    },

    updateReview: async (id: string, data: UpdateReviewData): Promise<Review> => {
      return $fetch<Review>(`${API_BASE}/reviews/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteReview: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    markHelpful: async (id: string): Promise<Review> => {
      return $fetch<Review>(`${API_BASE}/reviews/${id}/helpful`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    adminDeleteReview: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/reviews/${id}/admin`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}
