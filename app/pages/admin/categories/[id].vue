<script setup lang="ts">
import type { Category, UpdateCategoryData } from '~/types/category'
import { useCategoryService } from '~/services/category.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const categoryService = useCategoryService()

const categoryId = computed(() => route.params.id as string)
const isNew = computed(() => categoryId.value === 'new')

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')

const category = ref<Category | null>(null)
const allCategories = ref<Category[]>([])

const form = reactive({
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: undefined as string | undefined,
  sortOrder: 0,
})

const showDeleteModal = ref(false)
const isDeleting = ref(false)

async function fetchCategory() {
  if (isNew.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await categoryService.getCategoryById(categoryId.value)
    category.value = data

    form.name = data.name
    form.slug = data.slug
    form.description = data.description || ''
    form.image = data.image || ''
    form.parentId = data.parentId
    form.sortOrder = data.sortOrder
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch category'
  } finally {
    isLoading.value = false
  }
}

async function fetchAllCategories() {
  try {
    const response = await categoryService.getCategories({ limit: 100 })
    allCategories.value = response.data
  } catch (e: any) {
    console.error('Failed to fetch categories:', e)
  }
}

const availableParentCategories = computed(() => {
  return allCategories.value.filter(c => {
    if (isNew.value) return true
    return c.id !== categoryId.value
  })
})

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

watch(() => form.name, (name) => {
  if (isNew.value || !category.value) {
    form.slug = generateSlug(name)
  }
})

async function saveCategory() {
  if (!form.name) {
    error.value = 'Category name is required'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const data: UpdateCategoryData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || undefined,
      image: form.image || undefined,
      parentId: form.parentId || null,
      sortOrder: form.sortOrder,
    }

    if (isNew.value) {
      const newCategory = await categoryService.createCategory(data as any)
      successMessage.value = 'Category created successfully'
      setTimeout(() => {
        router.push(`/admin/categories/${newCategory.id}`)
      }, 1000)
    } else {
      await categoryService.updateCategory(categoryId.value, data)
      successMessage.value = 'Category updated successfully'
      await fetchCategory()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save category'
  } finally {
    isSaving.value = false
  }
}

async function deleteCategory() {
  isDeleting.value = true
  error.value = ''

  try {
    await categoryService.deleteCategory(categoryId.value)
    router.push('/admin/categories')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete category'
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
  fetchCategory()
  fetchAllCategories()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin/categories"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isNew ? 'Create Category' : 'Edit Category' }}
            </h1>
            <p v-if="category" class="text-gray-600 mt-1">
              {{ category.artworkCount || 0 }} artworks in this category
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
            @click="saveCategory"
          >
            {{ isSaving ? 'Saving...' : (isNew ? 'Create Category' : 'Save Changes') }}
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
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Category Details</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="category-slug"
                />
                <p class="text-sm text-gray-500 mt-1">URL-friendly identifier. Auto-generated from name if left empty.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Describe this category..."
                ></textarea>
              </div>

              <UiImageUpload
                v-model="form.image"
                label="Image"
                folder="categories"
                :alt="form.name"
                preview-aspect="square"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Organization -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Organization</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  v-model="form.parentId"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option :value="undefined">None (Root Category)</option>
                  <option
                    v-for="cat in availableParentCategories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
                <p class="text-sm text-gray-500 mt-1">Nest this under another category.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  v-model.number="form.sortOrder"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p class="text-sm text-gray-500 mt-1">Lower numbers appear first.</p>
              </div>
            </div>
          </div>

          <!-- Category Info -->
          <div v-if="category" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Artworks</span>
                <span class="text-gray-900 font-medium">{{ category.artworkCount || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created</span>
                <span class="text-gray-900">{{ formatDate(category.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Updated</span>
                <span class="text-gray-900">{{ formatDate(category.updatedAt) }}</span>
              </div>
              <div v-if="category.parent" class="flex justify-between">
                <span class="text-gray-500">Parent</span>
                <NuxtLink
                  :to="`/admin/categories/${category.parent.id}`"
                  class="text-primary-600 hover:underline"
                >
                  {{ category.parent.name }}
                </NuxtLink>
              </div>
              <div v-if="category.children && category.children.length > 0">
                <span class="text-gray-500">Subcategories</span>
                <div class="mt-2 flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="child in category.children"
                    :key="child.id"
                    :to="`/admin/categories/${child.id}`"
                    class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                  >
                    {{ child.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ category?.name }}"? This action cannot be undone.
            <span v-if="category?.artworkCount" class="block mt-2 text-red-600">
              Warning: This category has {{ category.artworkCount }} associated artworks.
            </span>
            <span v-if="category?.children?.length" class="block mt-2 text-red-600">
              Warning: This category has {{ category.children.length }} subcategories.
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
              @click="deleteCategory"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Category' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
