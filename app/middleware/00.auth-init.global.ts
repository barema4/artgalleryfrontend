import { useAuthStore } from '~/stores/auth'

let initialized = false

export default defineNuxtRouteMiddleware(async () => {
  // Skip on server
  if (import.meta.server) return

  // Only initialize once
  if (initialized) return
  initialized = true

  const authStore = useAuthStore()

  // If we have a token but no user, validate the token
  if (authStore.accessToken && !authStore.user) {
    await authStore.fetchCurrentUser()
  }
})