<script setup lang="ts">
import type {
  BlogPost,
  BlogPostStatus,
  CreateBlogPostData,
  UpdateBlogPostData,
} from '~/types/blog'
import { useBlogService } from '~/services/blog.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const blogService = useBlogService()

const isLoading = ref(true)
const error = ref('')

const posts = ref<BlogPost[]>([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const filters = reactive<{ status?: BlogPostStatus; search: string }>({
  status: undefined,
  search: '',
})

const showPostModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

const selectedPost = ref<BlogPost | null>(null)
const postForm = reactive<CreateBlogPostData>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  authorName: '',
  readingTime: undefined,
  metaTitle: '',
  metaDescription: '',
  tags: [],
  status: 'DRAFT',
})

const statusOptions: { value: BlogPostStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ARCHIVED', label: 'Archived' },
]

async function fetchPosts() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await blogService.adminGetPosts({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status,
      search: filters.search || undefined,
      sortBy: 'newest',
    })
    posts.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch posts'
  } finally {
    isLoading.value = false
  }
}

function openPostModal(post?: BlogPost) {
  if (post) {
    isEditing.value = true
    selectedPost.value = post
    postForm.title = post.title
    postForm.slug = post.slug
    postForm.excerpt = post.excerpt || ''
    postForm.content = post.content
    postForm.coverImage = post.coverImage || ''
    postForm.authorName = post.authorName
    postForm.readingTime = post.readingTime
    postForm.metaTitle = post.metaTitle || ''
    postForm.metaDescription = post.metaDescription || ''
    postForm.tags = post.tags?.map(t => t.name) || []
    postForm.status = post.status
  } else {
    isEditing.value = false
    selectedPost.value = null
    postForm.title = ''
    postForm.slug = ''
    postForm.excerpt = ''
    postForm.content = ''
    postForm.coverImage = ''
    postForm.authorName = ''
    postForm.readingTime = undefined
    postForm.metaTitle = ''
    postForm.metaDescription = ''
    postForm.tags = []
    postForm.status = 'DRAFT'
  }
  showPostModal.value = true
}

async function savePost() {
  if (!postForm.title || !postForm.slug || !postForm.content || !postForm.authorName) {
    error.value = 'Title, slug, content, and author name are required'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    if (isEditing.value && selectedPost.value) {
      const updateData: UpdateBlogPostData = {
        title: postForm.title,
        excerpt: postForm.excerpt || undefined,
        content: postForm.content,
        coverImage: postForm.coverImage || undefined,
        authorName: postForm.authorName,
        readingTime: postForm.readingTime,
        metaTitle: postForm.metaTitle || undefined,
        metaDescription: postForm.metaDescription || undefined,
        tags: postForm.tags,
        status: postForm.status,
      }
      await blogService.updatePost(selectedPost.value.id, updateData)
    } else {
      await blogService.createPost(postForm)
    }
    showPostModal.value = false
    await fetchPosts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save post'
  } finally {
    isSaving.value = false
  }
}

async function publishPost(post: BlogPost) {
  if (!confirm(`Are you sure you want to publish "${post.title}"?`)) return

  try {
    await blogService.publishPost(post.id)
    await fetchPosts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish post'
  }
}

async function unpublishPost(post: BlogPost) {
  if (!confirm(`Are you sure you want to unpublish "${post.title}"?`)) return

  try {
    await blogService.unpublishPost(post.id)
    await fetchPosts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to unpublish post'
  }
}

async function toggleFeatured(post: BlogPost) {
  try {
    await blogService.setFeatured(post.id, !post.featured)
    await fetchPosts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update featured status'
  }
}

async function deletePost(post: BlogPost) {
  if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return

  try {
    await blogService.deletePost(post.id)
    await fetchPosts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete post'
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getStatusColor(status: BlogPostStatus): string {
  const colors: Record<BlogPostStatus, string> = {
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

watch([() => filters.status, () => filters.search], () => {
  pagination.page = 1
  fetchPosts()
})

watch(() => postForm.title, (title) => {
  if (!isEditing.value) {
    postForm.slug = generateSlug(title)
  }
})

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p class="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>
        <NuxtLink
          to="/admin/blog/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </NuxtLink>
      </div>

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value || undefined">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search posts..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <div v-else-if="posts.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      v-if="post.coverImage"
                      :src="post.coverImage"
                      :alt="post.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ post.title }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span v-if="post.featured" class="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Featured</span>
                      <span class="text-sm text-gray-500">{{ post.viewCount }} views</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(post.status)"
                >
                  {{ post.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ post.authorName }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(post.publishedAt || post.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    :class="post.featured ? 'text-yellow-500' : 'text-gray-400'"
                    title="Toggle featured"
                    @click="toggleFeatured(post)"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                  <button
                    v-if="post.status === 'DRAFT'"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Publish"
                    @click="publishPost(post)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    v-if="post.status === 'PUBLISHED'"
                    class="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Unpublish"
                    @click="unpublishPost(post)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <NuxtLink
                    :to="`/admin/blog/${post.id}`"
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
                    @click="deletePost(post)"
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

        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} posts
          </p>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === 1"
              @click="pagination.page--; fetchPosts()"
            >
              Previous
            </button>
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === pagination.totalPages"
              @click="pagination.page++; fetchPosts()"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
        <p class="text-gray-500 mb-4">Create your first blog post to get started.</p>
        <NuxtLink
          to="/admin/blog/new"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Post
        </NuxtLink>
      </div>

      <div
        v-if="showPostModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showPostModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Post' : 'Create Post' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                v-model="postForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                v-model="postForm.slug"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                :disabled="isEditing"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                v-model="postForm.excerpt"
                rows="2"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Brief summary..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                v-model="postForm.content"
                rows="10"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                placeholder="Post content (HTML supported)..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                <input
                  v-model="postForm.authorName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Reading Time (min)</label>
                <input
                  v-model.number="postForm.readingTime"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <UiImageUpload
              v-model="postForm.coverImage"
              label="Cover Image"
              folder="blog"
              :alt="postForm.title"
              preview-aspect="video"
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="postForm.status"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  v-model="postForm.metaTitle"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <input
                  v-model="postForm.metaDescription"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showPostModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              :disabled="isSaving || !postForm.title || !postForm.slug || !postForm.content || !postForm.authorName"
              @click="savePost"
            >
              {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
