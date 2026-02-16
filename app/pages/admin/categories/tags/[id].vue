<script setup lang="ts">
import type { Tag, UpdateTagData } from '~/types/category'
import { useTagService } from '~/services/tag.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const tagService = useTagService()

const tagId = computed(() => route.params.id as string)
const isNew = computed(() => tagId.value === 'new')

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')

const tag = ref<Tag | null>(null)

const form = reactive({
  name: '',
  slug: '',
})

const showDeleteModal = ref(false)
const isDeleting = ref(false)

async function fetchTag() {
  if (isNew.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await tagService.getTagById(tagId.value)
    tag.value = data

    form.name = data.name
    form.slug = data.slug
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch tag'
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

watch(() => form.name, (name) => {
  if (isNew.value || !tag.value) {
    form.slug = generateSlug(name)
  }
})

async function saveTag() {
  if (!form.name) {
    error.value = 'Tag name is required'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const data: UpdateTagData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
    }

    if (isNew.value) {
      const newTag = await tagService.createTag(data as any)
      successMessage.value = 'Tag created successfully'
      setTimeout(() => {
        router.push(`/admin/categories/tags/${newTag.id}`)
      }, 1000)
    } else {
      await tagService.updateTag(tagId.value, data)
      successMessage.value = 'Tag updated successfully'
      await fetchTag()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save tag'
  } finally {
    isSaving.value = false
  }
}

async function deleteTag() {
  isDeleting.value = true
  error.value = ''

  try {
    await tagService.deleteTag(tagId.value)
    router.push('/admin/categories?tab=tags')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete tag'
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
  fetchTag()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin/categories?tab=tags"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isNew ? 'Create Tag' : 'Edit Tag' }}
            </h1>
            <p v-if="tag" class="text-gray-600 mt-1">
              {{ tag.artworkCount || 0 }} artworks with this tag
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="!isNew"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
          <button
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            :disabled="isSaving || !form.name"
            @click="saveTag"
          >
            {{ isSaving ? 'Saving...' : (isNew ? 'Create Tag' : 'Save Changes') }}
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
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Main Content -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Tag Details</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Enter tag name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="tag-slug"
              />
              <p class="text-sm text-gray-500 mt-1">URL-friendly identifier. Auto-generated from name if left empty.</p>
            </div>
          </div>
        </div>

        <!-- Tag Info -->
        <div v-if="tag" class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Artworks</span>
              <span class="text-gray-900 font-medium">{{ tag.artworkCount || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Created</span>
              <span class="text-gray-900">{{ formatDate(tag.createdAt) }}</span>
            </div>
          </div>

          <!-- Preview -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              {{ form.name || 'Tag Name' }}
            </span>
          </div>
        </div>

        <!-- Preview for new tag -->
        <div v-else class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            {{ form.name || 'Tag Name' }}
          </span>
        </div>
      </div>

      <!-- Delete Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Tag</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ tag?.name }}"? This action cannot be undone.
            <span v-if="tag?.artworkCount" class="block mt-2 text-amber-600">
              Note: This tag will be removed from {{ tag.artworkCount }} artworks.
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
              @click="deleteTag"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Tag' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
