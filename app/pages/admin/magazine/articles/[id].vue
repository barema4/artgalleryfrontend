<script setup lang="ts">
import type {
  Article,
  MagazineEdition,
  ArticleCategory,
  UpdateArticleData,
  ArticleStatus,
} from '~/types/magazine'
import { useMagazineService } from '~/services/magazine.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const magazineService = useMagazineService()

const articleId = computed(() => route.params.id as string)
const isNew = computed(() => articleId.value === 'new')

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')

const article = ref<Article | null>(null)
const editions = ref<MagazineEdition[]>([])
const categories = ref<ArticleCategory[]>([])

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  authorName: '',
  authorBio: '',
  authorImage: '',
  editionId: undefined as string | undefined,
  categoryId: undefined as string | undefined,
  readingTime: undefined as number | undefined,
  metaTitle: '',
  metaDescription: '',
  tags: [] as string[],
  status: 'DRAFT' as ArticleStatus,
  scheduledAt: '',
})

const tagInput = ref('')
const showDeleteModal = ref(false)
const isDeleting = ref(false)

async function fetchArticle() {
  // Fetch editions and categories first
  try {
    const [editionsRes, categoriesRes] = await Promise.all([
      magazineService.adminGetEditions({ limit: 100 }),
      magazineService.getCategories(),
    ])
    editions.value = editionsRes.data
    categories.value = categoriesRes
  } catch (e) {
    console.error('Failed to fetch editions/categories:', e)
  }

  if (isNew.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await magazineService.adminGetArticleById(articleId.value)
    article.value = data

    form.title = data.title
    form.slug = data.slug
    form.excerpt = data.excerpt || ''
    form.content = data.content
    form.coverImage = data.coverImage || ''
    form.authorName = data.authorName
    form.authorBio = data.authorBio || ''
    form.authorImage = data.authorImage || ''
    form.editionId = data.editionId
    form.categoryId = data.categoryId
    form.readingTime = data.readingTime
    form.metaTitle = data.metaTitle || ''
    form.metaDescription = data.metaDescription || ''
    form.tags = data.tags?.map(t => t.name) || []
    form.status = data.status
    form.scheduledAt = data.scheduledAt || ''
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch article'
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

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

async function saveArticle() {
  if (!form.title || !form.content || !form.authorName) {
    error.value = 'Title, content, and author name are required'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (isNew.value) {
      const newArticle = await magazineService.createArticle({
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt || undefined,
        content: form.content,
        coverImage: form.coverImage || undefined,
        authorName: form.authorName,
        authorBio: form.authorBio || undefined,
        authorImage: form.authorImage || undefined,
        editionId: form.editionId,
        categoryId: form.categoryId,
        readingTime: form.readingTime,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        status: form.status,
        scheduledAt: form.scheduledAt || undefined,
      })
      successMessage.value = 'Article created successfully'
      setTimeout(() => {
        router.push(`/admin/magazine/articles/${newArticle.id}`)
      }, 1000)
    } else {
      const updateData: UpdateArticleData = {
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content,
        coverImage: form.coverImage || undefined,
        authorName: form.authorName,
        authorBio: form.authorBio || undefined,
        authorImage: form.authorImage || undefined,
        editionId: form.editionId,
        categoryId: form.categoryId,
        readingTime: form.readingTime,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        tags: form.tags,
        status: form.status,
        scheduledAt: form.scheduledAt || undefined,
      }
      await magazineService.updateArticle(articleId.value, updateData)
      successMessage.value = 'Article updated successfully'
      await fetchArticle()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save article'
  } finally {
    isSaving.value = false
  }
}

async function publishArticle() {
  try {
    await magazineService.publishArticle(articleId.value)
    successMessage.value = 'Article published successfully'
    await fetchArticle()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish article'
  }
}

async function toggleFeatured() {
  if (!article.value) return
  try {
    await magazineService.setArticleFeatured(articleId.value, !article.value.featured)
    successMessage.value = article.value.featured ? 'Article unfeatured' : 'Article featured'
    await fetchArticle()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update article'
  }
}

async function deleteArticle() {
  isDeleting.value = true
  error.value = ''

  try {
    await magazineService.deleteArticle(articleId.value)
    router.push('/admin/magazine?tab=articles')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete article'
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

function getStatusBadgeClass(status: ArticleStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800'
    case 'ARCHIVED':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin/magazine?tab=articles"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isNew ? 'Create Article' : 'Edit Article' }}
            </h1>
            <p v-if="article" class="text-gray-600 mt-1">
              {{ article.viewCount.toLocaleString() }} views • {{ article.commentCount }} comments
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="!isNew && article?.status === 'DRAFT'"
            class="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            @click="publishArticle"
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
            :disabled="isSaving || !form.title || !form.content || !form.authorName"
            @click="saveArticle"
          >
            {{ isSaving ? 'Saving...' : (isNew ? 'Create Article' : 'Save Changes') }}
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
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Article Details</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="article-slug"
                  :disabled="!isNew"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  v-model="form.excerpt"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Brief summary of the article..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  v-model="form.content"
                  rows="15"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                  placeholder="Write your article content here (HTML supported)..."
                ></textarea>
              </div>

              <UiImageUpload
                v-model="form.coverImage"
                label="Cover Image"
                folder="magazine/articles"
                :alt="form.title"
                preview-aspect="video"
              />
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Author Information</h2>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                  <input
                    v-model="form.authorName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Reading Time (min)</label>
                  <input
                    v-model.number="form.readingTime"
                    type="number"
                    min="1"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Author Bio</label>
                <textarea
                  v-model="form.authorBio"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Brief author biography..."
                ></textarea>
              </div>

              <UiImageUpload
                v-model="form.authorImage"
                label="Author Image"
                folder="magazine/authors"
                :alt="form.authorName"
                preview-aspect="square"
              />
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  v-model="form.metaTitle"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="SEO title (defaults to article title)"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  v-model="form.metaDescription"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="SEO description (defaults to excerpt)"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Publishing -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Publishing</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div v-if="form.status === 'SCHEDULED'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  v-model="form.scheduledAt"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div v-if="article" class="flex items-center justify-between pt-2">
                <span class="text-sm text-gray-500">Featured</span>
                <button
                  class="p-1 rounded-full transition-colors"
                  :class="article.featured ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-amber-500'"
                  @click="toggleFeatured"
                >
                  <svg class="w-6 h-6" :fill="article.featured ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Organization -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Organization</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                <select
                  v-model="form.editionId"
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
                  v-model="form.categoryId"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option :value="undefined">No category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tags</h2>

            <div class="space-y-3">
              <div class="flex gap-2">
                <input
                  v-model="tagInput"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Add tag..."
                  @keydown.enter.prevent="addTag"
                />
                <button
                  type="button"
                  class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  @click="addTag"
                >
                  Add
                </button>
              </div>

              <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {{ tag }}
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600"
                    @click="removeTag(tag)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Article Info -->
          <div v-if="article" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="getStatusBadgeClass(article.status)"
                >
                  {{ article.status }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Views</span>
                <span class="text-gray-900 font-medium">{{ article.viewCount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Comments</span>
                <span class="text-gray-900 font-medium">{{ article.commentCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created</span>
                <span class="text-gray-900">{{ formatDate(article.createdAt) }}</span>
              </div>
              <div v-if="article.publishedAt" class="flex justify-between">
                <span class="text-gray-500">Published</span>
                <span class="text-gray-900">{{ formatDate(article.publishedAt) }}</span>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Article</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ article?.title }}"? This action cannot be undone.
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
              @click="deleteArticle"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Article' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
