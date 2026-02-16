import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

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
