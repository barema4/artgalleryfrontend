<script setup lang="ts">
import type { Artwork, ArtworkListParams, ArtworkMedium } from '~/types/artwork'
import type { Category } from '~/types/category'
import { MEDIUM_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'
import { useCategoriesStore } from '~/stores/categories'

const artworkService = useArtworkService()
const categoriesStore = useCategoriesStore()

const artworks = ref<Artwork[]>([])
const isLoading = ref(true)
const error = ref('')
const showMobileFilters = ref(false)

function findCategoryInTree(categories: Category[], slug: string): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category
    }
    if (category.children?.length) {
      const found = findCategoryInTree(category.children, slug)
      if (found) return found
    }
  }
  return undefined
}

const filters = reactive<ArtworkListParams>({
  page: 1,
  limit: 12,
  search: '',
  sortBy: 'newest',
  medium: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  categoryId: undefined,
  tags: undefined,
})

const selectedCategorySlug = ref<string | null>(null)
const selectedTagSlug = ref<string | null>(null)

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
  filters.categoryId = undefined
  filters.tags = undefined
  filters.sortBy = 'newest'
  filters.page = 1
  selectedCategorySlug.value = null
  selectedTagSlug.value = null
  fetchArtworks()
}

function handleCategorySelect(categorySlug: string | null) {
  selectedCategorySlug.value = categorySlug
  if (categorySlug) {
    const category = findCategoryInTree(categoriesStore.categoryTree, categorySlug)
    filters.categoryId = category?.id
  } else {
    filters.categoryId = undefined
  }
  filters.page = 1
  fetchArtworks()
}

function handleTagSelect(tagSlug: string | null) {
  selectedTagSlug.value = tagSlug
  if (tagSlug) {
    const tag = categoriesStore.tags.find(t => t.slug === tagSlug)
    filters.tags = tag ? [tag.name] : undefined
  } else {
    filters.tags = undefined
  }
  filters.page = 1
  fetchArtworks()
}

function toggleMobileFilters() {
  showMobileFilters.value = !showMobileFilters.value
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
  categoriesStore.fetchCategoryTree()
  categoriesStore.fetchPopularTags()
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-bark-800">Gallery</h1>
        <p class="text-bark-500 mt-2">Discover unique artworks from talented artists</p>
      </div>

      <button
        class="lg:hidden w-full mb-4 px-4 py-3 bg-white border border-earth-200 rounded-xl flex items-center justify-between text-bark-700"
        @click="toggleMobileFilters"
      >
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters & Categories
        </span>
        <svg
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': showMobileFilters }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div class="flex flex-col lg:flex-row gap-8">
        <aside
          class="lg:w-72 flex-shrink-0 space-y-6"
          :class="{ 'hidden lg:block': !showMobileFilters }"
        >
          <UiCategoryFilter
            :categories="categoriesStore.categoryTree"
            :selected-slug="selectedCategorySlug"
            :loading="categoriesStore.loading"
            @select="handleCategorySelect"
          />

          <UiTagCloud
            :tags="categoriesStore.popularTags"
            :selected-slug="selectedTagSlug"
            :loading="categoriesStore.loading"
            @select="handleTagSelect"
          />
        </aside>

        <div class="flex-1 min-w-0">
          <div class="bg-white border border-earth-100 rounded-2xl p-4 mb-6">
            <div class="flex flex-wrap items-end gap-4">
              <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-bark-700 mb-1">Search</label>
                <div class="relative">
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="Search artworks..."
                    class="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    @keyup.enter="handleSearch"
                  />
                  <svg
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div class="w-48">
                <label class="block text-sm font-medium text-bark-700 mb-1">Medium</label>
                <select
                  v-model="filters.medium"
                  class="w-full px-4 py-2 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  @change="handleFilterChange"
                >
                  <option :value="undefined">All Mediums</option>
                  <option v-for="option in mediumOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="w-32">
                <label class="block text-sm font-medium text-bark-700 mb-1">Min Price</label>
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  placeholder="$0"
                  class="w-full px-4 py-2 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  @change="handleFilterChange"
                />
              </div>
              <div class="w-32">
                <label class="block text-sm font-medium text-bark-700 mb-1">Max Price</label>
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  placeholder="Any"
                  class="w-full px-4 py-2 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  @change="handleFilterChange"
                />
              </div>

              <div class="w-48">
                <label class="block text-sm font-medium text-bark-700 mb-1">Sort By</label>
                <select
                  v-model="filters.sortBy"
                  class="w-full px-4 py-2 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  @change="handleFilterChange"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="flex gap-2">
                <button
                  class="px-4 py-2 text-bark-500 hover:text-bark-700 transition-colors"
                  @click="clearFilters"
                >
                  Clear
                </button>
                <button
                  class="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                  @click="handleSearch"
                >
                  Search
                </button>
              </div>
            </div>

            <div v-if="selectedCategorySlug || selectedTagSlug" class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-earth-100">
              <span class="text-sm text-bark-500">Active filters:</span>
              <span
                v-if="selectedCategorySlug"
                class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                Category: {{ findCategoryInTree(categoriesStore.categoryTree, selectedCategorySlug)?.name }}
                <button class="hover:text-primary-900" @click="handleCategorySelect(null)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
              <span
                v-if="selectedTagSlug"
                class="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
              >
                Tag: #{{ categoriesStore.tags.find(t => t.slug === selectedTagSlug)?.name }}
                <button class="hover:text-secondary-900" @click="handleTagSelect(null)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>

          <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
            {{ error }}
          </UiAlert>

          <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white border border-earth-100 rounded-2xl overflow-hidden">
              <div class="aspect-square bg-earth-100 animate-pulse" />
              <div class="p-4 space-y-3">
                <div class="h-5 bg-earth-100 rounded animate-pulse w-3/4" />
                <div class="h-4 bg-earth-100 rounded animate-pulse w-1/2" />
                <div class="h-4 bg-earth-100 rounded animate-pulse w-1/3" />
              </div>
            </div>
          </div>

          <div v-else-if="artworks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <NuxtLink
              v-for="artwork in artworks"
              :key="artwork.id"
              :to="`/artworks/${artwork.slug}`"
              class="group bg-white border border-earth-100 rounded-2xl overflow-hidden hover:shadow-warm-lg hover:border-earth-200 transition-all duration-300"
            >
              <div class="aspect-square bg-earth-100 relative overflow-hidden">
                <img
                  v-if="getPrimaryImage(artwork)"
                  :src="getPrimaryImage(artwork)"
                  :alt="artwork.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-16 h-16 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span
                    v-if="artwork.featured"
                    class="px-2 py-1 bg-kente-gold text-white text-xs font-medium rounded-full"
                  >
                    Featured
                  </span>
                  <span
                    v-if="artwork.status === 'SOLD'"
                    class="px-2 py-1 bg-kente-red text-white text-xs font-medium rounded-full"
                  >
                    Sold
                  </span>
                </div>

                <div v-if="artwork.category" class="absolute bottom-3 left-3">
                  <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-bark-700 text-xs font-medium rounded-full">
                    {{ artwork.category.name }}
                  </span>
                </div>
              </div>

              <div class="p-4">
                <h3 class="font-semibold text-bark-800 truncate group-hover:text-primary-600 transition-colors">
                  {{ artwork.title }}
                </h3>

                <p v-if="artwork.artist" class="text-sm text-bark-500 mt-1">
                  by {{ artwork.artist.displayName }}
                </p>

                <p class="text-xs text-bark-400 mt-1">
                  {{ MEDIUM_LABELS[artwork.medium] }}
                  <span v-if="artwork.year"> · {{ artwork.year }}</span>
                </p>

                <div v-if="artwork.tags?.length" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="tag in artwork.tags.slice(0, 3)"
                    :key="tag"
                    class="text-xs text-bark-500 bg-earth-100 px-2 py-0.5 rounded-full"
                  >
                    #{{ tag }}
                  </span>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <div v-if="artwork.price">
                    <span class="text-lg font-bold text-bark-800">
                      {{ formatPrice(artwork.price, artwork.currency) }}
                    </span>
                    <span
                      v-if="artwork.originalPrice && artwork.originalPrice > artwork.price"
                      class="text-sm text-bark-400 line-through ml-2"
                    >
                      {{ formatPrice(artwork.originalPrice, artwork.currency) }}
                    </span>
                  </div>
                  <span v-else class="text-bark-500">Price on request</span>
                </div>

                <p v-if="artwork.width && artwork.height" class="text-xs text-bark-400 mt-2">
                  {{ artwork.width }} × {{ artwork.height }}
                  <span v-if="artwork.depth"> × {{ artwork.depth }}</span>
                  cm
                </p>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="bg-white rounded-2xl border border-earth-100 py-16 text-center">
            <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium text-bark-700">No artworks found</h3>
            <p class="text-bark-500 mt-1">Try adjusting your search or filters</p>
          </div>

          <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button
              class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="filters.page === 1"
              @click="handlePageChange((filters.page || 1) - 1)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="flex items-center gap-1">
              <button
                v-for="page in pagination.totalPages"
                :key="page"
                class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
                :class="page === filters.page
                  ? 'bg-primary-500 text-white'
                  : 'text-bark-600 hover:bg-earth-100'"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="filters.page === pagination.totalPages"
              @click="handlePageChange((filters.page || 1) + 1)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>