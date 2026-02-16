import type {
  Exhibition,
  ExhibitionListParams,
  ExhibitionListResponse,
  ExhibitionStats,
  CreateExhibitionData,
  UpdateExhibitionData,
  UpdateExhibitionStatusData,
  AddArtworkToExhibitionData,
  UpdateArtworkPositionData,
  AddArtistToExhibitionData,
  CreateVirtualTourData,
  CreateVirtualRoomData,
  UpdateVirtualRoomData,
  VirtualTour,
  VirtualRoom,
} from '~/types/exhibition'
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

function buildQueryString(params?: ExhibitionListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.type) query.set('type', params.type)
  if (params.featured !== undefined) query.set('featured', String(params.featured))
  if (params.search) query.set('search', params.search)
  if (params.artistId) query.set('artistId', params.artistId)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.upcoming !== undefined) query.set('upcoming', String(params.upcoming))
  if (params.live !== undefined) query.set('live', String(params.live))
  if (params.past !== undefined) query.set('past', String(params.past))
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function useExhibitionService() {
  return {
    // ============================================
    // Public Endpoints
    // ============================================

    getExhibitions: async (params?: ExhibitionListParams): Promise<ExhibitionListResponse> => {
      return $fetch<ExhibitionListResponse>(`${API_BASE}/exhibitions${buildQueryString(params)}`)
    },

    getExhibitionBySlug: async (slug: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/slug/${slug}`)
    },

    getExhibitionById: async (id: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}`, {
        headers: getHeaders(),
      })
    },

    getExhibitionStats: async (id: string): Promise<ExhibitionStats> => {
      return $fetch<ExhibitionStats>(`${API_BASE}/exhibitions/${id}/stats`)
    },

    getVirtualTour: async (exhibitionId: string): Promise<VirtualTour> => {
      return $fetch<VirtualTour>(`${API_BASE}/exhibitions/${exhibitionId}/virtual-tour`)
    },

    // ============================================
    // Admin Endpoints
    // ============================================

    createExhibition: async (data: CreateExhibitionData): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateExhibition: async (id: string, data: UpdateExhibitionData): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteExhibition: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/exhibitions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    publishExhibition: async (id: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}/publish`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    goLiveExhibition: async (id: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}/go-live`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    endExhibition: async (id: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}/end`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    updateExhibitionStatus: async (id: string, data: UpdateExhibitionStatusData): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    setExhibitionFeatured: async (id: string, featured: boolean): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${id}/featured`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { featured },
      })
    },

    // ============================================
    // Artwork Management (Admin only)
    // ============================================

    addArtworkToExhibition: async (exhibitionId: string, data: AddArtworkToExhibitionData): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${exhibitionId}/artworks`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    removeArtworkFromExhibition: async (exhibitionId: string, artworkId: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${exhibitionId}/artworks/${artworkId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    updateArtworkPosition: async (exhibitionId: string, artworkId: string, data: UpdateArtworkPositionData): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${exhibitionId}/artworks/${artworkId}/position`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    // ============================================
    // Artist Management (Admin only)
    // ============================================

    addArtistToExhibition: async (exhibitionId: string, data: AddArtistToExhibitionData): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${exhibitionId}/artists`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    removeArtistFromExhibition: async (exhibitionId: string, artistId: string): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${exhibitionId}/artists/${artistId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    setArtistAsCurator: async (exhibitionId: string, artistId: string, isCurator: boolean): Promise<Exhibition> => {
      return $fetch<Exhibition>(`${API_BASE}/exhibitions/${exhibitionId}/artists/${artistId}/curator`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { isCurator },
      })
    },

    // ============================================
    // Virtual Tour Management (Admin only)
    // ============================================

    createVirtualTour: async (exhibitionId: string, data: CreateVirtualTourData): Promise<VirtualTour> => {
      return $fetch<VirtualTour>(`${API_BASE}/exhibitions/${exhibitionId}/virtual-tour`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    addVirtualRoom: async (exhibitionId: string, data: CreateVirtualRoomData): Promise<VirtualRoom> => {
      return $fetch<VirtualRoom>(`${API_BASE}/exhibitions/${exhibitionId}/virtual-tour/rooms`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateVirtualRoom: async (exhibitionId: string, roomId: string, data: UpdateVirtualRoomData): Promise<VirtualRoom> => {
      return $fetch<VirtualRoom>(`${API_BASE}/exhibitions/${exhibitionId}/virtual-tour/rooms/${roomId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteVirtualRoom: async (exhibitionId: string, roomId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/exhibitions/${exhibitionId}/virtual-tour/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}
