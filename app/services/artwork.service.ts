import type {
  Artwork,
  ArtworkStats,
  ArtworkImage,
  CreateArtworkData,
  UpdateArtworkData,
  CreateArtworkImageData,
  ArtworkListParams,
  ArtworkListResponse,
  ArtworkStatus,
} from '~/types/artwork'
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

function getHeaders() {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export function useArtworkService() {
  return {
    getArtworks: async (params?: ArtworkListParams): Promise<ArtworkListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.artistId) query.set('artistId', params.artistId)
      if (params?.categoryId) query.set('categoryId', params.categoryId)
      if (params?.status) query.set('status', params.status)
      if (params?.medium) query.set('medium', params.medium)
      if (params?.featured !== undefined) query.set('featured', String(params.featured))
      if (params?.search) query.set('search', params.search)
      if (params?.minPrice) query.set('minPrice', String(params.minPrice))
      if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice))
      if (params?.sortBy) query.set('sortBy', params.sortBy)
      if (params?.tags?.length) query.set('tags', params.tags.join(','))
      const queryString = query.toString()

      return $fetch<ArtworkListResponse>(`${API_BASE}/artworks${queryString ? `?${queryString}` : ''}`)
    },

    getArtworkBySlug: async (slug: string): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks/${slug}`)
    },

    getArtworkStats: async (id: string): Promise<ArtworkStats> => {
      return $fetch<ArtworkStats>(`${API_BASE}/artworks/${id}/stats`)
    },

    createArtwork: async (data: CreateArtworkData): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateArtwork: async (id: string, data: UpdateArtworkData): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteArtwork: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/artworks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    publishArtwork: async (id: string): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks/${id}/publish`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    updateArtworkStatus: async (id: string, status: ArtworkStatus): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { status },
      })
    },

    addArtworkImage: async (artworkId: string, data: CreateArtworkImageData): Promise<ArtworkImage> => {
      return $fetch<ArtworkImage>(`${API_BASE}/artworks/${artworkId}/images`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    removeArtworkImage: async (artworkId: string, imageId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/artworks/${artworkId}/images/${imageId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    setPrimaryImage: async (artworkId: string, imageId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/artworks/${artworkId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    },

    setArtworkFeatured: async (id: string, featured: boolean): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks/${id}/featured`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { featured },
      })
    },

    adminUpdateStatus: async (id: string, status: ArtworkStatus): Promise<Artwork> => {
      return $fetch<Artwork>(`${API_BASE}/artworks/${id}/admin-status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { status },
      })
    },
  }
}