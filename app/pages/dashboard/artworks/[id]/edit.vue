<script setup lang="ts">
import type { Artwork, UpdateArtworkData, ArtworkMedium, CreateArtworkImageData } from '~/types/artwork'
import { MEDIUM_LABELS, STATUS_LABELS } from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const artworkService = useArtworkService()
const authStore = useAuthStore()

const artwork = ref<Artwork | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')

const artworkId = computed(() => route.params.id as string)

const form = reactive<UpdateArtworkData>({
  title: '',
  description: '',
  story: '',
  medium: 'OIL_PAINTING',
  style: '',
  year: undefined,
  width: undefined,
  height: undefined,
  depth: undefined,
  weight: undefined,
  price: undefined,
  originalPrice: undefined,
  currency: 'USD',
  categoryId: undefined,
  status: undefined,
  tags: [],
})

const newImages = ref<CreateArtworkImageData[]>([])
const tagInput = ref('')

const mediumOptions = Object.entries(MEDIUM_LABELS).map(([value, label]) => ({
  value: value as ArtworkMedium,
  label,
}))

async function fetchArtwork() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await artworkService.getArtworks({ limit: 100 })
    artwork.value = response.data.find(a => a.id === artworkId.value) || null

    if (!artwork.value) {
      error.value = 'Artwork not found'
      return
    }

    form.title = artwork.value.title
    form.description = artwork.value.description || ''
    form.story = artwork.value.story || ''
    form.medium = artwork.value.medium
    form.style = artwork.value.style || ''
    form.year = artwork.value.year
    form.width = artwork.value.width
    form.height = artwork.value.height
    form.depth = artwork.value.depth
    form.weight = artwork.value.weight
    form.price = artwork.value.price
    form.originalPrice = artwork.value.originalPrice
    form.currency = artwork.value.currency || 'USD'
    form.categoryId = artwork.value.categoryId
    form.status = artwork.value.status
    form.tags = artwork.value.tags || []
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artwork'
  } finally {
    isLoading.value = false
  }
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

function addNewImage() {
  newImages.value.push({
    url: '',
    altText: '',
    isPrimary: false,
  })
}

function removeNewImage(index: number) {
  newImages.value = newImages.value.filter((_, i) => i !== index)
}

async function handleSubmit() {
  error.value = ''
  successMessage.value = ''

  if (!form.title?.trim()) {
    error.value = 'Title is required'
    return
  }

  isSubmitting.value = true

  try {
    await artworkService.updateArtwork(artworkId.value, form)
    successMessage.value = 'Artwork updated successfully'

    for (const image of newImages.value) {
      if (image.url.trim()) {
        await artworkService.addArtworkImage(artworkId.value, image)
      }
    }
    newImages.value = []

    await fetchArtwork()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update artwork'
  } finally {
    isSubmitting.value = false
  }
}

async function removeExistingImage(imageId: string) {
  try {
    await artworkService.removeArtworkImage(artworkId.value, imageId)
    successMessage.value = 'Image removed successfully'
    await fetchArtwork()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to remove image'
  }
}

async function setImageAsPrimary(imageId: string) {
  try {
    await artworkService.setPrimaryImage(artworkId.value, imageId)
    successMessage.value = 'Primary image updated'
    await fetchArtwork()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to set primary image'
  }
}

async function publishArtwork() {
  try {
    await artworkService.publishArtwork(artworkId.value)
    successMessage.value = 'Artwork published successfully'
    await fetchArtwork()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish artwork'
  }
}

onMounted(() => {
  if (!authStore.isArtist) {
    navigateTo('/dashboard/artist-profile')
  } else {
    fetchArtwork()
  }
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-3xl mx-auto">
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
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Artwork</h1>
            <p class="text-gray-600 mt-1">Update artwork details</p>
          </div>
          <div v-if="artwork" class="flex items-center gap-3">
            <span
              class="px-3 py-1 text-sm font-medium rounded-full"
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
            <button
              v-if="artwork.status === 'DRAFT'"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              @click="publishArtwork"
            >
              Publish
            </button>
            <NuxtLink
              :to="`/artworks/${artwork.slug}`"
              class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              target="_blank"
            >
              View
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <template v-else-if="artwork">
        <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
          {{ successMessage }}
        </UiAlert>
        <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
          {{ error }}
        </UiAlert>

        <form @submit.prevent="handleSubmit" class="space-y-8">
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
              />
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="form.status"
                class="w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="ON_EXHIBITION">On Exhibition</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

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
          </div>

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

          <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">Current Images</h2>

            <div v-if="artwork.images?.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="image in artwork.images"
                :key="image.id"
                class="relative group"
              >
                <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    :src="image.url"
                    :alt="image.altText || artwork.title"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    v-if="!image.isPrimary"
                    type="button"
                    class="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                    title="Set as primary"
                    @click="setImageAsPrimary(image.id)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                    title="Remove image"
                    @click="removeExistingImage(image.id)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <span
                  v-if="image.isPrimary"
                  class="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded"
                >
                  Primary
                </span>
              </div>
            </div>
            <p v-else class="text-gray-500">No images uploaded yet.</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Add New Images</h2>
              <button
                type="button"
                class="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                @click="addNewImage"
              >
                Add Image
              </button>
            </div>

            <div v-if="newImages.length" class="space-y-4">
              <div
                v-for="(image, index) in newImages"
                :key="index"
                class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex-1 space-y-3">
                  <UiImageUpload
                    v-model="image.url"
                    label="Image"
                    folder="artworks"
                    :alt="image.altText || form.title"
                    preview-aspect="square"
                  />
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      v-model="image.altText"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Describe the image..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  @click="removeNewImage(index)"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-else class="text-gray-500 text-sm">Click "Add Image" to add more images to this artwork.</p>
          </div>

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
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </template>

      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900">Artwork not found</h2>
        <p class="text-gray-600 mt-2">The artwork you're looking for doesn't exist.</p>
        <NuxtLink
          to="/dashboard/artworks"
          class="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Artworks
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
