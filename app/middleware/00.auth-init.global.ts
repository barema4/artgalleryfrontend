import { useAuthStore } from '~/stores/auth'

let initialized = false

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  if (initialized) return
  initialized = true

  const authStore = useAuthStore()

  if (authStore.accessToken && !authStore.user) {
    await authStore.fetchCurrentUser()
  }
})
