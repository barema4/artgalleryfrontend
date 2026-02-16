<script setup lang="ts">
import { useCartStore, type CartItem } from '~/stores/cart'

const cartStore = useCartStore()

const isOpen = computed(() => cartStore.isOpen)

function closeDrawer() {
  cartStore.closeCart()
}

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

function handleQuantityChange(itemId: string, event: Event) {
  const target = event.target as HTMLSelectElement
  const quantity = parseInt(target.value, 10)
  cartStore.updateQuantity(itemId, quantity)
}

function getMaxQuantity(item: CartItem): number {
  return Math.min(item.variant?.stock || item.product.stock, 10)
}

onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeDrawer()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})

watch(isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-bark-900/50 z-40"
        @click="closeDrawer"
      />
    </Transition>

    <Transition name="slide-right">
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <div class="flex items-center justify-between p-4 border-b border-earth-100">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-bark-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 class="text-lg font-semibold text-bark-800">
              Your Cart
              <span v-if="cartStore.itemCount > 0" class="text-bark-500 font-normal">
                ({{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'item' : 'items' }})
              </span>
            </h2>
          </div>
          <button
            class="p-2 text-bark-400 hover:text-bark-600 transition-colors"
            @click="closeDrawer"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          v-if="cartStore.isEmpty"
          class="flex-1 flex flex-col items-center justify-center p-8 text-center"
        >
          <svg class="w-20 h-20 text-earth-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="text-lg font-medium text-bark-700 mb-1">Your cart is empty</h3>
          <p class="text-bark-500 mb-6">Browse our collection and find something you love!</p>
          <NuxtLink
            to="/shop"
            class="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            @click="closeDrawer"
          >
            Continue Shopping
          </NuxtLink>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex gap-4 bg-earth-50 rounded-xl p-3"
          >
            <div class="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
              <img
                v-if="getPrimaryImage(item)"
                :src="getPrimaryImage(item)!"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <NuxtLink
                :to="`/shop/${item.product.slug}`"
                class="font-medium text-bark-800 hover:text-primary-600 line-clamp-1 transition-colors"
                @click="closeDrawer"
              >
                {{ item.product.name }}
              </NuxtLink>

              <p v-if="item.variant" class="text-sm text-bark-500 mt-0.5">
                {{ item.variant.name }}
              </p>

              <div class="flex items-center gap-3 mt-2">
                <select
                  :value="item.quantity"
                  class="px-2 py-1 text-sm border border-earth-200 rounded-lg bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  @change="handleQuantityChange(item.id, $event)"
                >
                  <option v-for="n in getMaxQuantity(item)" :key="n" :value="n">
                    {{ n }}
                  </option>
                </select>

                <button
                  class="text-sm text-bark-400 hover:text-kente-red transition-colors"
                  @click="cartStore.removeItem(item.id)"
                >
                  Remove
                </button>
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <p class="font-semibold text-bark-800">{{ getItemTotal(item) }}</p>
              <p v-if="item.quantity > 1" class="text-xs text-bark-400 mt-0.5">
                {{ formatPrice(getItemPrice(item), item.product.currency) }} each
              </p>
            </div>
          </div>
        </div>

        <div v-if="!cartStore.isEmpty" class="border-t border-earth-100 p-4 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-bark-600">Subtotal</span>
            <span class="text-lg font-bold text-bark-800">{{ cartStore.formattedSubtotal }}</span>
          </div>

          <p class="text-sm text-bark-500">
            Shipping and taxes calculated at checkout
          </p>

          <div class="space-y-2">
            <NuxtLink
              to="/checkout"
              class="block w-full py-3 bg-primary-500 text-white text-center font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              @click="closeDrawer"
            >
              Checkout
            </NuxtLink>

            <NuxtLink
              to="/cart"
              class="block w-full py-3 border border-earth-200 text-bark-700 text-center font-medium rounded-xl hover:bg-earth-50 transition-colors"
              @click="closeDrawer"
            >
              View Cart
            </NuxtLink>
          </div>

          <button
            class="w-full text-sm text-bark-400 hover:text-kente-red transition-colors"
            @click="cartStore.clearCart"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
