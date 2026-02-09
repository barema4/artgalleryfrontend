<script setup lang="ts">
import type { Artwork, ArtworkStatus, ArtworkStats } from '~/types/artwork'
import { MEDIUM_LABELS, STATUS_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const artworkService = useArtworkService()

const artworkId = computed(() => route.params.id as string)

const artwork = ref<Artwork | null>(null)
const stats = ref<ArtworkStats | null>(null)
const isLoading = ref(true)
const error = ref('')
const successMessage = ref('')

// Status update
const showStatusModal = ref(false)
const newStatus = ref<ArtworkStatus>('AVAILABLE')
const isUpdating = ref(false)

// Delete confirmation
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const statusOptions: { value: ArtworkStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'SOLD', label: 'Sold', color: 'bg-red-100 text-red-800' },
  { value: 'ON_EXHIBITION', label: 'On Exhibition', color: 'bg-blue-100 text-blue-800' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-gray-100 text-gray-600' },
]

async function fetchArtwork() {
  isLoading.value = true
  error.value = ''

  try {
    // Fetch artwork - we need to find by ID from the list
    const response = await artworkService.getArtworks({ limit: 100 })
    artwork.value = response.data.find(a => a.id === artworkId.value) || null

    if (artwork.value) {
      newStatus.value = artwork.value.status
      // Fetch stats
      try {
        stats.value = await artworkService.getArtworkStats(artwork.value.id)
      } catch {
        // Stats might not be available
      }
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artwork'
  } finally {
    isLoading.value = false
  }
}

function openStatusModal() {
  if (artwork.value) {
    newStatus.value = artwork.value.status
    showStatusModal.value = true
  }
}

async function updateStatus() {
  if (!artwork.value) return

  isUpdating.value = true
  error.value = ''

  try {
    const updated = await artworkService.adminUpdateStatus(artwork.value.id, newStatus.value)
    artwork.value = updated
    showStatusModal.value = false
    successMessage.value = 'Status updated successfully'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update status'
  } finally {
    isUpdating.value = false
  }
}

async function toggleFeatured() {
  if (!artwork.value) return

  isUpdating.value = true
  error.value = ''

  try {
    const updated = await artworkService.setArtworkFeatured(artwork.value.id, !artwork.value.featured)
    artwork.value = updated
    successMessage.value = artwork.value.featured ? 'Artwork featured' : 'Artwork unfeatured'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update featured status'
  } finally {
    isUpdating.value = false
  }
}

async function deleteArtwork() {
  if (!artwork.value) return

  isDeleting.value = true
  error.value = ''

  try {
    await artworkService.deleteArtwork(artwork.value.id)
    router.push('/admin/artworks')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete artwork'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin/artworks')
  }
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

function formatDimensions(artwork: Artwork) {
  const parts = []
  if (artwork.width && artwork.height) {
    parts.push(`${artwork.width} × ${artwork.height}`)
    if (artwork.depth) {
      parts.push(` × ${artwork.depth}`)
    }
    parts.push(' cm')
  }
  return parts.join('') || '—'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusColor(status: ArtworkStatus): string {
  return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchArtwork()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Back Button -->
      <button
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Artworks
      </button>

      <!-- Messages -->
      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Artwork Details -->
      <template v-else-if="artwork">
        <!-- Header Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div class="flex gap-6">
            <!-- Image -->
            <div class="w-48 h-48 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
              <img
                v-if="getPrimaryImage(artwork)"
                :src="getPrimaryImage(artwork)"
                :alt="artwork.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-2xl font-bold text-gray-900">{{ artwork.title }}</h1>
                    <span
                      class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                      :class="getStatusColor(artwork.status)"
                    >
                      {{ STATUS_LABELS[artwork.status] }}
                    </span>
                    <span
                      v-if="artwork.featured"
                      class="inline-flex px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full"
                    >
                      Featured
                    </span>
                  </div>

                  <NuxtLink
                    v-if="artwork.artist"
                    :to="`/admin/artists/${artwork.artist.id}`"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    by {{ artwork.artist.displayName }}
                  </NuxtLink>

                  <div class="mt-4 flex items-center gap-6 text-sm">
                    <div>
                      <span class="text-gray-500">Price:</span>
                      <span class="ml-1 font-semibold text-gray-900">
                        {{ artwork.price ? formatPrice(artwork.price, artwork.currency) : 'Not set' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500">Medium:</span>
                      <span class="ml-1 font-medium text-gray-900">{{ MEDIUM_LABELS[artwork.medium] }}</span>
                    </div>
                    <div v-if="artwork.year">
                      <span class="text-gray-500">Year:</span>
                      <span class="ml-1 font-medium text-gray-900">{{ artwork.year }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <button
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    @click="openStatusModal"
                  >
                    Change Status
                  </button>
                  <button
                    class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                    :class="artwork.featured
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                    :disabled="isUpdating"
                    @click="toggleFeatured"
                  >
                    {{ artwork.featured ? 'Unfeature' : 'Feature' }}
                  </button>
                  <NuxtLink
                    :to="`/artworks/${artwork.slug}`"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Public
                  </NuxtLink>
                  <button
                    class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    @click="showDeleteModal = true"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.viewCount || artwork.viewCount || 0 }}</p>
                <p class="text-xs text-gray-500">Views</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.likeCount || artwork.likeCount || 0 }}</p>
                <p class="text-xs text-gray-500">Likes</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.shareCount || 0 }}</p>
                <p class="text-xs text-gray-500">Shares</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.inquiryCount || 0 }}</p>
                <p class="text-xs text-gray-500">Inquiries</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <!-- Artwork Details -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Artwork Details</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">Artwork ID</dt>
                <dd class="text-gray-900 font-mono text-sm">{{ artwork.id }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Slug</dt>
                <dd class="text-gray-900">{{ artwork.slug }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Medium</dt>
                <dd class="text-gray-900">{{ MEDIUM_LABELS[artwork.medium] }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Dimensions</dt>
                <dd class="text-gray-900">{{ formatDimensions(artwork) }}</dd>
              </div>
              <div v-if="artwork.weight">
                <dt class="text-sm text-gray-500">Weight</dt>
                <dd class="text-gray-900">{{ artwork.weight }} kg</dd>
              </div>
              <div v-if="artwork.year">
                <dt class="text-sm text-gray-500">Year</dt>
                <dd class="text-gray-900">{{ artwork.year }}</dd>
              </div>
              <div v-if="artwork.style">
                <dt class="text-sm text-gray-500">Style</dt>
                <dd class="text-gray-900">{{ artwork.style }}</dd>
              </div>
            </dl>
          </div>

          <!-- Pricing & Status -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Pricing & Status</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">Price</dt>
                <dd class="text-gray-900 text-xl font-bold">
                  {{ artwork.price ? formatPrice(artwork.price, artwork.currency) : 'Not set' }}
                </dd>
              </div>
              <div v-if="artwork.originalPrice && artwork.originalPrice !== artwork.price">
                <dt class="text-sm text-gray-500">Original Price</dt>
                <dd class="text-gray-400 line-through">
                  {{ formatPrice(artwork.originalPrice, artwork.currency) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd>
                  <span
                    class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="getStatusColor(artwork.status)"
                  >
                    {{ STATUS_LABELS[artwork.status] }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Featured</dt>
                <dd class="text-gray-900">{{ artwork.featured ? 'Yes' : 'No' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Created</dt>
                <dd class="text-gray-900">{{ formatDate(artwork.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Last Updated</dt>
                <dd class="text-gray-900">{{ formatDate(artwork.updatedAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Description -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p class="text-gray-600 whitespace-pre-line">{{ artwork.description || '—' }}</p>
          </div>

          <!-- Story -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Story</h2>
            <p class="text-gray-600 whitespace-pre-line">{{ artwork.story || '—' }}</p>
          </div>
        </div>

        <!-- Images Gallery -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Images ({{ artwork.images?.length || 0 }})</h2>
          <div v-if="artwork.images && artwork.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="image in artwork.images"
              :key="image.id"
              class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <img
                :src="image.url"
                :alt="image.altText || artwork.title"
                class="w-full h-full object-cover"
              />
              <div
                v-if="image.isPrimary"
                class="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded"
              >
                Primary
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-center py-8">No images uploaded</p>
        </div>

        <!-- Tags -->
        <div v-if="artwork.tags && artwork.tags.length > 0" class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
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
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900">Artwork not found</h2>
        <p class="text-gray-600 mt-2">The artwork you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/admin/artworks"
          class="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Artworks
        </NuxtLink>
      </div>

      <!-- Status Modal -->
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showStatusModal = false"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Update Artwork Status</h3>
          <p class="text-sm text-gray-600 mb-4">
            Changing status for: <span class="font-medium">{{ artwork?.title }}</span>
          </p>
          <div class="space-y-2 mb-6">
            <label
              v-for="option in statusOptions"
              :key="option.value"
              class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="newStatus === option.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200'"
            >
              <input
                v-model="newStatus"
                type="radio"
                :value="option.value"
                class="w-4 h-4 text-gray-900"
              />
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="option.color"
                >
                  {{ option.label }}
                </span>
              </div>
            </label>
          </div>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              :disabled="isUpdating"
              @click="showStatusModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              :disabled="isUpdating"
              @click="updateStatus"
            >
              {{ isUpdating ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Delete Artwork</h3>
              <p class="text-sm text-gray-600">This action cannot be undone.</p>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete <span class="font-medium">"{{ artwork?.title }}"</span>?
            This will permanently remove the artwork and all its images.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              :disabled="isDeleting"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              :disabled="isDeleting"
              @click="deleteArtwork"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Artwork' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>