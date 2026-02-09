import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const router = useRouter()

  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  // Global fetch interceptor for handling 401 errors
  const originalFetch = globalThis.$fetch

  globalThis.$fetch = async (request: any, options: any = {}) => {
    try {
      return await originalFetch(request, options)
    } catch (error: any) {
      const status = error?.response?.status || error?.status || error?.statusCode

      // Handle 401 Unauthorized
      if (status === 401 && authStore.isAuthenticated) {
        // Check if this is a login/register/refresh request - don't intercept those
        const url = typeof request === 'string' ? request : request?.url || ''
        if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
          throw error
        }

        // Try to refresh the token
        if (authStore.refreshToken && !isRefreshing) {
          isRefreshing = true
          refreshPromise = authStore.refreshAccessToken()

          try {
            const refreshed = await refreshPromise
            isRefreshing = false
            refreshPromise = null

            if (refreshed) {
              // Retry the original request with new token
              const newOptions = {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${authStore.accessToken}`,
                },
              }
              return await originalFetch(request, newOptions)
            } else {
              // Refresh failed - logout user
              await handleLogout()
              throw error
            }
          } catch {
            isRefreshing = false
            refreshPromise = null
            await handleLogout()
            throw error
          }
        } else if (isRefreshing && refreshPromise) {
          // Wait for ongoing refresh
          try {
            const refreshed = await refreshPromise
            if (refreshed) {
              // Retry with new token
              const newOptions = {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${authStore.accessToken}`,
                },
              }
              return await originalFetch(request, newOptions)
            }
          } catch {
            // Refresh failed
          }
          throw error
        } else {
          // No refresh token - logout
          await handleLogout()
          throw error
        }
      }

      throw error
    }
  }

  async function handleLogout() {
    authStore.clearAuth()

    // Only redirect if not already on auth pages
    const currentPath = router.currentRoute.value.path
    if (!currentPath.startsWith('/auth/')) {
      // Include redirect URL so user can return after login
      const redirectUrl = encodeURIComponent(currentPath)
      await router.push(`/auth/login?expired=true&redirect=${redirectUrl}`)
    }
  }
})