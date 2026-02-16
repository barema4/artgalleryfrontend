import { defineStore } from 'pinia'
import type { Product, ProductVariant } from '~/types/product'

export interface CartItem {
  id: string
  product: Product
  variant?: ProductVariant | null
  quantity: number
  addedAt: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isOpen: false,
  }),

  getters: {
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),

    isEmpty: (state) => state.items.length === 0,

    subtotal: (state) => {
      return state.items.reduce((acc, item) => {
        const price = item.variant?.price || item.product.price
        return acc + price * item.quantity
      }, 0)
    },

    formattedSubtotal(): string {
      const currency = this.items[0]?.product.currency || 'USD'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(this.subtotal)
    },

    getItemQuantity: (state) => (productId: string, variantId?: string) => {
      const item = state.items.find(
        (i) => i.product.id === productId && (variantId ? i.variant?.id === variantId : !i.variant)
      )
      return item?.quantity || 0
    },

    hasItem: (state) => (productId: string, variantId?: string) => {
      return state.items.some(
        (i) => i.product.id === productId && (variantId ? i.variant?.id === variantId : !i.variant)
      )
    },

    itemsGroupedByArtist: (state) => {
      const grouped: Record<string, CartItem[]> = {}

      state.items.forEach((item) => {
        const artistId = item.product.artwork?.artist?.id || 'unknown'
        if (!grouped[artistId]) {
          grouped[artistId] = []
        }
        grouped[artistId].push(item)
      })

      return grouped
    },
  },

  actions: {
    addItem(product: Product, variant?: ProductVariant | null, quantity: number = 1) {
      const existingIndex = this.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          (variant ? item.variant?.id === variant.id : !item.variant)
      )

      if (existingIndex !== -1) {
        const existingItem = this.items[existingIndex]!
        const maxStock = variant?.stock || product.stock
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStock)
        this.items[existingIndex] = { ...existingItem, quantity: newQuantity }
      } else {
        const cartItemId = variant
          ? `${product.id}-${variant.id}`
          : product.id

        this.items.push({
          id: cartItemId,
          product,
          variant: variant || null,
          quantity: Math.min(quantity, variant?.stock || product.stock),
          addedAt: new Date().toISOString(),
        })
      }
    },

    removeItem(itemId: string) {
      this.items = this.items.filter((item) => item.id !== itemId)
    },

    updateQuantity(itemId: string, quantity: number) {
      const index = this.items.findIndex((item) => item.id === itemId)
      if (index === -1) return

      const existingItem = this.items[index]!
      const maxStock = existingItem.variant?.stock || existingItem.product.stock

      if (quantity <= 0) {
        this.removeItem(itemId)
      } else {
        this.items[index] = {
          ...existingItem,
          quantity: Math.min(quantity, maxStock),
        }
      }
    },

    incrementQuantity(itemId: string) {
      const item = this.items.find((i) => i.id === itemId)
      if (item) {
        this.updateQuantity(itemId, item.quantity + 1)
      }
    },

    decrementQuantity(itemId: string) {
      const item = this.items.find((i) => i.id === itemId)
      if (item) {
        this.updateQuantity(itemId, item.quantity - 1)
      }
    },

    clearCart() {
      this.items = []
    },

    openCart() {
      this.isOpen = true
    },

    closeCart() {
      this.isOpen = false
    },

    toggleCart() {
      this.isOpen = !this.isOpen
    },

    validateCart(products: Product[]) {
      const productMap = new Map(products.map((p) => [p.id, p]))

      this.items = this.items.filter((item) => {
        const currentProduct = productMap.get(item.product.id)
        if (!currentProduct || !currentProduct.active) {
          return false
        }

        const currentVariant = item.variant
          ? currentProduct.variants?.find((v) => v.id === item.variant?.id)
          : null

        if (item.variant && !currentVariant) {
          return false
        }

        const maxStock = currentVariant?.stock || currentProduct.stock
        if (maxStock <= 0) {
          return false
        }

        if (item.quantity > maxStock) {
          item.quantity = maxStock
        }

        item.product = currentProduct
        if (currentVariant) {
          item.variant = currentVariant
        }

        return true
      })
    },
  },

  persist: {
    key: 'art-gallery-cart',
    pick: ['items'],
  },
})
