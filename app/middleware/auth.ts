import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server - auth is client-side only
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Check if user is authenticated (has token)
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  // Ensure user data is loaded
  if (!authStore.user) {
    const success = await authStore.fetchCurrentUser()
    if (!success) {
      return navigateTo({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      })
    }
  }
})