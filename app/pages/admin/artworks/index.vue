<script setup lang="ts">
import type { Artwork, ArtworkStatus } from '~/types/artwork'
import { MEDIUM_LABELS, STATUS_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const router = useRouter()
const artworkService = useArtworkService()
const authStore = useAuthStore()

function viewArtwork(artworkId: string) {
  router.push(`/admin/artworks/${artworkId}`)
}

const artworks = ref<Artwork[]>([])
const isLoading = ref(true)
const error = ref('')
const successMessage = ref('')

const filters = reactive({
  page: 1,
  limit: 20,
  status: undefined as ArtworkStatus | undefined,
  search: '',
  featured: undefined as boolean | undefined,
})

const pagination = reactive({
  total: 0,
  totalPages: 0,
})

async function fetchArtworks() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await artworkService.getArtworks(filters)
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
}

function getPrimaryImage(artwork: Artwork) {
  const primary = artwork.images?.find(img => img.isPrimary)
  return primary?.url || artwork.images?.[0]?.url
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

async function toggleFeatured(artwork: Artwork) {
  try {
    await artworkService.setArtworkFeatured(artwork.id, !artwork.featured)
    successMessage.value = `Artwork ${artwork.featured ? 'unfeatured' : 'featured'} successfully`
    fetchArtworks()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update featured status'
  }
}

async function updateStatus(artwork: Artwork, status: ArtworkStatus) {
  try {
    await artworkService.adminUpdateStatus(artwork.id, status)
    successMessage.value = 'Status updated successfully'
    fetchArtworks()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update status'
  }
}

onMounted(() => {
  if (!authStore.isAdmin) {
    navigateTo('/dashboard')
  } else {
    fetchArtworks()
  }
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Manage Artworks</h1>
        <p class="text-gray-600 mt-1">Review and moderate artwork listings</p>
      </div>

      <!-- Messages -->
      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap items-end gap-4">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search artworks..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- Status Filter -->
          <div class="w-40">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option :value="undefined">All</option>
              <option value="DRAFT">Draft</option>
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="ON_EXHIBITION">On Exhibition</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <!-- Featured Filter -->
          <div class="w-40">
            <label class="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <select
              v-model="filters.featured"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option :value="undefined">All</option>
              <option :value="true">Featured Only</option>
              <option :value="false">Not Featured</option>
            </select>
          </div>

          <button
            class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            @click="handleSearch"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Total</p>
          <p class="text-2xl font-bold text-gray-900">{{ pagination.total }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Draft</p>
          <p class="text-2xl font-bold text-gray-600">{{ artworks.filter(a => a.status === 'DRAFT').length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Available</p>
          <p class="text-2xl font-bold text-green-600">{{ artworks.filter(a => a.status === 'AVAILABLE').length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Sold</p>
          <p class="text-2xl font-bold text-red-600">{{ artworks.filter(a => a.status === 'SOLD').length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Featured</p>
          <p class="text-2xl font-bold text-yellow-600">{{ artworks.filter(a => a.featured).length }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Artworks Table -->
      <div v-else-if="artworks.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Artwork</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Artist</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Featured</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="artwork in artworks" :key="artwork.id" class="hover:bg-gray-50 cursor-pointer" @click="viewArtwork(artwork.id)">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      v-if="getPrimaryImage(artwork)"
                      :src="getPrimaryImage(artwork)"
                      :alt="artwork.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <NuxtLink
                      :to="`/artworks/${artwork.slug}`"
                      class="font-medium text-gray-900 hover:text-gray-600"
                    >
                      {{ artwork.title }}
                    </NuxtLink>
                    <p class="text-xs text-gray-500">{{ MEDIUM_LABELS[artwork.medium] }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <NuxtLink
                  v-if="artwork.artist"
                  :to="`/artists/${artwork.artist.slug}`"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  {{ artwork.artist.displayName }}
                </NuxtLink>
                <span v-else class="text-sm text-gray-400">Unknown</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="artwork.price" class="font-medium text-gray-900">
                  {{ formatPrice(artwork.price, artwork.currency) }}
                </span>
                <span v-else class="text-gray-500">Not set</span>
              </td>
              <td class="px-6 py-4" @click.stop>
                <select
                  :value="artwork.status"
                  class="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  @change="updateStatus(artwork, ($event.target as HTMLSelectElement).value as ArtworkStatus)"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="ON_EXHIBITION">On Exhibition</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <button
                  class="p-2 rounded-lg transition-colors"
                  :class="artwork.featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'"
                  @click.stop="toggleFeatured(artwork)"
                >
                  <svg class="w-5 h-5" :fill="artwork.featured ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="View details"
                    @click.stop="viewArtwork(artwork.id)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            Showing {{ (filters.page - 1) * filters.limit + 1 }} to {{ Math.min(filters.page * filters.limit, pagination.total) }} of {{ pagination.total }} artworks
          </p>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              :disabled="filters.page === 1"
              @click="handlePageChange(filters.page - 1)"
            >
              Previous
            </button>
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              :disabled="filters.page === pagination.totalPages"
              @click="handlePageChange(filters.page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900">No artworks found</h3>
        <p class="text-gray-500 mt-1">Try adjusting your filters</p>
      </div>
    </div>
  </div>
</template>