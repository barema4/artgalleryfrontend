import type {
  Cart,
  AddToCartData,
  UpdateCartItemData,
  MergeCartData,
  CartValidationResult,
} from '~/types/cart'
import { useAuthStore } from '~/stores/auth'

const API_BASE = '/api/v1'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('art-gallery-auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.accessToken || null
    }
  } catch {
  }

  const authStore = useAuthStore()
  return authStore.accessToken
}

function getHeaders(sessionId?: string): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (sessionId) {
    headers['x-session-id'] = sessionId
  }
  return headers
}

export function useCartService() {
  return {
    // ============================================
    // Guest Cart Endpoints
    // ============================================

    getGuestCart: async (sessionId: string): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/guest`, {
        headers: getHeaders(sessionId),
      })
    },

    addToGuestCart: async (sessionId: string, data: AddToCartData): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/guest/items`, {
        method: 'POST',
        headers: getHeaders(sessionId),
        body: data,
      })
    },

    updateGuestCartItem: async (sessionId: string, itemId: string, data: UpdateCartItemData): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/guest/items/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(sessionId),
        body: data,
      })
    },

    removeGuestCartItem: async (sessionId: string, itemId: string): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/guest/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(sessionId),
      })
    },

    clearGuestCart: async (sessionId: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/cart/guest`, {
        method: 'DELETE',
        headers: getHeaders(sessionId),
      })
    },

    validateGuestCart: async (sessionId: string): Promise<CartValidationResult> => {
      return $fetch<CartValidationResult>(`${API_BASE}/cart/guest/validate`, {
        headers: getHeaders(sessionId),
      })
    },

    // ============================================
    // Authenticated User Cart Endpoints
    // ============================================

    getCart: async (): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart`, {
        headers: getHeaders(),
      })
    },

    addToCart: async (data: AddToCartData): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateCartItem: async (itemId: string, data: UpdateCartItemData): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    removeCartItem: async (itemId: string): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    clearCart: async (): Promise<void> => {
      return $fetch<void>(`${API_BASE}/cart`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    validateCart: async (): Promise<CartValidationResult> => {
      return $fetch<CartValidationResult>(`${API_BASE}/cart/validate`, {
        headers: getHeaders(),
      })
    },

    // ============================================
    // Cart Merge (Guest to User)
    // ============================================

    mergeCart: async (data: MergeCartData): Promise<Cart> => {
      return $fetch<Cart>(`${API_BASE}/cart/merge`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },
  }
}
