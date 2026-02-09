import type {
  Artist,
  ArtistStats,
  CreateArtistData,
  UpdateArtistData,
  ArtistListParams,
  ArtistListResponse,
  FollowArtistGuestData,
} from '~/types/artist'
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
    // Fallback to store
  }

  const authStore = useAuthStore()
  return authStore.accessToken
}

function getHeaders() {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export function useArtistService() {
  return {
    // Public endpoints
    getArtists: async (params?: ArtistListParams): Promise<ArtistListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.verified !== undefined) query.set('verified', String(params.verified))
      if (params?.featured !== undefined) query.set('featured', String(params.featured))
      if (params?.search) query.set('search', params.search)
      if (params?.sortBy) query.set('sortBy', params.sortBy)
      const queryString = query.toString()

      return $fetch<ArtistListResponse>(`${API_BASE}/artists${queryString ? `?${queryString}` : ''}`)
    },

    getArtistBySlug: async (slug: string): Promise<Artist> => {
      return $fetch<Artist>(`${API_BASE}/artists/${slug}`)
    },

    getArtistStats: async (id: string): Promise<ArtistStats> => {
      return $fetch<ArtistStats>(`${API_BASE}/artists/${id}/stats`)
    },

    // Current user artist profile
    getMyArtistProfile: async (): Promise<Artist | null> => {
      return $fetch<Artist | null>(`${API_BASE}/artists/me/profile`, {
        headers: getHeaders(),
      })
    },

    createMyArtistProfile: async (data: CreateArtistData): Promise<Artist> => {
      return $fetch<Artist>(`${API_BASE}/artists/me/profile`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateMyArtistProfile: async (data: UpdateArtistData): Promise<Artist> => {
      return $fetch<Artist>(`${API_BASE}/artists/me/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteMyArtistProfile: async (): Promise<void> => {
      return $fetch<void>(`${API_BASE}/artists/me/profile`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    // Follow/Unfollow
    followArtist: async (id: string): Promise<{ message: string }> => {
      return $fetch<{ message: string }>(`${API_BASE}/artists/${id}/follow`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    unfollowArtist: async (id: string): Promise<{ message: string }> => {
      return $fetch<{ message: string }>(`${API_BASE}/artists/${id}/follow`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    isFollowingArtist: async (id: string): Promise<{ isFollowing: boolean }> => {
      return $fetch<{ isFollowing: boolean }>(`${API_BASE}/artists/${id}/following`, {
        headers: getHeaders(),
      })
    },

    followArtistAsGuest: async (id: string, data: FollowArtistGuestData): Promise<{ message: string }> => {
      return $fetch<{ message: string }>(`${API_BASE}/artists/${id}/follow/guest`, {
        method: 'POST',
        body: data,
      })
    },

    // Admin endpoints
    verifyArtist: async (id: string): Promise<Artist> => {
      return $fetch<Artist>(`${API_BASE}/artists/${id}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    },

    unverifyArtist: async (id: string): Promise<Artist> => {
      return $fetch<Artist>(`${API_BASE}/artists/${id}/verify`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    setArtistFeatured: async (id: string, featured: boolean): Promise<Artist> => {
      return $fetch<Artist>(`${API_BASE}/artists/${id}/featured`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { featured },
      })
    },

    getArtistFollowers: async (id: string, page = 1, limit = 20) => {
      return $fetch(`${API_BASE}/artists/${id}/followers?page=${page}&limit=${limit}`, {
        headers: getHeaders(),
      })
    },
  }
}