<script setup lang="ts">
import { ExhibitionStatus, ExhibitionType } from '~/types/exhibition'
import type { ExhibitionListParams } from '~/types/exhibition'
import { useExhibitionsStore } from '~/stores/exhibitions'

const exhibitionsStore = useExhibitionsStore()
const route = useRoute()
const router = useRouter()

const filters = ref<ExhibitionListParams>({
  page: 1,
  limit: 12,
  search: '',
  status: undefined,
  type: undefined,
  featured: undefined,
  live: undefined,
  upcoming: undefined,
  sortBy: 'newest',
})

const showFilters = ref(false)

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Live', value: ExhibitionStatus.LIVE },
  { label: 'Upcoming', value: ExhibitionStatus.SCHEDULED },
  { label: 'Ended', value: ExhibitionStatus.ENDED },
]

const typeOptions = [
  { label: 'All Types', value: undefined },
  { label: 'Virtual Tour', value: ExhibitionType.VIRTUAL_TOUR },
  { label: 'Gallery', value: ExhibitionType.GALLERY },
  { label: 'Featured', value: ExhibitionType.FEATURED },
  { label: 'Pop-up', value: ExhibitionType.POPUP },
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Start Date', value: 'start_date' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Title A-Z', value: 'title' },
]

async function fetchExhibitions() {
  await exhibitionsStore.fetchExhibitions(filters.value)
}

function applyFilters() {
  filters.value.page = 1
  updateQueryParams()
  fetchExhibitions()
}

function clearFilters() {
  filters.value = {
    page: 1,
    limit: 12,
    search: '',
    status: undefined,
    type: undefined,
    featured: undefined,
    live: undefined,
    upcoming: undefined,
    sortBy: 'newest',
  }
  updateQueryParams()
  fetchExhibitions()
}

function updateQueryParams() {
  const query: Record<string, string> = {}
  if (filters.value.search) query.search = filters.value.search
  if (filters.value.status) query.status = filters.value.status
  if (filters.value.type) query.type = filters.value.type
  if (filters.value.featured !== undefined) query.featured = String(filters.value.featured)
  if (filters.value.sortBy && filters.value.sortBy !== 'newest') query.sortBy = filters.value.sortBy
  if (filters.value.page && filters.value.page > 1) query.page = String(filters.value.page)
  
  router.push({ query })
}

function goToPage(page: number) {
  filters.value.page = page
  updateQueryParams()
  fetchExhibitions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case ExhibitionStatus.LIVE:
      return 'bg-green-100 text-green-800'
    case ExhibitionStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-800'
    case ExhibitionStatus.ENDED:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case ExhibitionStatus.LIVE:
      return 'Live Now'
    case ExhibitionStatus.SCHEDULED:
      return 'Upcoming'
    case ExhibitionStatus.ENDED:
      return 'Ended'
    default:
      return status
  }
}

onMounted(() => {
  // Parse query params
  if (route.query.search) filters.value.search = route.query.search as string
  if (route.query.status) filters.value.status = route.query.status as ExhibitionStatus
  if (route.query.type) filters.value.type = route.query.type as ExhibitionType
  if (route.query.featured) filters.value.featured = route.query.featured === 'true'
  if (route.query.sortBy) filters.value.sortBy = route.query.sortBy as any
  if (route.query.page) filters.value.page = parseInt(route.query.page as string)
  
  fetchExhibitions()
})

useHead({
  title: 'Exhibitions | ArtGallery',
  meta: [
    { name: 'description', content: 'Explore curated art exhibitions featuring works from talented artists around the world.' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Exhibitions</h1>
        <p class="text-lg text-gray-600">Discover curated art exhibitions from around the world</p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search exhibitions..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="applyFilters"
            />
          </div>

          <!-- Quick Filters -->
          <div class="flex flex-wrap gap-2">
            <button
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="!filters.live && !filters.upcoming ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="filters.live = undefined; filters.upcoming = undefined; applyFilters()"
            >
              All
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="filters.live ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="filters.live = !filters.live; filters.upcoming = undefined; applyFilters()"
            >
              Live Now
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="filters.upcoming ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="filters.upcoming = !filters.upcoming; filters.live = undefined; applyFilters()"
            >
              Upcoming
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              @click="showFilters = !showFilters"
            >
              <svg class="w-5 h-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                v-model="filters.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="opt in statusOptions" :key="opt.label" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                v-model="filters.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="opt in typeOptions" :key="opt.label" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                v-model="filters.sortBy"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 mt-4">
            <button
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              @click="applyFilters"
            >
              Apply Filters
            </button>
            <button
              class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              @click="clearFilters"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="exhibitionsStore.loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="exhibitionsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800">{{ exhibitionsStore.error }}</p>
        <button
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          @click="fetchExhibitions"
        >
          Try Again
        </button>
      </div>

      <!-- Exhibitions Grid -->
      <div v-else-if="exhibitionsStore.exhibitions.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <NuxtLink
            v-for="exhibition in exhibitionsStore.exhibitions"
            :key="exhibition.id"
            :to="`/exhibitions/${exhibition.slug}`"
            class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="aspect-[4/3] bg-gray-200 overflow-hidden relative">
              <img
                v-if="exhibition.coverImage"
                :src="exhibition.coverImage"
                :alt="exhibition.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <!-- Status Badge -->
              <div class="absolute top-3 right-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getStatusBadgeClass(exhibition.status)"
                >
                  {{ getStatusLabel(exhibition.status) }}
                </span>
              </div>

              <!-- Featured Badge -->
              <div v-if="exhibition.featured" class="absolute top-3 left-3">
                <span class="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold">
                  Featured
                </span>
              </div>
            </div>

            <div class="p-5">
              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {{ exhibition.title }}
              </h3>

              <p v-if="exhibition.shortDescription" class="text-gray-600 text-sm mb-3 line-clamp-2">
                {{ exhibition.shortDescription }}
              </p>

              <!-- Dates -->
              <div v-if="exhibition.startDate || exhibition.endDate" class="text-sm text-gray-500 mb-3">
                <svg class="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span v-if="exhibition.startDate">{{ formatDate(exhibition.startDate) }}</span>
                <span v-if="exhibition.startDate && exhibition.endDate"> - </span>
                <span v-if="exhibition.endDate">{{ formatDate(exhibition.endDate) }}</span>
              </div>

              <!-- Stats -->
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ exhibition.artworkCount }} works
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ exhibition.artistCount }} artists
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="exhibitionsStore.pagination.totalPages > 1" class="flex justify-center gap-2">
          <button
            :disabled="exhibitionsStore.pagination.page === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="goToPage(exhibitionsStore.pagination.page - 1)"
          >
            Previous
          </button>

          <button
            v-for="page in exhibitionsStore.pagination.totalPages"
            :key="page"
            class="px-4 py-2 border rounded-lg transition-colors"
            :class="page === exhibitionsStore.pagination.page ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:bg-gray-50'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            :disabled="exhibitionsStore.pagination.page === exhibitionsStore.pagination.totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="goToPage(exhibitionsStore.pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No exhibitions found</h3>
        <p class="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
        <button
          class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>
  </div>
</template>
