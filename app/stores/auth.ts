import type { User, LoginCredentials, RegisterData, AuthResponse } from '~/types/auth'
import type { UserProfile, UserPreferences, UpdateProfileData, UpdatePreferencesData } from '~/types/user'

const API_BASE = '/api/v1'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  preferences: UserPreferences | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    profile: null,
    preferences: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    hasUser: (state) => !!state.user,
    isEmailVerified: (state) => state.user?.emailVerified ?? false,
    userRole: (state) => state.user?.role ?? null,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isArtist: (state) => state.user?.role === 'ARTIST',
    fullName: (state) => {
      if (!state.user?.profile) return state.user?.email ?? ''
      const { firstName, lastName } = state.user.profile
      return `${firstName} ${lastName}`.trim()
    },
  },

  actions: {
    // Clear all auth state
    clearAuth() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.profile = null
      this.preferences = null
      this.error = null
    },

    // Handle auth response
    handleAuthResponse(response: AuthResponse) {
      this.accessToken = response.accessToken
      this.refreshToken = response.refreshToken
      this.user = response.user
    },

    // Login
    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<AuthResponse>(`${API_BASE}/auth/login`, {
          method: 'POST',
          body: credentials,
        })

        this.handleAuthResponse(response)

        // Fetch full user data (login response doesn't include all fields like emailVerified)
        await this.fetchCurrentUser()

        return { success: true }
      } catch (error: any) {
        this.error = error?.data?.message || 'Login failed. Please try again.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Register
    async register(data: RegisterData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<AuthResponse>(`${API_BASE}/auth/register`, {
          method: 'POST',
          body: data,
        })

        this.handleAuthResponse(response)

        // Fetch full user data
        await this.fetchCurrentUser()

        return { success: true }
      } catch (error: any) {
        this.error = error?.data?.message || 'Registration failed. Please try again.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Logout
    async logout() {
      try {
        if (this.accessToken) {
          await $fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }).catch(() => {})
        }
      } finally {
        this.clearAuth()
      }
    },

    // Refresh access token
    async refreshAccessToken(): Promise<boolean> {
      if (!this.refreshToken) return false

      try {
        const response = await $fetch<AuthResponse>(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          body: { refreshToken: this.refreshToken },
        })

        this.handleAuthResponse(response)
        return true
      } catch {
        this.clearAuth()
        return false
      }
    },

    // Fetch current user - called to validate token on app init
    async fetchCurrentUser(): Promise<boolean> {
      if (!this.accessToken) return false

      try {
        const user = await $fetch<User>(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        this.user = user
        return true
      } catch (error: any) {
        // Check if it's a 401 error - token might be expired
        const status = error?.response?.status || error?.status || error?.statusCode
        if (status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            // Retry fetching user
            try {
              const user = await $fetch<User>(`${API_BASE}/users/me`, {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                },
              })
              this.user = user
              return true
            } catch {
              this.clearAuth()
              return false
            }
          }
        }
        this.clearAuth()
        return false
      }
    },

    // Forgot password
    async forgotPassword(email: string) {
      this.loading = true
      this.error = null

      try {
        await $fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          body: { email },
        })

        return { success: true }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to send reset email.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Reset password
    async resetPassword(token: string, password: string) {
      this.loading = true
      this.error = null

      try {
        await $fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          body: { token, password },
        })

        return { success: true }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to reset password.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Verify email
    async verifyEmail(token: string) {
      this.loading = true
      this.error = null

      try {
        await $fetch(`${API_BASE}/auth/verify-email`, {
          method: 'POST',
          body: { token },
        })

        if (this.user) {
          this.user.emailVerified = true
        }

        return { success: true }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to verify email.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch user profile
    async fetchProfile() {
      if (!this.accessToken) return

      try {
        const profile = await $fetch<UserProfile>(`${API_BASE}/users/me/profile`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        this.profile = profile
        return { success: true, data: profile }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to fetch profile.'
        return { success: false, error: this.error }
      }
    },

    // Update user profile
    async updateProfile(data: UpdateProfileData) {
      if (!this.accessToken) return { success: false, error: 'Not authenticated' }

      this.loading = true
      this.error = null

      try {
        const profile = await $fetch<UserProfile>(`${API_BASE}/users/me/profile`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: data,
        })

        this.profile = profile
        if (this.user) {
          this.user.profile = profile
        }
        return { success: true, data: profile }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to update profile.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch user preferences
    async fetchPreferences() {
      if (!this.accessToken) return

      try {
        const preferences = await $fetch<UserPreferences>(`${API_BASE}/users/me/preferences`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        this.preferences = preferences
        return { success: true, data: preferences }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to fetch preferences.'
        return { success: false, error: this.error }
      }
    },

    // Update user preferences
    async updatePreferences(data: UpdatePreferencesData) {
      if (!this.accessToken) return { success: false, error: 'Not authenticated' }

      this.loading = true
      this.error = null

      try {
        const preferences = await $fetch<UserPreferences>(`${API_BASE}/users/me/preferences`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: data,
        })

        this.preferences = preferences
        return { success: true, data: preferences }
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to update preferences.'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
  },

  persist: {
    key: 'art-gallery-auth',
    pick: ['accessToken', 'refreshToken', 'user'],
  },
})