<script setup lang="ts">
import type { Artist, ArtistListParams } from '~/types/artist'
import { useArtistService } from '~/services/artist.service'

const artistService = useArtistService()

const artists = ref<Artist[]>([])
const isLoading = ref(true)
const error = ref('')

const filters = reactive<ArtistListParams>({
  page: 1,
  limit: 12,
  search: '',
  sortBy: 'newest',
  verified: undefined,
  featured: undefined,
})

const pagination = reactive({
  total: 0,
  totalPages: 0,
})

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'name', label: 'Name A-Z' },
]

async function fetchArtists() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await artistService.getArtists(filters)
    artists.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artists'
  } finally {
    isLoading.value = false
  }
}

function handleSearch() {
  filters.page = 1
  fetchArtists()
}

function handleSortChange() {
  filters.page = 1
  fetchArtists()
}

function handlePageChange(page: number) {
  filters.page = page
  fetchArtists()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchArtists()
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Artists</h1>
        <p class="text-gray-600 mt-2">Discover talented artists and their work</p>
      </div>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-8">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search artists..."
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

          <!-- Sort -->
          <div>
            <select
              v-model="filters.sortBy"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleSortChange"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Verified Filter -->
          <button
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="filters.verified ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'"
            @click="filters.verified = filters.verified ? undefined : true; handleSearch()"
          >
            Verified Only
          </button>

          <!-- Search Button -->
          <button
            class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            @click="handleSearch"
          >
            Search
          </button>
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

      <!-- Artists Grid -->
      <div v-else-if="artists.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <NuxtLink
          v-for="artist in artists"
          :key="artist.id"
          :to="`/artists/${artist.slug}`"
          class="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          <!-- Cover Image -->
          <div class="aspect-[3/2] bg-gray-100 relative overflow-hidden">
            <img
              v-if="artist.coverImage"
              :src="artist.coverImage"
              :alt="artist.displayName"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Badges -->
            <div class="absolute top-3 left-3 flex gap-2">
              <span
                v-if="artist.verified"
                class="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Verified
              </span>
              <span
                v-if="artist.featured"
                class="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full"
              >
                Featured
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <!-- Profile Image + Name -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                  v-if="artist.profileImage"
                  :src="artist.profileImage"
                  :alt="artist.displayName"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-lg font-bold text-gray-400">
                    {{ artist.displayName?.[0]?.toUpperCase() || 'A' }}
                  </span>
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-gray-900 truncate">{{ artist.displayName }}</h3>
                <p class="text-sm text-gray-500">{{ artist.artworkCount }} artworks</p>
              </div>
            </div>

            <!-- Bio -->
            <p v-if="artist.bio" class="text-sm text-gray-600 line-clamp-2">
              {{ artist.bio }}
            </p>

            <!-- Stats -->
            <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">
                <span class="font-medium text-gray-900">{{ artist.followerCount }}</span> followers
              </span>
              <span class="text-sm text-gray-500">
                <span class="font-medium text-gray-900">{{ artist.viewCount }}</span> views
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900">No artists found</h3>
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