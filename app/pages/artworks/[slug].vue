<script setup lang="ts">
import type { Artwork, ArtworkImage } from '~/types/artwork'
import { MEDIUM_LABELS, STATUS_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const artworkService = useArtworkService()
const authStore = useAuthStore()

function goBack() {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    router.back()
  } else {
    // Fallback to artworks list
    router.push('/artworks')
  }
}

const artwork = ref<Artwork | null>(null)
const isLoading = ref(true)
const error = ref('')
const selectedImageIndex = ref(0)

const slug = computed(() => route.params.slug as string)

const selectedImage = computed(() => {
  if (!artwork.value?.images?.length) return null
  return artwork.value.images[selectedImageIndex.value]
})

async function fetchArtwork() {
  isLoading.value = true
  error.value = ''

  try {
    artwork.value = await artworkService.getArtworkBySlug(slug.value)
    // Set primary image as selected
    const primaryIndex = artwork.value.images?.findIndex(img => img.isPrimary) ?? 0
    selectedImageIndex.value = primaryIndex >= 0 ? primaryIndex : 0
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artwork'
  } finally {
    isLoading.value = false
  }
}

function selectImage(index: number) {
  selectedImageIndex.value = index
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDimensions(artwork: Artwork) {
  const parts = []
  if (artwork.width && artwork.height) {
    parts.push(`${artwork.width} × ${artwork.height}`)
    if (artwork.depth) {
      parts.push(` × ${artwork.depth}`)
    }
    parts.push(' cm')
  }
  return parts.join('')
}

onMounted(() => {
  fetchArtwork()
})

// Update SEO
useHead(() => ({
  title: artwork.value?.title ? `${artwork.value.title} | ArtGallery` : 'Artwork | ArtGallery',
  meta: [
    { name: 'description', content: artwork.value?.description || 'View artwork details' },
  ],
}))
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Back Button -->
      <button
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Error -->
      <UiAlert v-else-if="error" type="error" class="mb-6">
        {{ error }}
      </UiAlert>

      <!-- Artwork Content -->
      <div v-else-if="artwork" class="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              v-if="selectedImage"
              :src="selectedImage.url"
              :alt="selectedImage.altText || artwork.title"
              class="w-full h-full object-contain"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="artwork.images && artwork.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
            <button
              v-for="(image, index) in artwork.images"
              :key="image.id"
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
              :class="selectedImageIndex === index ? 'border-gray-900' : 'border-transparent hover:border-gray-300'"
              @click="selectImage(index)"
            >
              <img
                :src="image.thumbnailUrl || image.url"
                :alt="image.altText || `${artwork.title} - Image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Artwork Details -->
        <div class="space-y-6">
          <!-- Title & Artist -->
          <div>
            <div class="flex items-start justify-between gap-4">
              <h1 class="text-3xl font-bold text-gray-900">{{ artwork.title }}</h1>
              <div class="flex gap-2">
                <span
                  v-if="artwork.featured"
                  class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"
                >
                  Featured
                </span>
                <span
                  v-if="artwork.status !== 'AVAILABLE'"
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="{
                    'bg-red-100 text-red-800': artwork.status === 'SOLD',
                    'bg-blue-100 text-blue-800': artwork.status === 'ON_EXHIBITION',
                    'bg-gray-100 text-gray-800': artwork.status === 'DRAFT' || artwork.status === 'ARCHIVED',
                  }"
                >
                  {{ STATUS_LABELS[artwork.status] }}
                </span>
              </div>
            </div>

            <NuxtLink
              v-if="artwork.artist"
              :to="`/artists/${artwork.artist.slug}`"
              class="inline-flex items-center gap-2 mt-2 text-gray-600 hover:text-gray-900"
            >
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  v-if="artwork.artist.avatarUrl"
                  :src="artwork.artist.avatarUrl"
                  :alt="artwork.artist.displayName"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-sm font-medium text-gray-500">
                  {{ artwork.artist.displayName?.charAt(0) }}
                </span>
              </div>
              <span class="font-medium">{{ artwork.artist.displayName }}</span>
              <svg
                v-if="artwork.artist.verified"
                class="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Price -->
          <div class="border-t border-b border-gray-200 py-6">
            <div v-if="artwork.price" class="flex items-baseline gap-3">
              <span class="text-3xl font-bold text-gray-900">
                {{ formatPrice(artwork.price, artwork.currency) }}
              </span>
              <span
                v-if="artwork.originalPrice && artwork.originalPrice > artwork.price"
                class="text-lg text-gray-400 line-through"
              >
                {{ formatPrice(artwork.originalPrice, artwork.currency) }}
              </span>
            </div>
            <span v-else class="text-xl text-gray-600">Price on request</span>

            <!-- Action Buttons -->
            <div v-if="artwork.status === 'AVAILABLE'" class="flex gap-3 mt-4">
              <button
                class="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Inquire About This Artwork
              </button>
              <button
                class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Add to favorites"
              >
                <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Details -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Details</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500">Medium</dt>
                <dd class="text-gray-900 font-medium">{{ MEDIUM_LABELS[artwork.medium] }}</dd>
              </div>
              <div v-if="artwork.year">
                <dt class="text-sm text-gray-500">Year</dt>
                <dd class="text-gray-900 font-medium">{{ artwork.year }}</dd>
              </div>
              <div v-if="artwork.width && artwork.height">
                <dt class="text-sm text-gray-500">Dimensions</dt>
                <dd class="text-gray-900 font-medium">{{ formatDimensions(artwork) }}</dd>
              </div>
              <div v-if="artwork.weight">
                <dt class="text-sm text-gray-500">Weight</dt>
                <dd class="text-gray-900 font-medium">{{ artwork.weight }} kg</dd>
              </div>
              <div v-if="artwork.style">
                <dt class="text-sm text-gray-500">Style</dt>
                <dd class="text-gray-900 font-medium">{{ artwork.style }}</dd>
              </div>
              <div v-if="artwork.category">
                <dt class="text-sm text-gray-500">Category</dt>
                <dd class="text-gray-900 font-medium">{{ artwork.category.name }}</dd>
              </div>
            </dl>
          </div>

          <!-- Description -->
          <div v-if="artwork.description" class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900">Description</h3>
            <p class="text-gray-600 whitespace-pre-line">{{ artwork.description }}</p>
          </div>

          <!-- Story -->
          <div v-if="artwork.story" class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900">The Story Behind</h3>
            <p class="text-gray-600 whitespace-pre-line">{{ artwork.story }}</p>
          </div>

          <!-- Tags -->
          <div v-if="artwork.tags && artwork.tags.length > 0" class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in artwork.tags"
                :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ artwork.viewCount }} views
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ artwork.likeCount }} likes
            </span>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900">Artwork not found</h2>
        <p class="text-gray-600 mt-2">The artwork you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/artworks"
          class="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse Gallery
        </NuxtLink>
      </div>
    </div>
  </div>
</template>