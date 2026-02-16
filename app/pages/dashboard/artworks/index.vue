<script setup lang="ts">
import type { Artwork, ArtworkStatus } from '~/types/artwork'
import { MEDIUM_LABELS, STATUS_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const artworkService = useArtworkService()
const authStore = useAuthStore()

const artworks = ref<Artwork[]>([])
const isLoading = ref(true)
const error = ref('')
const successMessage = ref('')

const filters = reactive({
  page: 1,
  limit: 10,
  status: undefined as ArtworkStatus | undefined,
  search: '',
})

const pagination = reactive({
  total: 0,
  totalPages: 0,
})

const deleteModal = reactive({
  isOpen: false,
  artwork: null as Artwork | null,
  isDeleting: false,
})

async function fetchArtworks() {
  isLoading.value = true
  error.value = ''

  try {
    const params = {
      ...filters,
      artistId: authStore.user?.artistProfile?.id,
    }
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

function openDeleteModal(artwork: Artwork) {
  deleteModal.artwork = artwork
  deleteModal.isOpen = true
}

function closeDeleteModal() {
  deleteModal.isOpen = false
  deleteModal.artwork = null
}

async function confirmDelete() {
  if (!deleteModal.artwork) return

  deleteModal.isDeleting = true
  try {
    await artworkService.deleteArtwork(deleteModal.artwork.id)
    successMessage.value = 'Artwork deleted successfully'
    closeDeleteModal()
    fetchArtworks()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete artwork'
  } finally {
    deleteModal.isDeleting = false
  }
}

async function publishArtwork(artwork: Artwork) {
  try {
    await artworkService.publishArtwork(artwork.id)
    successMessage.value = 'Artwork published successfully'
    fetchArtworks()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish artwork'
  }
}

async function updateStatus(artwork: Artwork, status: ArtworkStatus) {
  try {
    await artworkService.updateArtworkStatus(artwork.id, status)
    successMessage.value = 'Status updated successfully'
    fetchArtworks()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update status'
  }
}

onMounted(() => {
  if (!authStore.isArtist) {
    navigateTo('/dashboard/artist-profile')
  } else {
    fetchArtworks()
  }
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">My Artworks</h1>
          <p class="text-gray-600 mt-1">Manage your artwork collection</p>
        </div>
        <NuxtLink
          to="/dashboard/artworks/new"
          class="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Artwork
        </NuxtLink>
      </div>

      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search your artworks..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @change="handleFilterChange"
            >
              <option :value="undefined">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="ON_EXHIBITION">On Exhibition</option>
              <option value="ARCHIVED">Archived</option>
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

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <div v-else-if="artworks.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Artwork</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Medium</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Stats</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="artwork in artworks" :key="artwork.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      v-if="getPrimaryImage(artwork)"
                      :src="getPrimaryImage(artwork)"
                      :alt="artwork.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <NuxtLink
                      :to="`/artworks/${artwork.slug}`"
                      class="font-medium text-gray-900 hover:text-gray-600"
                    >
                      {{ artwork.title }}
                    </NuxtLink>
                    <p v-if="artwork.year" class="text-sm text-gray-500">{{ artwork.year }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ MEDIUM_LABELS[artwork.medium] }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="artwork.price" class="font-medium text-gray-900">
                  {{ formatPrice(artwork.price, artwork.currency) }}
                </span>
                <span v-else class="text-gray-500">Not set</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-gray-100 text-gray-700': artwork.status === 'DRAFT',
                    'bg-green-100 text-green-700': artwork.status === 'AVAILABLE',
                    'bg-red-100 text-red-700': artwork.status === 'SOLD',
                    'bg-blue-100 text-blue-700': artwork.status === 'ON_EXHIBITION',
                    'bg-yellow-100 text-yellow-700': artwork.status === 'ARCHIVED',
                  }"
                >
                  {{ STATUS_LABELS[artwork.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div class="flex items-center gap-4">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {{ artwork.viewCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {{ artwork.likeCount }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/dashboard/artworks/${artwork.id}/edit`"
                    class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </NuxtLink>

                  <button
                    v-if="artwork.status === 'DRAFT'"
                    class="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                    title="Publish"
                    @click="publishArtwork(artwork)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <button
                    v-if="artwork.status === 'AVAILABLE'"
                    class="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg"
                    title="Mark as Sold"
                    @click="updateStatus(artwork, 'SOLD')"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <button
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    title="Delete"
                    @click="openDeleteModal(artwork)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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

      <div v-else class="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900">No artworks yet</h3>
        <p class="text-gray-500 mt-1">Get started by adding your first artwork</p>
        <NuxtLink
          to="/dashboard/artworks/new"
          class="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add Artwork
        </NuxtLink>
      </div>

      <Teleport to="body">
        <div
          v-if="deleteModal.isOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/50" @click="closeDeleteModal"></div>
          <div class="relative bg-white rounded-xl p-6 max-w-md w-full">
            <h3 class="text-lg font-semibold text-gray-900">Delete Artwork</h3>
            <p class="text-gray-600 mt-2">
              Are you sure you want to delete "{{ deleteModal.artwork?.title }}"? This action cannot be undone.
            </p>
            <div class="flex gap-3 mt-6">
              <button
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                :disabled="deleteModal.isDeleting"
                @click="closeDeleteModal"
              >
                Cancel
              </button>
              <button
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                :disabled="deleteModal.isDeleting"
                @click="confirmDelete"
              >
                {{ deleteModal.isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>