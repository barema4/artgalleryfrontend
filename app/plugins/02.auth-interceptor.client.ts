import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const router = useRouter()

  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  const originalFetch = globalThis.$fetch as typeof $fetch

  const interceptedFetch = async (request: any, options: any = {}): Promise<any> => {
    try {
      return await originalFetch(request, options)
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; status?: number; statusCode?: number }
      const status = err?.response?.status || err?.status || err?.statusCode

      if (status === 401 && authStore.isAuthenticated) {
        const url = typeof request === 'string' ? request : request?.url || ''
        if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
          throw error
        }

        if (authStore.refreshToken && !isRefreshing) {
          isRefreshing = true
          refreshPromise = authStore.refreshAccessToken()

          try {
            const refreshed = await refreshPromise
            isRefreshing = false
            refreshPromise = null

            if (refreshed) {
              const newOptions = {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${authStore.accessToken}`,
                },
              }
              return await originalFetch(request, newOptions)
            } else {
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
          try {
            const refreshed = await refreshPromise
            if (refreshed) {
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
          }
          throw error
        } else {
          await handleLogout()
          throw error
        }
      }

      throw error
    }
  }

  interceptedFetch.raw = originalFetch.raw
  interceptedFetch.create = originalFetch.create

  globalThis.$fetch = interceptedFetch as typeof $fetch

  async function handleLogout() {
    authStore.clearAuth()

    const currentPath = router.currentRoute.value.path
    if (!currentPath.startsWith('/auth/')) {
      const redirectUrl = encodeURIComponent(currentPath)
      await router.push(`/auth/login?expired=true&redirect=${redirectUrl}`)
    }
  }
})
