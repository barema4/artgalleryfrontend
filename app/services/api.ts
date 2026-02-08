import type { FetchOptions } from 'ofetch'
import { useAuthStore } from '~/stores/auth'

const API_BASE = '/api/v1'

export function useApi() {
  const authStore = useAuthStore()

  async function request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add auth token if available
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const url = `${API_BASE}${endpoint}`

    try {
      const response = await $fetch<T>(url, {
        ...options,
        headers,
      })
      return response
    } catch (error: any) {
      // Handle 401 - try to refresh token
      if (error?.response?.status === 401 && authStore.refreshToken) {
        const refreshed = await authStore.refreshAccessToken()
        if (refreshed) {
          // Retry request with new token
          headers['Authorization'] = `Bearer ${authStore.accessToken}`
          return $fetch<T>(url, {
            ...options,
            headers,
          })
        }
      }
      throw error
    }
  }

  return {
    get: <T>(endpoint: string, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'PUT', body }),

    patch: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'PATCH', body }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  }
}
