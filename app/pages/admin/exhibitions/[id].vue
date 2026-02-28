<script setup lang="ts">
import { ExhibitionType, ExhibitionStatus } from '~/types/exhibition'
import type { Exhibition, CreateExhibitionData, UpdateExhibitionData } from '~/types/exhibition'
import { useExhibitionService } from '~/services/exhibition.service'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const exhibitionService = useExhibitionService()

const exhibitionId = computed(() => route.params.id as string)
const isNew = computed(() => exhibitionId.value === 'new')

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')

const exhibition = ref<Exhibition | null>(null)

const form = reactive({
  slug: '',
  title: '',
  description: '',
  shortDescription: '',
  coverImage: '',
  type: ExhibitionType.GALLERY,
  startDate: '',
  endDate: '',
  featured: false,
})

const showDeleteModal = ref(false)
const isDeleting = ref(false)

async function fetchExhibition() {
  if (isNew.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await exhibitionService.getExhibitionById(exhibitionId.value)
    exhibition.value = data

    form.slug = data.slug
    form.title = data.title
    form.description = data.description || ''
    form.shortDescription = data.shortDescription || ''
    form.coverImage = data.coverImage || ''
    form.type = data.type
    form.startDate = data.startDate ? formatDateForInput(data.startDate) : ''
    form.endDate = data.endDate ? formatDateForInput(data.endDate) : ''
    form.featured = data.featured
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch exhibition'
  } finally {
    isLoading.value = false
  }
}

function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

watch(() => form.title, (title) => {
  if (isNew.value) {
    form.slug = generateSlug(title)
  }
})

async function saveExhibition() {
  if (!form.title || !form.slug) {
    error.value = 'Title and slug are required'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (isNew.value) {
      const data: CreateExhibitionData = {
        slug: form.slug,
        title: form.title,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        coverImage: form.coverImage || undefined,
        type: form.type,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }
      const newExhibition = await exhibitionService.createExhibition(data)
      successMessage.value = 'Exhibition created successfully'
      setTimeout(() => {
        router.push(`/admin/exhibitions/${newExhibition.id}`)
      }, 1000)
    } else {
      const data: UpdateExhibitionData = {
        title: form.title,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        coverImage: form.coverImage || undefined,
        type: form.type,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }
      await exhibitionService.updateExhibition(exhibitionId.value, data)
      successMessage.value = 'Exhibition updated successfully'
      await fetchExhibition()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save exhibition'
  } finally {
    isSaving.value = false
  }
}

async function publishExhibition() {
  try {
    await exhibitionService.publishExhibition(exhibitionId.value)
    successMessage.value = 'Exhibition published successfully'
    await fetchExhibition()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish exhibition'
  }
}

async function goLiveExhibition() {
  try {
    await exhibitionService.goLiveExhibition(exhibitionId.value)
    successMessage.value = 'Exhibition is now live!'
    await fetchExhibition()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to go live'
  }
}

async function endExhibition() {
  try {
    await exhibitionService.endExhibition(exhibitionId.value)
    successMessage.value = 'Exhibition ended'
    await fetchExhibition()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to end exhibition'
  }
}

async function toggleFeatured() {
  try {
    await exhibitionService.setExhibitionFeatured(exhibitionId.value, !exhibition.value?.featured)
    successMessage.value = exhibition.value?.featured ? 'Removed from featured' : 'Marked as featured'
    await fetchExhibition()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update featured status'
  }
}

async function deleteExhibition() {
  isDeleting.value = true
  error.value = ''

  try {
    await exhibitionService.deleteExhibition(exhibitionId.value)
    router.push('/admin/exhibitions')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete exhibition'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: ExhibitionStatus): string {
  const colors: Record<ExhibitionStatus, string> = {
    [ExhibitionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [ExhibitionStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
    [ExhibitionStatus.LIVE]: 'bg-green-100 text-green-800',
    [ExhibitionStatus.ENDED]: 'bg-gray-100 text-gray-600',
    [ExhibitionStatus.ARCHIVED]: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getTypeLabel(type: ExhibitionType): string {
  const labels: Record<ExhibitionType, string> = {
    [ExhibitionType.GALLERY]: 'Gallery',
    [ExhibitionType.VIRTUAL_TOUR]: 'Virtual Tour',
    [ExhibitionType.FEATURED]: 'Featured',
    [ExhibitionType.POPUP]: 'Pop-up',
  }
  return labels[type] || type
}

onMounted(() => {
  fetchExhibition()
})

useHead({
  title: computed(() => isNew.value ? 'Create Exhibition | Admin' : 'Edit Exhibition | Admin'),
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin/exhibitions"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isNew ? 'Create Exhibition' : 'Edit Exhibition' }}
            </h1>
            <p v-if="exhibition" class="text-gray-600 mt-1">
              {{ exhibition.artworkCount }} artworks • {{ exhibition.artistCount }} artists • {{ exhibition.viewCount }} views
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Status Actions -->
          <button
            v-if="!isNew && exhibition?.status === ExhibitionStatus.DRAFT"
            class="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click="publishExhibition"
          >
            Schedule
          </button>
          <button
            v-if="!isNew && exhibition?.status === ExhibitionStatus.SCHEDULED"
            class="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            @click="goLiveExhibition"
          >
            Go Live
          </button>
          <button
            v-if="!isNew && exhibition?.status === ExhibitionStatus.LIVE"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            @click="endExhibition"
          >
            End Exhibition
          </button>
          <button
            v-if="!isNew"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
          <button
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            :disabled="isSaving || !form.title || !form.slug"
            @click="saveExhibition"
          >
            {{ isSaving ? 'Saving...' : (isNew ? 'Create Exhibition' : 'Save Changes') }}
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Exhibition Details</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter exhibition title"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="exhibition-slug"
                  :disabled="!isNew"
                />
                <p class="text-sm text-gray-500 mt-1">URL-friendly identifier. Auto-generated from title if left empty.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  v-model="form.type"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option :value="ExhibitionType.GALLERY">Gallery Exhibition</option>
                  <option :value="ExhibitionType.VIRTUAL_TOUR">Virtual Tour</option>
                  <option :value="ExhibitionType.FEATURED">Featured Exhibition</option>
                  <option :value="ExhibitionType.POPUP">Pop-up Exhibition</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  v-model="form.shortDescription"
                  type="text"
                  maxlength="500"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Brief description (max 500 characters)"
                />
                <p class="text-sm text-gray-500 mt-1">{{ form.shortDescription?.length || 0 }}/500 characters</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea
                  v-model="form.description"
                  rows="6"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Detailed description of the exhibition"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Media</h2>

            <UiImageUpload
              v-model="form.coverImage"
              label="Cover Image"
              folder="exhibitions"
              :alt="form.title"
              preview-aspect="video"
            />
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  v-model="form.startDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  v-model="form.endDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          <!-- Artworks Section (for existing exhibitions) -->
          <div v-if="exhibition && exhibition.artworks && exhibition.artworks.length > 0" class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Artworks ({{ exhibition.artworkCount }})</h2>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div
                v-for="artwork in exhibition.artworks.slice(0, 8)"
                :key="artwork.id"
                class="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group"
              >
                <img
                  v-if="artwork.primaryImage"
                  :src="artwork.primaryImage"
                  :alt="artwork.title"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end p-2">
                  <p class="text-white text-xs opacity-0 group-hover:opacity-100 truncate">{{ artwork.title }}</p>
                </div>
              </div>
            </div>

            <p v-if="exhibition.artworkCount > 8" class="text-sm text-gray-500 mt-4 text-center">
              And {{ exhibition.artworkCount - 8 }} more artworks
            </p>
          </div>

          <!-- Artists Section (for existing exhibitions) -->
          <div v-if="exhibition && exhibition.artists && exhibition.artists.length > 0" class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Artists ({{ exhibition.artistCount }})</h2>
            </div>

            <div class="space-y-3">
              <div
                v-for="artist in exhibition.artists"
                :key="artist.id"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    v-if="artist.profileImage"
                    :src="artist.profileImage"
                    :alt="artist.displayName"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ artist.displayName }}</p>
                  <p class="text-sm text-gray-500">{{ artist.isCurator ? 'Curator' : 'Artist' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="artist.verified" class="text-blue-500" title="Verified">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Status</span>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="exhibition ? getStatusColor(exhibition.status) : 'bg-gray-100 text-gray-800'"
                >
                  {{ exhibition?.status || 'Draft' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Type</span>
                <span class="text-sm text-gray-900">{{ getTypeLabel(form.type) }}</span>
              </div>
              <div v-if="exhibition?.publishedAt" class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Published</span>
                <span class="text-sm text-gray-900">{{ formatDate(exhibition.publishedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Featured -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Visibility</h2>

            <div class="space-y-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  :disabled="isNew"
                  @change="!isNew && toggleFeatured()"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">Featured Exhibition</p>
                  <p class="text-xs text-gray-500">Highlight this exhibition on the main page</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Exhibition Info -->
          <div v-if="exhibition" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Artworks</span>
                <span class="text-gray-900 font-medium">{{ exhibition.artworkCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Artists</span>
                <span class="text-gray-900 font-medium">{{ exhibition.artistCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Views</span>
                <span class="text-gray-900 font-medium">{{ exhibition.viewCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Comments</span>
                <span class="text-gray-900 font-medium">{{ exhibition.commentCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created</span>
                <span class="text-gray-900">{{ formatDate(exhibition.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Updated</span>
                <span class="text-gray-900">{{ formatDate(exhibition.updatedAt) }}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200">
              <NuxtLink
                :to="`/exhibitions/${exhibition.slug}`"
                target="_blank"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Public Page →
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="exhibition && exhibition.status === ExhibitionStatus.DRAFT" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <button
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="publishExhibition"
            >
              Schedule Exhibition
            </button>
            <p class="text-xs text-gray-500 mt-2 text-center">
              Move to scheduled status when ready
            </p>
          </div>

          <div v-if="exhibition && exhibition.status === ExhibitionStatus.SCHEDULED" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <button
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="goLiveExhibition"
            >
              Go Live Now
            </button>
            <p class="text-xs text-gray-500 mt-2 text-center">
              Make this exhibition live immediately
            </p>
          </div>

          <!-- Next Steps for new exhibitions -->
          <div v-if="isNew" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 class="text-sm font-semibold text-blue-900 mb-2">Next Steps</h2>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• After creating, add artworks and artists</li>
              <li>• Set dates and schedule when ready</li>
              <li>• For virtual tours, add tour rooms</li>
              <li>• Mark as featured to highlight</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Exhibition</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ exhibition?.title }}"? This action cannot be undone.
            <span v-if="exhibition?.artworkCount" class="block mt-2 text-amber-600">
              Note: This will remove {{ exhibition.artworkCount }} artworks from the exhibition.
            </span>
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              :disabled="isDeleting"
              @click="deleteExhibition"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Exhibition' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
