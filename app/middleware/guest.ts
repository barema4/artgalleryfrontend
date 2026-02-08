import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  // Skip on server - auth is client-side only
  if (import.meta.server) return

  const authStore = useAuthStore()

  // If user is authenticated, redirect to home
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})