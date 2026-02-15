import type {
  Notification,
  CreateNotificationData,
  CreateBulkNotificationData,
  NotificationListParams,
  NotificationListResponse,
  NotificationCount,
  CountResponse,
} from '~/types/notification'
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

export function useNotificationService() {
  return {
    // User endpoints
    getNotifications: async (params?: NotificationListParams): Promise<NotificationListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.type) query.set('type', params.type)
      if (params?.read !== undefined) query.set('read', String(params.read))
      const queryString = query.toString()

      return $fetch<NotificationListResponse>(`${API_BASE}/notifications${queryString ? `?${queryString}` : ''}`, {
        headers: getHeaders(),
      })
    },

    getNotificationCount: async (): Promise<NotificationCount> => {
      return $fetch<NotificationCount>(`${API_BASE}/notifications/count`, {
        headers: getHeaders(),
      })
    },

    getNotificationById: async (id: string): Promise<Notification> => {
      return $fetch<Notification>(`${API_BASE}/notifications/${id}`, {
        headers: getHeaders(),
      })
    },

    markAsRead: async (id: string): Promise<Notification> => {
      return $fetch<Notification>(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    },

    markAllAsRead: async (): Promise<CountResponse> => {
      return $fetch<CountResponse>(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders(),
      })
    },

    markMultipleAsRead: async (ids: string[]): Promise<CountResponse> => {
      return $fetch<CountResponse>(`${API_BASE}/notifications/read-multiple`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { ids },
      })
    },

    deleteNotification: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    deleteAllNotifications: async (): Promise<CountResponse> => {
      return $fetch<CountResponse>(`${API_BASE}/notifications`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    deleteReadNotifications: async (): Promise<CountResponse> => {
      return $fetch<CountResponse>(`${API_BASE}/notifications/read`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    // Admin endpoints
    createNotification: async (data: CreateNotificationData): Promise<Notification> => {
      return $fetch<Notification>(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    createBulkNotifications: async (data: CreateBulkNotificationData): Promise<CountResponse> => {
      return $fetch<CountResponse>(`${API_BASE}/notifications/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },
  }
}
