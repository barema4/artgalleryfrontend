<script setup lang="ts">
import type {
  MagazineEdition,
  Article,
  ArticleCategory,
  CreateMagazineEditionData,
  UpdateMagazineEditionData,
  CreateArticleData,
  UpdateArticleData,
  ArticleStatus,
} from '~/types/magazine'
import { useMagazineService } from '~/services/magazine.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const magazineService = useMagazineService()

const activeTab = ref<'editions' | 'articles' | 'categories'>('editions')
const isLoading = ref(true)
const error = ref('')

const editions = ref<MagazineEdition[]>([])
const editionPagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const articles = ref<Article[]>([])
const articlePagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})
const articleFilters = reactive<{ status?: ArticleStatus; editionId?: string }>({
  status: undefined,
  editionId: undefined,
})

const categories = ref<ArticleCategory[]>([])

const showEditionModal = ref(false)
const showArticleModal = ref(false)
const showCategoryModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

const selectedEdition = ref<MagazineEdition | null>(null)
const editionForm = reactive<CreateMagazineEditionData>({
  issueNumber: 1,
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  pdfUrl: '',
  featured: false,
})

const selectedArticle = ref<Article | null>(null)
const articleForm = reactive<CreateArticleData>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  authorName: '',
  authorBio: '',
  authorImage: '',
  editionId: undefined,
  categoryId: undefined,
  readingTime: undefined,
  metaTitle: '',
  metaDescription: '',
  tags: [],
  status: 'DRAFT',
})

const selectedCategory = ref<ArticleCategory | null>(null)
const categoryForm = reactive({
  name: '',
  slug: '',
  description: '',
})

const statusOptions: { value: ArticleStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ARCHIVED', label: 'Archived' },
]

async function fetchEditions() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await magazineService.adminGetEditions({
      page: editionPagination.page,
      limit: editionPagination.limit,
      sortBy: 'newest',
    })
    editions.value = response.data
    editionPagination.total = response.total
    editionPagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch editions'
  } finally {
    isLoading.value = false
  }
}

async function fetchArticles() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await magazineService.adminGetArticles({
      page: articlePagination.page,
      limit: articlePagination.limit,
      status: articleFilters.status,
      editionId: articleFilters.editionId,
      sortBy: 'newest',
    })
    articles.value = response.data
    articlePagination.total = response.total
    articlePagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch articles'
  } finally {
    isLoading.value = false
  }
}

async function fetchCategories() {
  try {
    categories.value = await magazineService.getCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch categories'
  }
}

function openEditionModal(edition?: MagazineEdition) {
  if (edition) {
    isEditing.value = true
    selectedEdition.value = edition
    editionForm.issueNumber = edition.issueNumber
    editionForm.title = edition.title
    editionForm.slug = edition.slug
    editionForm.description = edition.description || ''
    editionForm.coverImage = edition.coverImage
    editionForm.pdfUrl = edition.pdfUrl || ''
    editionForm.featured = edition.featured
  } else {
    isEditing.value = false
    selectedEdition.value = null
    editionForm.issueNumber = (editions.value[0]?.issueNumber || 0) + 1
    editionForm.title = ''
    editionForm.slug = ''
    editionForm.description = ''
    editionForm.coverImage = ''
    editionForm.pdfUrl = ''
    editionForm.featured = false
  }
  showEditionModal.value = true
}

async function saveEdition() {
  if (!editionForm.title || !editionForm.slug || !editionForm.coverImage) {
    error.value = 'Title, slug, and cover image are required'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    if (isEditing.value && selectedEdition.value) {
      const updateData: UpdateMagazineEditionData = {
        title: editionForm.title,
        description: editionForm.description,
        coverImage: editionForm.coverImage,
        pdfUrl: editionForm.pdfUrl || undefined,
        featured: editionForm.featured,
      }
      await magazineService.updateEdition(selectedEdition.value.id, updateData)
    } else {
      await magazineService.createEdition(editionForm)
    }
    showEditionModal.value = false
    await fetchEditions()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save edition'
  } finally {
    isSaving.value = false
  }
}

async function publishEdition(edition: MagazineEdition) {
  if (!confirm(`Are you sure you want to publish "${edition.title}"?`)) return

  try {
    await magazineService.publishEdition(edition.id)
    await fetchEditions()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish edition'
  }
}

async function deleteEdition(edition: MagazineEdition) {
  if (!confirm(`Are you sure you want to delete "${edition.title}"? This will also delete all articles in this edition.`)) return

  try {
    await magazineService.deleteEdition(edition.id)
    await fetchEditions()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete edition'
  }
}

function openArticleModal(article?: Article) {
  if (article) {
    isEditing.value = true
    selectedArticle.value = article
    articleForm.title = article.title
    articleForm.slug = article.slug
    articleForm.excerpt = article.excerpt || ''
    articleForm.content = article.content
    articleForm.coverImage = article.coverImage || ''
    articleForm.authorName = article.authorName
    articleForm.authorBio = article.authorBio || ''
    articleForm.authorImage = article.authorImage || ''
    articleForm.editionId = article.editionId
    articleForm.categoryId = article.categoryId
    articleForm.readingTime = article.readingTime
    articleForm.metaTitle = article.metaTitle || ''
    articleForm.metaDescription = article.metaDescription || ''
    articleForm.tags = article.tags?.map(t => t.name) || []
    articleForm.status = article.status
  } else {
    isEditing.value = false
    selectedArticle.value = null
    articleForm.title = ''
    articleForm.slug = ''
    articleForm.excerpt = ''
    articleForm.content = ''
    articleForm.coverImage = ''
    articleForm.authorName = ''
    articleForm.authorBio = ''
    articleForm.authorImage = ''
    articleForm.editionId = undefined
    articleForm.categoryId = undefined
    articleForm.readingTime = undefined
    articleForm.metaTitle = ''
    articleForm.metaDescription = ''
    articleForm.tags = []
    articleForm.status = 'DRAFT'
  }
  showArticleModal.value = true
}

async function saveArticle() {
  if (!articleForm.title || !articleForm.slug || !articleForm.content || !articleForm.authorName) {
    error.value = 'Title, slug, content, and author name are required'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    if (isEditing.value && selectedArticle.value) {
      const updateData: UpdateArticleData = {
        title: articleForm.title,
        excerpt: articleForm.excerpt,
        content: articleForm.content,
        coverImage: articleForm.coverImage || undefined,
        authorName: articleForm.authorName,
        authorBio: articleForm.authorBio || undefined,
        authorImage: articleForm.authorImage || undefined,
        editionId: articleForm.editionId,
        categoryId: articleForm.categoryId,
        readingTime: articleForm.readingTime,
        metaTitle: articleForm.metaTitle || undefined,
        metaDescription: articleForm.metaDescription || undefined,
        tags: articleForm.tags,
        status: articleForm.status,
      }
      await magazineService.updateArticle(selectedArticle.value.id, updateData)
    } else {
      await magazineService.createArticle(articleForm)
    }
    showArticleModal.value = false
    await fetchArticles()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save article'
  } finally {
    isSaving.value = false
  }
}

async function publishArticle(article: Article) {
  if (!confirm(`Are you sure you want to publish "${article.title}"?`)) return

  try {
    await magazineService.publishArticle(article.id)
    await fetchArticles()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish article'
  }
}

async function deleteArticle(article: Article) {
  if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return

  try {
    await magazineService.deleteArticle(article.id)
    await fetchArticles()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete article'
  }
}

function openCategoryModal(category?: ArticleCategory) {
  if (category) {
    isEditing.value = true
    selectedCategory.value = category
    categoryForm.name = category.name
    categoryForm.slug = category.slug
    categoryForm.description = category.description || ''
  } else {
    isEditing.value = false
    selectedCategory.value = null
    categoryForm.name = ''
    categoryForm.slug = ''
    categoryForm.description = ''
  }
  showCategoryModal.value = true
}

async function saveCategory() {
  if (!categoryForm.name || !categoryForm.slug) {
    error.value = 'Name and slug are required'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    if (isEditing.value && selectedCategory.value) {
      await magazineService.updateCategory(selectedCategory.value.id, {
        name: categoryForm.name,
        description: categoryForm.description || undefined,
      })
    } else {
      await magazineService.createCategory({
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description || undefined,
      })
    }
    showCategoryModal.value = false
    await fetchCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save category'
  } finally {
    isSaving.value = false
  }
}

async function deleteCategory(category: ArticleCategory) {
  if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return

  try {
    await magazineService.deleteCategory(category.id)
    await fetchCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete category'
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getStatusColor(status: ArticleStatus): string {
  const colors: Record<ArticleStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    ARCHIVED: 'bg-yellow-100 text-yellow-800',
  }
  return colors[status]
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

watch(activeTab, (tab) => {
  if (tab === 'editions') fetchEditions()
  else if (tab === 'articles') fetchArticles()
  else if (tab === 'categories') fetchCategories()
})

watch([() => articleFilters.status, () => articleFilters.editionId], () => {
  articlePagination.page = 1
  fetchArticles()
})

watch(() => editionForm.title, (title) => {
  if (!isEditing.value) {
    editionForm.slug = generateSlug(title)
  }
})

watch(() => articleForm.title, (title) => {
  if (!isEditing.value) {
    articleForm.slug = generateSlug(title)
  }
})

watch(() => categoryForm.name, (name) => {
  if (!isEditing.value) {
    categoryForm.slug = generateSlug(name)
  }
})

onMounted(() => {
  fetchEditions()
  fetchCategories()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Magazine Management</h1>
          <p class="text-gray-600 mt-1">Create and manage magazine editions and articles</p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="activeTab === 'editions'"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="openEditionModal()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Edition
          </button>
          <button
            v-if="activeTab === 'articles'"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="openArticleModal()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Article
          </button>
          <button
            v-if="activeTab === 'categories'"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="openCategoryModal()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </button>
        </div>
      </div>

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div class="flex border-b border-gray-200 mb-6">
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'editions'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'editions'"
        >
          Editions
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'articles'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'articles'"
        >
          Articles
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'categories'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'categories'"
        >
          Categories
        </button>
      </div>

      <div v-if="activeTab === 'editions'">
        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <div v-else-if="editions.length > 0" class="grid gap-4">
          <div
            v-for="edition in editions"
            :key="edition.id"
            class="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"
          >
            <div class="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="edition.coverImage"
                :src="edition.coverImage"
                :alt="edition.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <span class="text-sm text-primary-600 font-medium">Issue #{{ edition.issueNumber }}</span>
                  <h3 class="font-semibold text-gray-900">{{ edition.title }}</h3>
                  <p v-if="edition.description" class="text-sm text-gray-500 line-clamp-2 mt-1">
                    {{ edition.description }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    v-if="edition.featured"
                    class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
                  >
                    Featured
                  </span>
                  <span
                    v-if="edition.publishedAt"
                    class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                  >
                    Published
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
                  >
                    Draft
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>{{ edition.articleCount }} articles</span>
                <span v-if="edition.publishedAt">Published {{ formatDate(edition.publishedAt) }}</span>
              </div>
              <div class="flex items-center gap-2 mt-3">
                <button
                  v-if="!edition.publishedAt"
                  class="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                  @click="publishEdition(edition)"
                >
                  Publish
                </button>
                <button
                  class="px-3 py-1.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  @click="openEditionModal(edition)"
                >
                  Edit
                </button>
                <button
                  class="px-3 py-1.5 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                  @click="deleteEdition(edition)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-1">No editions yet</h3>
          <p class="text-gray-500 mb-4">Create your first magazine edition to get started.</p>
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="openEditionModal()"
          >
            Create Edition
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'articles'">
        <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="articleFilters.status"
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value || undefined">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Edition</label>
              <select
                v-model="articleFilters.editionId"
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option :value="undefined">All editions</option>
                <option v-for="edition in editions" :key="edition.id" :value="edition.id">
                  Issue #{{ edition.issueNumber }} - {{ edition.title }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <div v-else-if="articles.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Edition</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        v-if="article.coverImage"
                        :src="article.coverImage"
                        :alt="article.title"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ article.title }}</p>
                      <p v-if="article.category" class="text-sm text-gray-500">{{ article.category.name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  <span v-if="article.edition">Issue #{{ article.edition.issueNumber }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusColor(article.status)"
                  >
                    {{ article.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ article.authorName }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="article.status === 'DRAFT'"
                      class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Publish"
                      @click="publishArticle(article)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                      @click="openArticleModal(article)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      @click="deleteArticle(article)"
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
        </div>

        <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <h3 class="text-lg font-medium text-gray-900 mb-1">No articles found</h3>
          <p class="text-gray-500 mb-4">Create your first article to get started.</p>
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="openArticleModal()"
          >
            Create Article
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'categories'">
        <div v-if="categories.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">{{ category.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ category.slug }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ category.articleCount }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      @click="openCategoryModal(category)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>

        <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <h3 class="text-lg font-medium text-gray-900 mb-1">No categories yet</h3>
          <p class="text-gray-500 mb-4">Create categories to organize your articles.</p>
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="openCategoryModal()"
          >
            Create Category
          </button>
        </div>
      </div>

      <div
        v-if="showEditionModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showEditionModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Edition' : 'Create Edition' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Issue Number *</label>
                <input
                  v-model.number="editionForm.issueNumber"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <label class="flex items-center gap-2 mt-2">
                  <input v-model="editionForm.featured" type="checkbox" class="w-4 h-4" />
                  <span class="text-sm text-gray-600">Feature this edition</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                v-model="editionForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., The Art of Storytelling"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                v-model="editionForm.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="the-art-of-storytelling"
                :disabled="isEditing"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="editionForm.description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Brief description of this edition..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image URL *</label>
              <input
                v-model="editionForm.coverImage"
                type="url"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">PDF URL (optional)</label>
              <input
                v-model="editionForm.pdfUrl"
                type="url"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showEditionModal = false"
            >
              Cancel
            </button>
            <UiButton
              :loading="isSaving"
              :disabled="isSaving || !editionForm.title || !editionForm.slug || !editionForm.coverImage"
              @click="saveEdition"
            >
              {{ isEditing ? 'Update' : 'Create' }} Edition
            </UiButton>
          </div>
        </div>
      </div>

      <div
        v-if="showArticleModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showArticleModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Article' : 'Create Article' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                <select
                  v-model="articleForm.editionId"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option :value="undefined">No edition</option>
                  <option v-for="edition in editions" :key="edition.id" :value="edition.id">
                    Issue #{{ edition.issueNumber }} - {{ edition.title }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  v-model="articleForm.categoryId"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option :value="undefined">No category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                v-model="articleForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                v-model="articleForm.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                :disabled="isEditing"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                v-model="articleForm.excerpt"
                rows="2"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Brief summary..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                v-model="articleForm.content"
                rows="10"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                placeholder="Article content (HTML supported)..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                <input
                  v-model="articleForm.authorName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Reading Time (min)</label>
                <input
                  v-model.number="articleForm.readingTime"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input
                v-model="articleForm.coverImage"
                type="url"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="articleForm.status"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showArticleModal = false"
            >
              Cancel
            </button>
            <UiButton
              :loading="isSaving"
              :disabled="isSaving || !articleForm.title || !articleForm.slug || !articleForm.content || !articleForm.authorName"
              @click="saveArticle"
            >
              {{ isEditing ? 'Update' : 'Create' }} Article
            </UiButton>
          </div>
        </div>
      </div>

      <div
        v-if="showCategoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showCategoryModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Category' : 'Create Category' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="categoryForm.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., Artist Profiles"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                v-model="categoryForm.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="artist-profiles"
                :disabled="isEditing"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="categoryForm.description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Brief description..."
              ></textarea>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showCategoryModal = false"
            >
              Cancel
            </button>
            <UiButton
              :loading="isSaving"
              :disabled="isSaving || !categoryForm.name || !categoryForm.slug"
              @click="saveCategory"
            >
              {{ isEditing ? 'Update' : 'Create' }} Category
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
