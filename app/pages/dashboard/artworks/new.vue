<script setup lang="ts">
import type { CreateArtworkData, ArtworkMedium } from '~/types/artwork'
import { MEDIUM_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const router = useRouter()
const artworkService = useArtworkService()
const authStore = useAuthStore()

const isSubmitting = ref(false)
const error = ref('')

const form = reactive<CreateArtworkData>({
  slug: '',
  title: '',
  description: '',
  story: '',
  medium: 'OIL_PAINTING',
  style: '',
  year: new Date().getFullYear(),
  width: undefined,
  height: undefined,
  depth: undefined,
  weight: undefined,
  price: undefined,
  originalPrice: undefined,
  currency: 'USD',
  categoryId: undefined,
  tags: [],
  images: [],
})

const tagInput = ref('')

const mediumOptions = Object.entries(MEDIUM_LABELS).map(([value, label]) => ({
  value: value as ArtworkMedium,
  label,
}))

function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.tags?.includes(tag)) {
    form.tags = [...(form.tags || []), tag]
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags?.filter(t => t !== tag)
}

function addImage() {
  form.images = [
    ...(form.images || []),
    {
      url: '',
      altText: '',
      isPrimary: form.images?.length === 0,
    },
  ]
}

function removeImage(index: number) {
  const removed = form.images?.[index]
  form.images = form.images?.filter((_, i) => i !== index)

  // If removed was primary, make first remaining image primary
  if (removed?.isPrimary && form.images && form.images.length > 0) {
    form.images[0].isPrimary = true
  }
}

function setPrimaryImage(index: number) {
  form.images = form.images?.map((img, i) => ({
    ...img,
    isPrimary: i === index,
  }))
}

async function handleSubmit() {
  error.value = ''

  if (!form.title.trim()) {
    error.value = 'Title is required'
    return
  }

  if (!form.slug.trim()) {
    error.value = 'Slug is required'
    return
  }

  isSubmitting.value = true

  try {
    // Filter out empty images
    const images = form.images?.filter(img => img.url.trim())

    const artwork = await artworkService.createArtwork({
      ...form,
      images,
    })

    router.push(`/dashboard/artworks/${artwork.id}/edit`)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to create artwork'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (!authStore.isArtist) {
    navigateTo('/dashboard/artist-profile')
  }
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/dashboard/artworks"
          class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Artworks
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Add New Artwork</h1>
        <p class="text-gray-600 mt-1">Create a new artwork listing</p>
      </div>

      <!-- Error -->
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Basic Info -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Title <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Enter artwork title"
              @blur="!form.slug && generateSlug()"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Slug <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.slug"
                type="text"
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="artwork-url-slug"
              />
              <button
                type="button"
                class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                @click="generateSlug"
              >
                Generate
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">This will be used in the URL: /artworks/{{ form.slug || 'your-slug' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Describe your artwork..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Story Behind the Artwork</label>
            <textarea
              v-model="form.story"
              rows="4"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Share the story or inspiration behind this piece..."
            ></textarea>
          </div>
        </div>

        <!-- Details -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900">Artwork Details</h2>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Medium</label>
              <select
                v-model="form.medium"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option v-for="option in mediumOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <input
                v-model="form.style"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., Abstract, Realism"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year Created</label>
            <input
              v-model.number="form.year"
              type="number"
              min="1000"
              :max="new Date().getFullYear()"
              class="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
              <input
                v-model.number="form.width"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                v-model.number="form.height"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Depth (cm)</label>
              <input
                v-model.number="form.depth"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                v-model.number="form.weight"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900">Pricing</h2>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                step="1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                v-model.number="form.originalPrice"
                type="number"
                min="0"
                step="1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Optional"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                v-model="form.currency"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <p class="text-sm text-gray-500">Leave price empty for "Price on request"</p>
        </div>

        <!-- Tags -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Tags</h2>

          <div class="flex gap-2">
            <input
              v-model="tagInput"
              type="text"
              class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Add a tag..."
              @keyup.enter.prevent="addTag"
            />
            <button
              type="button"
              class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              @click="addTag"
            >
              Add
            </button>
          </div>

          <div v-if="form.tags?.length" class="flex flex-wrap gap-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
            >
              {{ tag }}
              <button
                type="button"
                class="w-4 h-4 flex items-center justify-center hover:text-gray-900"
                @click="removeTag(tag)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Images</h2>
            <button
              type="button"
              class="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              @click="addImage"
            >
              Add Image
            </button>
          </div>

          <div v-if="form.images?.length" class="space-y-4">
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex-1 space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    v-model="image.url"
                    type="url"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <input
                    v-model="image.altText"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Describe the image..."
                  />
                </div>
                <label class="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="primaryImage"
                    :checked="image.isPrimary"
                    class="text-gray-900 focus:ring-gray-900"
                    @change="setPrimaryImage(index)"
                  />
                  <span class="text-sm text-gray-700">Primary Image</span>
                </label>
              </div>
              <button
                type="button"
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                @click="removeImage(index)"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">No images added yet. Click "Add Image" to add artwork images.</p>
        </div>

        <!-- Submit -->
        <div class="flex gap-4">
          <NuxtLink
            to="/dashboard/artworks"
            class="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            class="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Creating...' : 'Create Artwork' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>