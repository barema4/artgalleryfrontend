<script setup lang="ts">
import { useCartStore, type CartItem } from '~/stores/cart'

const cartStore = useCartStore()

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

function getItemPrice(item: CartItem): number {
  return item.variant?.price || item.product.price
}

function getItemTotal(item: CartItem): string {
  const price = getItemPrice(item)
  const currency = item.product.currency || 'USD'
  return formatPrice(price * item.quantity, currency)
}

function getPrimaryImage(item: CartItem): string | null {
  const images = item.product.images
  if (!images || images.length === 0) return null
  const primary = images.find((img) => img.isPrimary)
  return primary?.url || images[0]?.url || null
}

function getMaxQuantity(item: CartItem): number {
  return Math.min(item.variant?.stock || item.product.stock, 10)
}

function updateQuantity(itemId: string, quantity: number) {
  cartStore.updateQuantity(itemId, quantity)
}

const estimatedShipping = computed(() => {
  if (cartStore.isEmpty) return 0
  if (cartStore.subtotal >= 100) return 0
  return 9.99
})

const orderTotal = computed(() => {
  return cartStore.subtotal + estimatedShipping.value
})

const formattedShipping = computed(() => {
  if (estimatedShipping.value === 0) return 'FREE'
  return formatPrice(estimatedShipping.value)
})

const formattedTotal = computed(() => {
  const currency = cartStore.items[0]?.product.currency || 'USD'
  return formatPrice(orderTotal.value, currency)
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-bark-800">Shopping Cart</h1>
        <p v-if="!cartStore.isEmpty" class="text-bark-500 mt-2">
          {{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'item' : 'items' }} in your cart
        </p>
      </div>

      <div v-if="cartStore.isEmpty" class="bg-white rounded-2xl border border-earth-100 py-16 text-center">
        <svg class="w-24 h-24 text-earth-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-2xl font-display font-bold text-bark-800 mb-2">Your cart is empty</h2>
        <p class="text-bark-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Explore our collection and find something you love!
        </p>
        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Start Shopping
        </NuxtLink>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1">
          <div class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
            <div class="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-earth-50 border-b border-earth-100 text-sm font-medium text-bark-600">
              <div class="col-span-6">Product</div>
              <div class="col-span-2 text-center">Price</div>
              <div class="col-span-2 text-center">Quantity</div>
              <div class="col-span-2 text-right">Total</div>
            </div>

            <div class="divide-y divide-earth-100">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="p-6"
              >
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div class="sm:col-span-6 flex gap-4">
                    <NuxtLink
                      :to="`/shop/${item.product.slug}`"
                      class="w-24 h-24 flex-shrink-0 bg-earth-50 rounded-xl overflow-hidden"
                    >
                      <img
                        v-if="getPrimaryImage(item)"
                        :src="getPrimaryImage(item)!"
                        :alt="item.product.name"
                        class="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </NuxtLink>

                    <div class="flex-1 min-w-0">
                      <NuxtLink
                        :to="`/shop/${item.product.slug}`"
                        class="font-semibold text-bark-800 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {{ item.product.name }}
                      </NuxtLink>
                      <p v-if="item.variant" class="text-sm text-bark-500 mt-1">
                        {{ item.variant.name }}
                      </p>
                      <p class="text-xs text-bark-400 mt-1">
                        SKU: {{ item.variant?.sku || item.product.sku }}
                      </p>
                      <p class="sm:hidden text-bark-700 font-medium mt-2">
                        {{ formatPrice(getItemPrice(item), item.product.currency) }}
                      </p>
                    </div>
                  </div>

                  <div class="hidden sm:block sm:col-span-2 text-center text-bark-700">
                    {{ formatPrice(getItemPrice(item), item.product.currency) }}
                  </div>

                  <div class="sm:col-span-2 flex items-center justify-center">
                    <div class="flex items-center border border-earth-200 rounded-xl overflow-hidden">
                      <button
                        class="w-9 h-9 flex items-center justify-center text-bark-600 hover:bg-earth-50 transition-colors disabled:opacity-50"
                        :disabled="item.quantity <= 1"
                        @click="updateQuantity(item.id, item.quantity - 1)"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-10 text-center text-bark-800 font-medium text-sm">
                        {{ item.quantity }}
                      </span>
                      <button
                        class="w-9 h-9 flex items-center justify-center text-bark-600 hover:bg-earth-50 transition-colors disabled:opacity-50"
                        :disabled="item.quantity >= getMaxQuantity(item)"
                        @click="updateQuantity(item.id, item.quantity + 1)"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="sm:col-span-2 flex items-center justify-between sm:justify-end gap-4">
                    <span class="font-semibold text-bark-800">
                      {{ getItemTotal(item) }}
                    </span>
                    <button
                      class="p-2 text-bark-400 hover:text-kente-red hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                      @click="cartStore.removeItem(item.id)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-6 py-4 bg-earth-50 border-t border-earth-100 flex flex-wrap items-center justify-between gap-4">
              <NuxtLink
                to="/shop"
                class="inline-flex items-center gap-2 text-bark-600 hover:text-primary-600 font-medium transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </NuxtLink>
              <button
                class="text-bark-500 hover:text-kente-red font-medium transition-colors"
                @click="cartStore.clearCart()"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        <div class="lg:w-96">
          <div class="bg-white rounded-2xl border border-earth-100 p-6 sticky top-24">
            <h2 class="text-lg font-semibold text-bark-800 mb-6">Order Summary</h2>

            <div class="space-y-4 mb-6">
              <div class="flex items-center justify-between text-bark-600">
                <span>Subtotal ({{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'item' : 'items' }})</span>
                <span class="font-medium text-bark-800">{{ cartStore.formattedSubtotal }}</span>
              </div>
              <div class="flex items-center justify-between text-bark-600">
                <span>Estimated Shipping</span>
                <span class="font-medium" :class="estimatedShipping === 0 ? 'text-green-600' : 'text-bark-800'">
                  {{ formattedShipping }}
                </span>
              </div>
              <p v-if="cartStore.subtotal < 100 && cartStore.subtotal > 0" class="text-xs text-bark-500">
                Add {{ formatPrice(100 - cartStore.subtotal) }} more for free shipping!
              </p>
            </div>

            <div class="border-t border-earth-200 my-6"></div>

            <div class="flex items-center justify-between mb-6">
              <span class="text-lg font-semibold text-bark-800">Total</span>
              <span class="text-2xl font-bold text-bark-800">{{ formattedTotal }}</span>
            </div>

            <NuxtLink
              to="/checkout"
              class="block w-full py-3.5 bg-primary-500 text-white text-center font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Proceed to Checkout
            </NuxtLink>

            <div class="flex items-center justify-center gap-2 mt-4 text-xs text-bark-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure checkout powered by Stripe</span>
            </div>

            <div class="flex items-center justify-center gap-3 mt-4">
              <svg class="h-6 text-bark-400" viewBox="0 0 50 32" fill="currentColor">
                <path d="M18.4 16.3c0 3.5 2.8 6.3 6.3 6.3s6.3-2.8 6.3-6.3-2.8-6.3-6.3-6.3-6.3 2.8-6.3 6.3zm-1.8 0c0-4.5 3.6-8.1 8.1-8.1s8.1 3.6 8.1 8.1-3.6 8.1-8.1 8.1-8.1-3.6-8.1-8.1z"/>
                <path d="M5 8.2h4.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5H7v6.6H5V8.2zm4.3 7.2c1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7H7v5.4h2.3z"/>
                <path d="M36 8.2h2v15.6h-2z"/>
                <path d="M41 8.2h2v15.6h-2z"/>
              </svg>
              <svg class="h-5 text-bark-400" viewBox="0 0 50 32" fill="currentColor">
                <path d="M25 4C13.4 4 4 11.2 4 20s9.4 16 21 16 21-7.2 21-16S36.6 4 25 4zm0 28c-9.4 0-17-5.4-17-12s7.6-12 17-12 17 5.4 17 12-7.6 12-17 12z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
