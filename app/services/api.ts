import type { FetchOptions } from 'ofetch'
import { useAuthStore } from '~/stores/auth'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const API_BASE = '/api/v1'

export function useApi() {
  const authStore = useAuthStore()

  async function request<T>(
    endpoint: string,
    options: FetchOptions & { method?: HttpMethod } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const url = `${API_BASE}${endpoint}`
    const fetchOptions = {
      ...options,
      headers,
      method: options.method as HttpMethod,
    }

    try {
      const response = await $fetch<T>(url, fetchOptions)
      return response
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err?.response?.status === 401 && authStore.refreshToken) {
        const refreshed = await authStore.refreshAccessToken()
        if (refreshed) {
          headers['Authorization'] = `Bearer ${authStore.accessToken}`
          return $fetch<T>(url, { ...fetchOptions, headers })
        }
      }
      throw error
    }
  }

  return {
    get: <T>(endpoint: string, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'GET' as HttpMethod }),

    post: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'POST' as HttpMethod, body }),

    put: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'PUT' as HttpMethod, body }),

    patch: <T>(endpoint: string, body?: any, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'PATCH' as HttpMethod, body }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
      request<T>(endpoint, { ...options, method: 'DELETE' as HttpMethod }),
  }
}
