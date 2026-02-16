<script setup lang="ts">
import type { ProductVariant } from '~/types/product'
import { PRODUCT_TYPE_LABELS } from '~/types/product'
import { useProductsStore } from '~/stores/products'
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const slug = computed(() => route.params.slug as string)
const product = computed(() => productsStore.currentProduct)
const isLoading = ref(true)
const error = ref('')

const selectedVariant = ref<ProductVariant | null>(null)
const quantity = ref(1)
const activeImageIndex = ref(0)

const sortedImages = computed(() => {
  if (!product.value?.images) return []
  return [...product.value.images].sort((a, b) => {
    if (a.isPrimary) return -1
    if (b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })
})

const activeImage = computed(() => {
  return sortedImages.value[activeImageIndex.value] || null
})

const currentPrice = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.price
  }
  return product.value?.price || 0
})

const currentStock = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.stock
  }
  return product.value?.stock || 0
})

const isOutOfStock = computed(() => currentStock.value <= 0)

const isLowStock = computed(() => {
  if (!product.value) return false
  return currentStock.value > 0 && currentStock.value <= product.value.lowStockThreshold
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.value?.currency || 'USD',
  }).format(currentPrice.value)
})

const formattedComparePrice = computed(() => {
  if (!product.value?.compareAtPrice) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.value.currency || 'USD',
  }).format(product.value.compareAtPrice)
})

const isOnSale = computed(() => {
  if (!product.value) return false
  return product.value.compareAtPrice && product.value.compareAtPrice > product.value.price
})

const discountPercentage = computed(() => {
  if (!isOnSale.value || !product.value?.compareAtPrice) return 0
  return Math.round(
    ((product.value.compareAtPrice - product.value.price) / product.value.compareAtPrice) * 100
  )
})

const hasVariants = computed(() => {
  return product.value?.variants && product.value.variants.length > 1
})

const maxQuantity = computed(() => Math.min(currentStock.value, 10))

function setActiveImage(index: number) {
  activeImageIndex.value = index
}

function incrementQuantity() {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  if (!product.value || isOutOfStock.value) return

  cartStore.addItem(product.value, selectedVariant.value, quantity.value)
  cartStore.openCart()
}

async function fetchProduct() {
  isLoading.value = true
  error.value = ''

  try {
    await productsStore.fetchProductBySlug(slug.value)

    if (product.value?.variants && product.value.variants.length > 0) {
      const availableVariant = product.value.variants.find((v) => v.stock > 0)
      selectedVariant.value = availableVariant ?? product.value.variants[0] ?? null
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Failed to load product'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})

onUnmounted(() => {
  productsStore.clearCurrentProduct()
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <nav class="mb-6">
        <ol class="flex items-center gap-2 text-sm">
          <li>
            <NuxtLink to="/shop" class="text-bark-500 hover:text-primary-600 transition-colors">
              Shop
            </NuxtLink>
          </li>
          <li class="text-bark-400">/</li>
          <li class="text-bark-700 font-medium truncate">
            {{ product?.name || 'Loading...' }}
          </li>
        </ol>
      </nav>

      <div v-if="isLoading" class="bg-white rounded-2xl border border-earth-100 p-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="lg:w-1/2">
            <div class="aspect-square bg-earth-100 rounded-xl animate-pulse" />
            <div class="flex gap-2 mt-4">
              <div v-for="i in 4" :key="i" class="w-20 h-20 bg-earth-100 rounded-lg animate-pulse" />
            </div>
          </div>
          <div class="lg:w-1/2 space-y-4">
            <div class="h-8 bg-earth-100 rounded animate-pulse w-3/4" />
            <div class="h-6 bg-earth-100 rounded animate-pulse w-1/4" />
            <div class="h-10 bg-earth-100 rounded animate-pulse w-1/3" />
            <div class="h-4 bg-earth-100 rounded animate-pulse w-full" />
            <div class="h-4 bg-earth-100 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>

      <UiAlert v-else-if="error" type="error" class="mb-6">
        {{ error }}
        <template #actions>
          <NuxtLink to="/shop" class="text-sm font-medium underline">
            Back to Shop
          </NuxtLink>
        </template>
      </UiAlert>

      <div v-else-if="product" class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
        <div class="flex flex-col lg:flex-row">
          <div class="lg:w-1/2 p-6 lg:p-8">
            <div class="relative aspect-square bg-earth-50 rounded-xl overflow-hidden mb-4">
              <img
                v-if="activeImage"
                :src="activeImage.url"
                :alt="activeImage.altText || product.name"
                class="w-full h-full object-contain"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-24 h-24 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div class="absolute top-4 left-4 flex flex-col gap-2">
                <span
                  v-if="isOnSale"
                  class="px-3 py-1 bg-kente-red text-white text-sm font-semibold rounded-full"
                >
                  -{{ discountPercentage }}% OFF
                </span>
                <span
                  v-if="product.isLimitedEdition"
                  class="px-3 py-1 bg-bark-800 text-white text-sm font-semibold rounded-full"
                >
                  Limited Edition
                </span>
                <span
                  v-if="product.isDigital"
                  class="px-3 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full"
                >
                  Digital Download
                </span>
              </div>
            </div>

            <div v-if="sortedImages.length > 1" class="flex gap-2 overflow-x-auto pb-2">
              <button
                v-for="(image, index) in sortedImages"
                :key="image.id"
                class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
                :class="[
                  index === activeImageIndex
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-earth-200 hover:border-earth-300'
                ]"
                @click="setActiveImage(index)"
              >
                <img
                  :src="image.url"
                  :alt="image.altText || `${product.name} ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <div class="lg:w-1/2 p-6 lg:p-8 lg:border-l border-earth-100">
            <span class="inline-block px-3 py-1 bg-earth-100 text-bark-600 text-sm font-medium rounded-full mb-4">
              {{ PRODUCT_TYPE_LABELS[product.type] }}
            </span>

            <h1 class="text-2xl lg:text-3xl font-display font-bold text-bark-800 mb-2">
              {{ product.name }}
            </h1>

            <p v-if="product.artwork?.artist" class="text-bark-500 mb-4">
              by
              <NuxtLink
                :to="`/artists/${product.artwork.artist.slug}`"
                class="text-primary-600 hover:text-primary-700 font-medium"
              >
                {{ product.artwork.artist.displayName }}
              </NuxtLink>
            </p>

            <p
              v-if="product.isLimitedEdition && product.editionNumber && product.editionSize"
              class="text-sm text-bark-500 mb-4"
            >
              Edition {{ product.editionNumber }} of {{ product.editionSize }}
            </p>

            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-3xl font-bold text-bark-800">{{ formattedPrice }}</span>
              <span v-if="isOnSale" class="text-lg text-bark-400 line-through">
                {{ formattedComparePrice }}
              </span>
            </div>

            <div class="mb-6">
              <span
                v-if="isOutOfStock"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-kente-red/10 text-kente-red text-sm font-medium rounded-full"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                Out of Stock
              </span>
              <span
                v-else-if="isLowStock"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-kente-gold/10 text-kente-gold text-sm font-medium rounded-full"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Only {{ currentStock }} left
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                In Stock
              </span>
            </div>

            <div v-if="hasVariants" class="mb-6">
              <UiProductVariantSelector
                v-model="selectedVariant"
                :variants="product.variants!"
                :currency="product.currency"
              />
            </div>

            <div v-if="!isOutOfStock" class="flex items-center gap-4 mb-6">
              <div class="flex items-center border border-earth-200 rounded-xl overflow-hidden">
                <button
                  class="w-10 h-10 flex items-center justify-center text-bark-600 hover:bg-earth-50 transition-colors disabled:opacity-50"
                  :disabled="quantity <= 1"
                  @click="decrementQuantity"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="maxQuantity"
                  class="w-14 h-10 text-center text-bark-800 font-medium border-x border-earth-200 focus:outline-none"
                />
                <button
                  class="w-10 h-10 flex items-center justify-center text-bark-600 hover:bg-earth-50 transition-colors disabled:opacity-50"
                  :disabled="quantity >= maxQuantity"
                  @click="incrementQuantity"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button
                class="flex-1 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all flex items-center justify-center gap-2"
                @click="addToCart"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            </div>

            <div v-if="product.description" class="mb-6">
              <h3 class="font-semibold text-bark-800 mb-2">Description</h3>
              <p class="text-bark-600 leading-relaxed whitespace-pre-line">
                {{ product.description }}
              </p>
            </div>

            <div class="border-t border-earth-100 pt-6">
              <h3 class="font-semibold text-bark-800 mb-4">Product Details</h3>
              <dl class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="text-bark-500">SKU</dt>
                  <dd class="text-bark-700 font-medium">{{ selectedVariant?.sku || product.sku }}</dd>
                </div>
                <div>
                  <dt class="text-bark-500">Type</dt>
                  <dd class="text-bark-700 font-medium">{{ PRODUCT_TYPE_LABELS[product.type] }}</dd>
                </div>
                <div v-if="product.weight">
                  <dt class="text-bark-500">Weight</dt>
                  <dd class="text-bark-700 font-medium">{{ product.weight }} kg</dd>
                </div>
                <div v-if="product.isDigital">
                  <dt class="text-bark-500">Format</dt>
                  <dd class="text-bark-700 font-medium">Digital Download</dd>
                </div>
              </dl>
            </div>

            <div v-if="product.artwork" class="border-t border-earth-100 pt-6 mt-6">
              <h3 class="font-semibold text-bark-800 mb-4">Original Artwork</h3>
              <NuxtLink
                :to="`/artworks/${product.artwork.slug}`"
                class="block p-4 bg-earth-50 rounded-xl hover:bg-earth-100 transition-colors"
              >
                <p class="font-medium text-bark-700">{{ product.artwork.title }}</p>
                <p v-if="product.artwork.artist" class="text-sm text-bark-500 mt-1">
                  by {{ product.artwork.artist.displayName }}
                </p>
                <p class="text-sm text-primary-600 mt-2 font-medium">View Original</p>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="product && productsStore.products.length > 1" class="mt-12">
        <h2 class="text-2xl font-display font-bold text-bark-800 mb-6">You May Also Like</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UiProductCard
            v-for="relatedProduct in productsStore.products.filter(p => p.id !== product?.id).slice(0, 4)"
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </div>
    </div>

    <UiCartDrawer />
  </div>
</template>
