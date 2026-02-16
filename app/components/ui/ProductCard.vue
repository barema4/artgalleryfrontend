<script setup lang="ts">
import type { Product } from '~/types/product'
import { PRODUCT_TYPE_LABELS } from '~/types/product'

const props = defineProps<{
  product: Product
  showArtist?: boolean
}>()

const emit = defineEmits<{
  click: [product: Product]
  addToCart: [product: Product]
}>()

const primaryImage = computed(() => {
  if (!props.product.images || props.product.images.length === 0) return null
  return props.product.images.find((img) => img.isPrimary) || props.product.images[0]
})

const isOnSale = computed(() => {
  return props.product.compareAtPrice && props.product.compareAtPrice > props.product.price
})

const discountPercentage = computed(() => {
  if (!isOnSale.value || !props.product.compareAtPrice) return 0
  return Math.round(
    ((props.product.compareAtPrice - props.product.price) / props.product.compareAtPrice) * 100
  )
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.currency || 'USD',
  }).format(props.product.price)
})

const formattedComparePrice = computed(() => {
  if (!props.product.compareAtPrice) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.currency || 'USD',
  }).format(props.product.compareAtPrice)
})

const isOutOfStock = computed(() => props.product.stock <= 0)

const isLowStock = computed(() => {
  return props.product.stock > 0 && props.product.stock <= props.product.lowStockThreshold
})

function handleAddToCart(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  if (!isOutOfStock.value) {
    emit('addToCart', props.product)
  }
}
</script>

<template>
  <NuxtLink
    :to="`/shop/${product.slug}`"
    class="group block bg-white rounded-2xl border border-earth-100 overflow-hidden transition-all duration-300 hover:border-earth-200 hover:shadow-lg"
    @click="emit('click', product)"
  >
    <!-- Image Container -->
    <div class="relative aspect-square bg-earth-50 overflow-hidden">
      <img
        v-if="primaryImage"
        :src="primaryImage.url"
        :alt="primaryImage.altText || product.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <svg class="w-16 h-16 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-2">
        <!-- Sale Badge -->
        <span
          v-if="isOnSale"
          class="px-2.5 py-1 bg-kente-red text-white text-xs font-semibold rounded-full"
        >
          -{{ discountPercentage }}%
        </span>

        <!-- Limited Edition Badge -->
        <span
          v-if="product.isLimitedEdition"
          class="px-2.5 py-1 bg-bark-800 text-white text-xs font-semibold rounded-full"
        >
          Limited Edition
        </span>

        <!-- Digital Badge -->
        <span
          v-if="product.isDigital"
          class="px-2.5 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full"
        >
          Digital
        </span>
      </div>

      <!-- Out of Stock Overlay -->
      <div
        v-if="isOutOfStock"
        class="absolute inset-0 bg-bark-900/60 flex items-center justify-center"
      >
        <span class="px-4 py-2 bg-white text-bark-700 text-sm font-semibold rounded-full">
          Out of Stock
        </span>
      </div>

      <!-- Quick Add Button -->
      <button
        v-if="!isOutOfStock"
        class="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-primary-500 hover:text-white"
        @click="handleAddToCart"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Type Badge -->
      <span class="inline-block px-2 py-0.5 bg-earth-100 text-bark-600 text-xs font-medium rounded-full mb-2">
        {{ PRODUCT_TYPE_LABELS[product.type] }}
      </span>

      <!-- Product Name -->
      <h3 class="font-semibold text-bark-800 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
        {{ product.name }}
      </h3>

      <!-- Artist Info -->
      <p
        v-if="showArtist && product.artwork?.artist"
        class="text-sm text-bark-500 mb-2"
      >
        by {{ product.artwork.artist.displayName }}
      </p>

      <!-- Edition Info -->
      <p
        v-if="product.isLimitedEdition && product.editionNumber && product.editionSize"
        class="text-xs text-bark-400 mb-2"
      >
        Edition {{ product.editionNumber }} of {{ product.editionSize }}
      </p>

      <!-- Price -->
      <div class="flex items-baseline gap-2">
        <span class="text-lg font-bold text-bark-800">{{ formattedPrice }}</span>
        <span
          v-if="isOnSale"
          class="text-sm text-bark-400 line-through"
        >
          {{ formattedComparePrice }}
        </span>
      </div>

      <!-- Stock Status -->
      <p
        v-if="isLowStock"
        class="mt-2 text-xs text-kente-red font-medium"
      >
        Only {{ product.stock }} left in stock
      </p>

      <!-- Variants indicator -->
      <p
        v-if="product.variants && product.variants.length > 1"
        class="mt-2 text-xs text-bark-500"
      >
        {{ product.variants.length }} options available
      </p>
    </div>
  </NuxtLink>
</template>
