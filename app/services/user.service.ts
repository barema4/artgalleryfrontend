import type {
  User,
  UserProfile,
  UserPreferences,
  UpdateProfileData,
  UpdatePreferencesData,
  UpdateUserStatusData,
  UserListParams,
  UserListResponse,
} from '~/types/user'
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

  // Fallback to store if localStorage fails
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

export function useUserService() {

  return {
    // Current user endpoints
    getMe: async (): Promise<User> => {
      return $fetch<User>(`${API_BASE}/users/me`, {
        headers: getHeaders(),
      })
    },

    getProfile: async (): Promise<UserProfile> => {
      return $fetch<UserProfile>(`${API_BASE}/users/me/profile`, {
        headers: getHeaders(),
      })
    },

    updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
      return $fetch<UserProfile>(`${API_BASE}/users/me/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    getPreferences: async (): Promise<UserPreferences> => {
      return $fetch<UserPreferences>(`${API_BASE}/users/me/preferences`, {
        headers: getHeaders(),
      })
    },

    updatePreferences: async (data: UpdatePreferencesData): Promise<UserPreferences> => {
      return $fetch<UserPreferences>(`${API_BASE}/users/me/preferences`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    // Admin endpoints
    getUsers: async (params?: UserListParams): Promise<UserListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.role) query.set('role', params.role)
      if (params?.status) query.set('status', params.status)
      const queryString = query.toString()

      return $fetch<UserListResponse>(`${API_BASE}/users${queryString ? `?${queryString}` : ''}`, {
        headers: getHeaders(),
      })
    },

    getUserById: async (id: string): Promise<User> => {
      return $fetch<User>(`${API_BASE}/users/${id}`, {
        headers: getHeaders(),
      })
    },

    updateUserStatus: async (id: string, data: UpdateUserStatusData): Promise<User> => {
      return $fetch<User>(`${API_BASE}/users/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteUser: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}