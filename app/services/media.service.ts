import type {
  MediaFile,
  MediaListParams,
  MediaListResponse,
  DeleteMultipleResponse,
} from '~/types/media'
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

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export function useMediaService() {
  return {
    // Upload endpoints
    uploadFile: async (file: File, folder?: string, alt?: string): Promise<MediaFile> => {
      const formData = new FormData()
      formData.append('file', file)
      if (folder) formData.append('folder', folder)
      if (alt) formData.append('alt', alt)

      return $fetch<MediaFile>(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
    },

    uploadMultiple: async (files: File[], folder?: string): Promise<MediaFile[]> => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      if (folder) formData.append('folder', folder)

      return $fetch<MediaFile[]>(`${API_BASE}/media/upload/multiple`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
    },

    // Retrieval endpoints
    getMediaFiles: async (params?: MediaListParams): Promise<MediaListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.folder) query.set('folder', params.folder)
      if (params?.mimeType) query.set('mimeType', params.mimeType)
      const queryString = query.toString()

      return $fetch<MediaListResponse>(`${API_BASE}/media${queryString ? `?${queryString}` : ''}`, {
        headers: getHeaders(),
      })
    },

    getMediaById: async (id: string): Promise<MediaFile> => {
      return $fetch<MediaFile>(`${API_BASE}/media/${id}`, {
        headers: getHeaders(),
      })
    },

    getMediaByFolder: async (folder: string): Promise<MediaFile[]> => {
      return $fetch<MediaFile[]>(`${API_BASE}/media/folder/${folder}`, {
        headers: getHeaders(),
      })
    },

    // Delete endpoints
    deleteMedia: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/media/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    deleteMultiple: async (ids: string[]): Promise<DeleteMultipleResponse> => {
      return $fetch<DeleteMultipleResponse>(`${API_BASE}/media/bulk`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: { ids },
      })
    },
  }
}
