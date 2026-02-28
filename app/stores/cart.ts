import { defineStore } from 'pinia'
import type { Cart, CartItem, AddToCartData } from '~/types/cart'
import { useCartService } from '~/services/cart.service'
import { useAuthStore } from '~/stores/auth'

interface CartState {
  cart: Cart | null
  isOpen: boolean
  sessionId: string | null
  isLoading: boolean
}

function generateSessionId(): string {
  return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    cart: null,
    isOpen: false,
    sessionId: null,
    isLoading: false,
  }),

  getters: {
    items: (state): CartItem[] => state.cart?.items || [],

    itemCount: (state): number => state.cart?.summary.itemCount || 0,

    isEmpty: (state): boolean => !state.cart || state.cart.items.length === 0,

    subtotal: (state): number => state.cart?.summary.subtotal || 0,

    currency: (state): string => state.cart?.summary.currency || 'USD',

    formattedSubtotal(): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currency,
      }).format(this.subtotal)
    },

    summary: (state) => state.cart?.summary || null,

    allItemsInStock: (state): boolean => state.cart?.summary.allItemsInStock || true,

    hasDigitalItems: (state): boolean => state.cart?.summary.hasDigitalItems || false,

    hasPhysicalItems: (state): boolean => state.cart?.summary.hasPhysicalItems || false,

    getItemQuantity: (state) => (productId: string, variantId?: string): number => {
      const item = state.cart?.items.find(
        (i) => i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId)
      )
      return item?.quantity || 0
    },

    hasItem: (state) => (productId: string, variantId?: string): boolean => {
      return state.cart?.items.some(
        (i) => i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId)
      ) || false
    },
  },

  actions: {
    // ============================================
    // Session Management
    // ============================================

    initSessionId() {
      if (!this.sessionId) {
        const stored = localStorage.getItem('cart-session-id')
        if (stored) {
          this.sessionId = stored
        } else {
          this.sessionId = generateSessionId()
          localStorage.setItem('cart-session-id', this.sessionId)
        }
      }
    },

    clearSessionId() {
      this.sessionId = null
      localStorage.removeItem('cart-session-id')
    },

    // ============================================
    // Fetch Cart
    // ============================================

    async fetchCart() {
      const authStore = useAuthStore()
      const cartService = useCartService()
      this.isLoading = true

      try {
        if (authStore.isAuthenticated) {
          this.cart = await cartService.getCart()
        } else {
          this.initSessionId()
          if (this.sessionId) {
            this.cart = await cartService.getGuestCart(this.sessionId)
          }
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        this.isLoading = false
      }
    },

    // ============================================
    // Add to Cart
    // ============================================

    async addItem(data: AddToCartData) {
      const authStore = useAuthStore()
      const cartService = useCartService()
      this.isLoading = true

      try {
        if (authStore.isAuthenticated) {
          this.cart = await cartService.addToCart(data)
        } else {
          this.initSessionId()
          if (this.sessionId) {
            this.cart = await cartService.addToGuestCart(this.sessionId, data)
          }
        }
      } catch (error) {
        console.error('Failed to add item to cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // ============================================
    // Update Cart Item
    // ============================================

    async updateQuantity(itemId: string, quantity: number) {
      const authStore = useAuthStore()
      const cartService = useCartService()
      this.isLoading = true

      try {
        if (authStore.isAuthenticated) {
          this.cart = await cartService.updateCartItem(itemId, { quantity })
        } else if (this.sessionId) {
          this.cart = await cartService.updateGuestCartItem(this.sessionId, itemId, { quantity })
        }
      } catch (error) {
        console.error('Failed to update cart item:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async incrementQuantity(itemId: string) {
      const item = this.items.find((i) => i.id === itemId)
      if (item) {
        await this.updateQuantity(itemId, item.quantity + 1)
      }
    },

    async decrementQuantity(itemId: string) {
      const item = this.items.find((i) => i.id === itemId)
      if (item && item.quantity > 1) {
        await this.updateQuantity(itemId, item.quantity - 1)
      }
    },

    // ============================================
    // Remove from Cart
    // ============================================

    async removeItem(itemId: string) {
      const authStore = useAuthStore()
      const cartService = useCartService()
      this.isLoading = true

      try {
        if (authStore.isAuthenticated) {
          this.cart = await cartService.removeCartItem(itemId)
        } else if (this.sessionId) {
          this.cart = await cartService.removeGuestCartItem(this.sessionId, itemId)
        }
      } catch (error) {
        console.error('Failed to remove cart item:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // ============================================
    // Clear Cart
    // ============================================

    async clearCart() {
      const authStore = useAuthStore()
      const cartService = useCartService()
      this.isLoading = true

      try {
        if (authStore.isAuthenticated) {
          await cartService.clearCart()
        } else if (this.sessionId) {
          await cartService.clearGuestCart(this.sessionId)
        }
        this.cart = null
      } catch (error) {
        console.error('Failed to clear cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // ============================================
    // Validate Cart
    // ============================================

    async validateCart() {
      const authStore = useAuthStore()
      const cartService = useCartService()

      try {
        if (authStore.isAuthenticated) {
          return await cartService.validateCart()
        } else if (this.sessionId) {
          return await cartService.validateGuestCart(this.sessionId)
        }
        return { valid: true, issues: [] }
      } catch (error) {
        console.error('Failed to validate cart:', error)
        throw error
      }
    },

    // ============================================
    // Merge Guest Cart (on login)
    // ============================================

    async mergeGuestCart() {
      if (!this.sessionId) return

      const cartService = useCartService()
      this.isLoading = true

      try {
        this.cart = await cartService.mergeCart({ sessionId: this.sessionId })
        this.clearSessionId()
      } catch (error) {
        console.error('Failed to merge cart:', error)
      } finally {
        this.isLoading = false
      }
    },

    // ============================================
    // UI Actions
    // ============================================

    openCart() {
      this.isOpen = true
    },

    closeCart() {
      this.isOpen = false
    },

    toggleCart() {
      this.isOpen = !this.isOpen
    },
  },

  persist: {
    key: 'art-gallery-cart',
    pick: ['sessionId'],
  },
})
