<script setup lang="ts">
import type {
  Category,
  Tag,
  CreateCategoryData,
  UpdateCategoryData,
  CreateTagData,
  UpdateTagData,
} from '~/types/category'
import { useCategoryService } from '~/services/category.service'
import { useTagService } from '~/services/tag.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const categoryService = useCategoryService()
const tagService = useTagService()

const activeTab = ref<'categories' | 'tags'>((route.query.tab as 'categories' | 'tags') || 'categories')
const isLoading = ref(true)
const error = ref('')

// Categories state
const categories = ref<Category[]>([])
const categoryPagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})
const categorySearch = ref('')

const showCategoryModal = ref(false)
const isEditingCategory = ref(false)
const isSavingCategory = ref(false)
const selectedCategory = ref<Category | null>(null)
const categoryForm = reactive<CreateCategoryData>({
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: undefined,
  sortOrder: 0,
})

// Tags state
const tags = ref<Tag[]>([])
const tagPagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})
const tagSearch = ref('')

const showTagModal = ref(false)
const isEditingTag = ref(false)
const isSavingTag = ref(false)
const selectedTag = ref<Tag | null>(null)
const tagForm = reactive<CreateTagData>({
  name: '',
  slug: '',
})

// Category methods
async function fetchCategories() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await categoryService.getCategories({
      page: categoryPagination.page,
      limit: categoryPagination.limit,
      search: categorySearch.value || undefined,
    })
    categories.value = response.data
    categoryPagination.total = response.total
    categoryPagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch categories'
  } finally {
    isLoading.value = false
  }
}

function openCategoryModal(category?: Category) {
  if (category) {
    isEditingCategory.value = true
    selectedCategory.value = category
    categoryForm.name = category.name
    categoryForm.slug = category.slug
    categoryForm.description = category.description || ''
    categoryForm.image = category.image || ''
    categoryForm.parentId = category.parentId
    categoryForm.sortOrder = category.sortOrder
  } else {
    isEditingCategory.value = false
    selectedCategory.value = null
    categoryForm.name = ''
    categoryForm.slug = ''
    categoryForm.description = ''
    categoryForm.image = ''
    categoryForm.parentId = undefined
    categoryForm.sortOrder = 0
  }
  showCategoryModal.value = true
}

async function saveCategory() {
  if (!categoryForm.name) {
    error.value = 'Category name is required'
    return
  }

  isSavingCategory.value = true
  error.value = ''

  try {
    const data = {
      name: categoryForm.name,
      slug: categoryForm.slug || generateSlug(categoryForm.name),
      description: categoryForm.description || undefined,
      image: categoryForm.image || undefined,
      parentId: categoryForm.parentId || undefined,
      sortOrder: categoryForm.sortOrder,
    }

    if (isEditingCategory.value && selectedCategory.value) {
      const updateData: UpdateCategoryData = data
      await categoryService.updateCategory(selectedCategory.value.id, updateData)
    } else {
      await categoryService.createCategory(data)
    }
    showCategoryModal.value = false
    await fetchCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save category'
  } finally {
    isSavingCategory.value = false
  }
}

async function deleteCategory(category: Category) {
  if (!confirm(`Are you sure you want to delete "${category.name}"? This may affect associated artworks.`)) return

  try {
    await categoryService.deleteCategory(category.id)
    await fetchCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete category'
  }
}

// Tag methods
async function fetchTags() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await tagService.getTags({
      page: tagPagination.page,
      limit: tagPagination.limit,
      search: tagSearch.value || undefined,
    })
    tags.value = response.data
    tagPagination.total = response.total
    tagPagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch tags'
  } finally {
    isLoading.value = false
  }
}

function openTagModal(tag?: Tag) {
  if (tag) {
    isEditingTag.value = true
    selectedTag.value = tag
    tagForm.name = tag.name
    tagForm.slug = tag.slug
  } else {
    isEditingTag.value = false
    selectedTag.value = null
    tagForm.name = ''
    tagForm.slug = ''
  }
  showTagModal.value = true
}

async function saveTag() {
  if (!tagForm.name) {
    error.value = 'Tag name is required'
    return
  }

  isSavingTag.value = true
  error.value = ''

  try {
    const data = {
      name: tagForm.name,
      slug: tagForm.slug || generateSlug(tagForm.name),
    }

    if (isEditingTag.value && selectedTag.value) {
      const updateData: UpdateTagData = data
      await tagService.updateTag(selectedTag.value.id, updateData)
    } else {
      await tagService.createTag(data)
    }
    showTagModal.value = false
    await fetchTags()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save tag'
  } finally {
    isSavingTag.value = false
  }
}

async function deleteTag(tag: Tag) {
  if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) return

  try {
    await tagService.deleteTag(tag.id)
    await fetchTags()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete tag'
  }
}

// Utility functions
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Watchers
watch(activeTab, (tab) => {
  if (tab === 'categories') {
    fetchCategories()
  } else {
    fetchTags()
  }
})

watch(categorySearch, () => {
  categoryPagination.page = 1
  fetchCategories()
})

watch(tagSearch, () => {
  tagPagination.page = 1
  fetchTags()
})

watch(() => categoryForm.name, (name) => {
  if (!isEditingCategory.value) {
    categoryForm.slug = generateSlug(name)
  }
})

watch(() => tagForm.name, (name) => {
  if (!isEditingTag.value) {
    tagForm.slug = generateSlug(name)
  }
})

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Categories & Tags</h1>
        <p class="text-gray-600 mt-1">Manage artwork categories and tags</p>
      </div>

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="flex gap-8">
          <button
            class="pb-3 px-1 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'categories' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'categories'"
          >
            Categories
          </button>
          <button
            class="pb-3 px-1 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'tags' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'tags'"
          >
            Tags
          </button>
        </nav>
      </div>

      <!-- Categories Tab -->
      <div v-if="activeTab === 'categories'">
        <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex-1 min-w-[200px] max-w-md">
            <input
              v-model="categorySearch"
              type="text"
              placeholder="Search categories..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <NuxtLink
            to="/admin/categories/new"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </NuxtLink>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <div v-else-if="categories.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Artworks</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        v-if="category.image"
                        :src="category.image"
                        :alt="category.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ category.name }}</p>
                      <p v-if="category.description" class="text-sm text-gray-500 truncate max-w-xs">{{ category.description }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ category.slug }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ category.artworkCount || 0 }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(category.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink
                      :to="`/admin/categories/${category.id}`"
                      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </NuxtLink>
                    <button
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      @click="deleteCategory(category)"
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

          <div v-if="categoryPagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p class="text-sm text-gray-500">
              Showing {{ (categoryPagination.page - 1) * categoryPagination.limit + 1 }} to {{ Math.min(categoryPagination.page * categoryPagination.limit, categoryPagination.total) }} of {{ categoryPagination.total }} categories
            </p>
            <div class="flex gap-2">
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="categoryPagination.page === 1"
                @click="categoryPagination.page--; fetchCategories()"
              >
                Previous
              </button>
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="categoryPagination.page === categoryPagination.totalPages"
                @click="categoryPagination.page++; fetchCategories()"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-1">No categories yet</h3>
          <p class="text-gray-500 mb-4">Create your first category to organize artworks.</p>
          <NuxtLink
            to="/admin/categories/new"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Category
          </NuxtLink>
        </div>
      </div>

      <!-- Tags Tab -->
      <div v-if="activeTab === 'tags'">
        <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex-1 min-w-[200px] max-w-md">
            <input
              v-model="tagSearch"
              type="text"
              placeholder="Search tags..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <NuxtLink
            to="/admin/categories/tags/new"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Tag
          </NuxtLink>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <div v-else-if="tags.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Artworks</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="tag in tags" :key="tag.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {{ tag.name }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ tag.slug }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ tag.artworkCount || 0 }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(tag.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink
                      :to="`/admin/categories/tags/${tag.id}`"
                      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </NuxtLink>
                    <button
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      @click="deleteTag(tag)"
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

          <div v-if="tagPagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p class="text-sm text-gray-500">
              Showing {{ (tagPagination.page - 1) * tagPagination.limit + 1 }} to {{ Math.min(tagPagination.page * tagPagination.limit, tagPagination.total) }} of {{ tagPagination.total }} tags
            </p>
            <div class="flex gap-2">
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="tagPagination.page === 1"
                @click="tagPagination.page--; fetchTags()"
              >
                Previous
              </button>
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="tagPagination.page === tagPagination.totalPages"
                @click="tagPagination.page++; fetchTags()"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-1">No tags yet</h3>
          <p class="text-gray-500 mb-4">Create your first tag to label artworks.</p>
          <NuxtLink
            to="/admin/categories/tags/new"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Tag
          </NuxtLink>
        </div>
      </div>

      <!-- Category Modal -->
      <div
        v-if="showCategoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showCategoryModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-lg">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditingCategory ? 'Edit Category' : 'Create Category' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="categoryForm.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                v-model="categoryForm.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                :disabled="isEditingCategory"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="categoryForm.description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Category description..."
              ></textarea>
            </div>

            <UiImageUpload
              v-model="categoryForm.image"
              label="Image"
              folder="categories"
              :alt="categoryForm.name"
              preview-aspect="square"
            />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  v-model="categoryForm.parentId"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option :value="undefined">None (Root)</option>
                  <option
                    v-for="cat in categories.filter(c => c.id !== selectedCategory?.id)"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  v-model.number="categoryForm.sortOrder"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showCategoryModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              :disabled="isSavingCategory || !categoryForm.name"
              @click="saveCategory"
            >
              {{ isSavingCategory ? 'Saving...' : (isEditingCategory ? 'Update' : 'Create') }} Category
            </button>
          </div>
        </div>
      </div>

      <!-- Tag Modal -->
      <div
        v-if="showTagModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showTagModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditingTag ? 'Edit Tag' : 'Create Tag' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="tagForm.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                v-model="tagForm.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                :disabled="isEditingTag"
              />
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showTagModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              :disabled="isSavingTag || !tagForm.name"
              @click="saveTag"
            >
              {{ isSavingTag ? 'Saving...' : (isEditingTag ? 'Update' : 'Create') }} Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
