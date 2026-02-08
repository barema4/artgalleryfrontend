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

export function useUserService() {
  const api = useApi()

  return {
    // Current user endpoints
    getMe: () => api.get<User>('/users/me'),

    getProfile: () => api.get<UserProfile>('/users/me/profile'),

    updateProfile: (data: UpdateProfileData) =>
      api.put<UserProfile>('/users/me/profile', data),

    getPreferences: () => api.get<UserPreferences>('/users/me/preferences'),

    updatePreferences: (data: UpdatePreferencesData) =>
      api.put<UserPreferences>('/users/me/preferences', data),

    // Admin endpoints
    getUsers: (params?: UserListParams) => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.role) query.set('role', params.role)
      if (params?.status) query.set('status', params.status)
      const queryString = query.toString()
      return api.get<UserListResponse>(`/users${queryString ? `?${queryString}` : ''}`)
    },

    getUserById: (id: string) => api.get<User>(`/users/${id}`),

    updateUserStatus: (id: string, data: UpdateUserStatusData) =>
      api.put<User>(`/users/${id}/status`, data),

    deleteUser: (id: string) => api.delete<void>(`/users/${id}`),
  }
}