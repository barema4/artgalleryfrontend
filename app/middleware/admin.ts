import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Skip on server - auth is client-side only
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  // Check if user is admin
  if (!authStore.isAdmin) {
    return navigateTo('/')
  }
})