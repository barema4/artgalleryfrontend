<script setup lang="ts">
import type { Artwork, ArtworkListParams, ArtworkMedium } from '~/types/artwork'
import { MEDIUM_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'

const artworkService = useArtworkService()

const artworks = ref<Artwork[]>([])
const isLoading = ref(true)
const error = ref('')

const filters = reactive<ArtworkListParams>({
  page: 1,
  limit: 12,
  search: '',
  sortBy: 'newest',
  medium: undefined,
  minPrice: undefined,
  maxPrice: undefined,
})

const pagination = reactive({
  total: 0,
  totalPages: 0,
})

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title A-Z' },
]

const mediumOptions = Object.entries(MEDIUM_LABELS).map(([value, label]) => ({
  value: value as ArtworkMedium,
  label,
}))

async function fetchArtworks() {
  isLoading.value = true
  error.value = ''

  try {
    // Only fetch available artworks for public view
    const params = { ...filters, status: 'AVAILABLE' as const }
    const response = await artworkService.getArtworks(params)
    artworks.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artworks'
  } finally {
    isLoading.value = false
  }
}

function handleSearch() {
  filters.page = 1
  fetchArtworks()
}

function handleFilterChange() {
  filters.page = 1
  fetchArtworks()
}

function handlePageChange(page: number) {
  filters.page = page
  fetchArtworks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearFilters() {
  filters.search = ''
  filters.medium = undefined
  filters.minPrice = undefined
  filters.maxPrice = undefined
  filters.sortBy = 'newest'
  filters.page = 1
  fetchArtworks()
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

function getPrimaryImage(artwork: Artwork) {
  const primary = artwork.images?.find(img => img.isPrimary)
  return primary?.url || artwork.images?.[0]?.url
}

onMounted(() => {
  fetchArtworks()
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gallery</h1>
        <p class="text-gray-600 mt-2">Discover unique artworks from talented artists</p>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-8">
        <div class="flex flex-wrap items-end gap-4">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search artworks..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                @keyup.enter="handleSearch"
              />
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Medium -->
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Medium</label>
            <select
              v-model="filters.medium"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option :value="undefined">All Mediums</option>
              <option v-for="option in mediumOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Price Range -->
          <div class="w-32">
            <label class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              v-model.number="filters.minPrice"
              type="number"
              placeholder="$0"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            />
          </div>
          <div class="w-32">
            <label class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              v-model.number="filters.maxPrice"
              type="number"
              placeholder="Any"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            />
          </div>

          <!-- Sort -->
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              v-model="filters.sortBy"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button
              class="px-4 py-2 text-gray-600 hover:text-gray-900"
              @click="clearFilters"
            >
              Clear
            </button>
            <button
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              @click="handleSearch"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Artworks Grid -->
      <div v-else-if="artworks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <NuxtLink
          v-for="artwork in artworks"
          :key="artwork.id"
          :to="`/artworks/${artwork.slug}`"
          class="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
        >
          <!-- Image -->
          <div class="aspect-square bg-gray-100 relative overflow-hidden">
            <img
              v-if="getPrimaryImage(artwork)"
              :src="getPrimaryImage(artwork)"
              :alt="artwork.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-wrap gap-2">
              <span
                v-if="artwork.featured"
                class="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full"
              >
                Featured
              </span>
              <span
                v-if="artwork.status === 'SOLD'"
                class="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full"
              >
                Sold
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 truncate group-hover:text-gray-600 transition-colors">
              {{ artwork.title }}
            </h3>

            <!-- Artist -->
            <p v-if="artwork.artist" class="text-sm text-gray-500 mt-1">
              by {{ artwork.artist.displayName }}
            </p>

            <!-- Medium & Year -->
            <p class="text-xs text-gray-400 mt-1">
              {{ MEDIUM_LABELS[artwork.medium] }}
              <span v-if="artwork.year"> · {{ artwork.year }}</span>
            </p>

            <!-- Price -->
            <div class="mt-3 flex items-center justify-between">
              <div v-if="artwork.price">
                <span class="text-lg font-bold text-gray-900">
                  {{ formatPrice(artwork.price, artwork.currency) }}
                </span>
                <span
                  v-if="artwork.originalPrice && artwork.originalPrice > artwork.price"
                  class="text-sm text-gray-400 line-through ml-2"
                >
                  {{ formatPrice(artwork.originalPrice, artwork.currency) }}
                </span>
              </div>
              <span v-else class="text-gray-500">Price on request</span>
            </div>

            <!-- Dimensions -->
            <p v-if="artwork.width && artwork.height" class="text-xs text-gray-400 mt-2">
              {{ artwork.width }} × {{ artwork.height }}
              <span v-if="artwork.depth"> × {{ artwork.depth }}</span>
              cm
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900">No artworks found</h3>
        <p class="text-gray-500 mt-1">Try adjusting your search or filters</p>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          :disabled="filters.page === 1"
          @click="handlePageChange(filters.page! - 1)"
        >
          Previous
        </button>
        <span class="px-4 py-2 text-sm text-gray-600">
          Page {{ filters.page }} of {{ pagination.totalPages }}
        </span>
        <button
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          :disabled="filters.page === pagination.totalPages"
          @click="handlePageChange(filters.page! + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>