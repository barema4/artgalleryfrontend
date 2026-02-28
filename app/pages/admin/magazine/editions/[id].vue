<script setup lang="ts">
import type { MagazineEdition, UpdateMagazineEditionData } from '~/types/magazine'
import { useMagazineService } from '~/services/magazine.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const magazineService = useMagazineService()

const editionId = computed(() => route.params.id as string)
const isNew = computed(() => editionId.value === 'new')

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')

const edition = ref<MagazineEdition | null>(null)
const existingEditions = ref<MagazineEdition[]>([])

const form = reactive({
  issueNumber: 1,
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  pdfUrl: '',
  featured: false,
})

const showDeleteModal = ref(false)
const isDeleting = ref(false)

async function fetchEdition() {
  if (isNew.value) {
    // Get next issue number
    try {
      const response = await magazineService.adminGetEditions({ limit: 1, sortBy: 'issue_desc' })
      existingEditions.value = response.data
      form.issueNumber = (response.data[0]?.issueNumber || 0) + 1
    } catch (e) {
      console.error('Failed to fetch editions:', e)
    }
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await magazineService.adminGetEditionById(editionId.value)
    edition.value = data

    form.issueNumber = data.issueNumber
    form.title = data.title
    form.slug = data.slug
    form.description = data.description || ''
    form.coverImage = data.coverImage
    form.pdfUrl = data.pdfUrl || ''
    form.featured = data.featured
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch edition'
  } finally {
    isLoading.value = false
  }
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

async function saveEdition() {
  if (!form.title || !form.coverImage) {
    error.value = 'Title and cover image are required'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (isNew.value) {
      const newEdition = await magazineService.createEdition({
        issueNumber: form.issueNumber,
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        description: form.description || undefined,
        coverImage: form.coverImage,
        pdfUrl: form.pdfUrl || undefined,
        featured: form.featured,
      })
      successMessage.value = 'Edition created successfully'
      setTimeout(() => {
        router.push(`/admin/magazine/editions/${newEdition.id}`)
      }, 1000)
    } else {
      const updateData: UpdateMagazineEditionData = {
        title: form.title,
        description: form.description || undefined,
        coverImage: form.coverImage,
        pdfUrl: form.pdfUrl || undefined,
        featured: form.featured,
      }
      await magazineService.updateEdition(editionId.value, updateData)
      successMessage.value = 'Edition updated successfully'
      await fetchEdition()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save edition'
  } finally {
    isSaving.value = false
  }
}

async function publishEdition() {
  try {
    await magazineService.publishEdition(editionId.value)
    successMessage.value = 'Edition published successfully'
    await fetchEdition()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish edition'
  }
}

async function deleteEdition() {
  isDeleting.value = true
  error.value = ''

  try {
    await magazineService.deleteEdition(editionId.value)
    router.push('/admin/magazine')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete edition'
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

onMounted(() => {
  fetchEdition()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin/magazine"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isNew ? 'Create Edition' : 'Edit Edition' }}
            </h1>
            <p v-if="edition" class="text-gray-600 mt-1">
              Issue #{{ edition.issueNumber }} • {{ edition.articleCount }} articles
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="!isNew && !edition?.publishedAt"
            class="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            @click="publishEdition"
          >
            Publish
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
            :disabled="isSaving || !form.title || !form.coverImage"
            @click="saveEdition"
          >
            {{ isSaving ? 'Saving...' : (isNew ? 'Create Edition' : 'Save Changes') }}
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
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Edition Details</h2>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Issue Number *</label>
                  <input
                    v-model.number="form.issueNumber"
                    type="number"
                    min="1"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    :disabled="!isNew"
                  />
                </div>
                <div class="flex items-end">
                  <label class="flex items-center gap-2 pb-2">
                    <input
                      v-model="form.featured"
                      type="checkbox"
                      class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-700">Featured edition</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., The Art of Storytelling"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="the-art-of-storytelling"
                  :disabled="!isNew"
                />
                <p class="text-sm text-gray-500 mt-1">URL-friendly identifier. Auto-generated from title if left empty.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Brief description of this edition..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Media</h2>

            <div class="space-y-4">
              <UiImageUpload
                v-model="form.coverImage"
                label="Cover Image"
                folder="magazine/editions"
                :alt="form.title"
                required
                preview-aspect="portrait"
              />

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">PDF URL (optional)</label>
                <input
                  v-model="form.pdfUrl"
                  type="url"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://..."
                />
                <p class="text-sm text-gray-500 mt-1">Link to downloadable PDF version of the edition.</p>
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
                  :class="edition?.publishedAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ edition?.publishedAt ? 'Published' : 'Draft' }}
                </span>
              </div>
              <div v-if="edition?.publishedAt" class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Published</span>
                <span class="text-sm text-gray-900">{{ formatDate(edition.publishedAt) }}</span>
              </div>
              <div v-if="form.featured" class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Featured</span>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                  Yes
                </span>
              </div>
            </div>
          </div>

          <!-- Edition Info -->
          <div v-if="edition" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Articles</span>
                <span class="text-gray-900 font-medium">{{ edition.articleCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created</span>
                <span class="text-gray-900">{{ formatDate(edition.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Updated</span>
                <span class="text-gray-900">{{ formatDate(edition.updatedAt) }}</span>
              </div>
            </div>

            <div v-if="edition.articleCount > 0" class="mt-4 pt-4 border-t border-gray-200">
              <NuxtLink
                :to="`/admin/magazine?tab=articles&editionId=${edition.id}`"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Articles →
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="edition && !edition.publishedAt" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <button
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="publishEdition"
            >
              Publish Edition
            </button>
            <p class="text-xs text-gray-500 mt-2 text-center">
              Make this edition visible to the public
            </p>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Edition</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ edition?.title }}"? This action cannot be undone.
            <span v-if="edition?.articleCount" class="block mt-2 text-red-600">
              Warning: This edition has {{ edition.articleCount }} articles that will also be deleted.
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
              @click="deleteEdition"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Edition' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
