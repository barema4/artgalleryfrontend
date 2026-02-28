<script setup lang="ts">
import type { BlogPost, BlogPostStatus, CreateBlogPostData, UpdateBlogPostData } from '~/types/blog'
import { useBlogService } from '~/services/blog.service'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const blogService = useBlogService()

const isNew = computed(() => route.params.id === 'new')
const postId = computed(() => route.params.id as string)

interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  authorName: string
  readingTime: number | undefined
  metaTitle: string
  metaDescription: string
  tags: string[]
  status: BlogPostStatus
  scheduledAt: string
}

const form = ref<BlogFormData>({
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
  scheduledAt: '',
})

const tagInput = ref('')

const loading = ref(false)
const error = ref('')
const success = ref(false)

// Delete confirmation
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Preview
const showPreview = ref(false)

const statusOptions: { value: BlogPostStatus; label: string; description: string }[] = [
  { value: 'DRAFT', label: 'Draft', description: 'Not visible to the public' },
  { value: 'PUBLISHED', label: 'Published', description: 'Visible to everyone' },
  { value: 'SCHEDULED', label: 'Scheduled', description: 'Will be published at a specific time' },
  { value: 'ARCHIVED', label: 'Archived', description: 'Hidden from public but preserved' },
]

async function loadPost() {
  if (isNew.value) return

  loading.value = true
  error.value = ''

  try {
    const post = await blogService.adminGetPostById(postId.value)
    form.value = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      coverImage: post.coverImage || '',
      authorName: post.authorName,
      readingTime: post.readingTime,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      tags: post.tags?.map(t => t.name) || [],
      status: post.status,
      scheduledAt: post.scheduledAt || '',
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load post'
  } finally {
    loading.value = false
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function handleTitleChange() {
  if (isNew.value && form.value.title) {
    form.value.slug = generateSlug(form.value.title)
  }
}

function calculateReadingTime() {
  const wordsPerMinute = 200
  const words = form.value.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  form.value.readingTime = Math.ceil(words / wordsPerMinute) || 1
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

async function handleSubmit(saveAsDraft = false) {
  loading.value = true
  error.value = ''
  success.value = false

  const status = saveAsDraft ? 'DRAFT' : form.value.status

  try {
    if (isNew.value) {
      const createData: CreateBlogPostData = {
        title: form.value.title,
        slug: form.value.slug,
        excerpt: form.value.excerpt || undefined,
        content: form.value.content,
        coverImage: form.value.coverImage || undefined,
        authorName: form.value.authorName,
        readingTime: form.value.readingTime,
        metaTitle: form.value.metaTitle || undefined,
        metaDescription: form.value.metaDescription || undefined,
        tags: form.value.tags.length > 0 ? form.value.tags : undefined,
        status,
        scheduledAt: form.value.scheduledAt || undefined,
      }
      await blogService.createPost(createData)
    } else {
      const updateData: UpdateBlogPostData = {
        title: form.value.title,
        excerpt: form.value.excerpt || undefined,
        content: form.value.content,
        coverImage: form.value.coverImage || undefined,
        authorName: form.value.authorName,
        readingTime: form.value.readingTime,
        metaTitle: form.value.metaTitle || undefined,
        metaDescription: form.value.metaDescription || undefined,
        tags: form.value.tags,
        status,
        scheduledAt: form.value.scheduledAt || undefined,
      }
      await blogService.updatePost(postId.value, updateData)
    }
    success.value = true
    setTimeout(() => {
      router.push('/admin/blog')
    }, 1500)
  } catch (e: any) {
    error.value = e?.data?.message || `Failed to ${isNew.value ? 'create' : 'update'} post`
  } finally {
    loading.value = false
  }
}

async function publishPost() {
  if (!postId.value || isNew.value) return

  loading.value = true
  try {
    await blogService.publishPost(postId.value)
    success.value = true
    setTimeout(() => {
      router.push('/admin/blog')
    }, 1500)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to publish post'
  } finally {
    loading.value = false
  }
}

async function deletePost() {
  isDeleting.value = true
  try {
    await blogService.deletePost(postId.value)
    router.push('/admin/blog')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete post'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadPost()
})

useHead({
  title: isNew.value ? 'Create Blog Post | Admin' : 'Edit Blog Post | Admin',
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink
        to="/admin/blog"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </NuxtLink>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isNew ? 'Create New Post' : 'Edit Post' }}
        </h1>
        <div class="flex items-center gap-2">
          <button
            v-if="!isNew"
            class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            @click="showPreview = !showPreview"
          >
            {{ showPreview ? 'Edit' : 'Preview' }}
          </button>
          <button
            v-if="!isNew"
            class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800">
        Post {{ isNew ? 'created' : 'updated' }} successfully! Redirecting...
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !form.title" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Preview Mode -->
    <div v-else-if="showPreview" class="bg-white rounded-lg border border-gray-200 p-8">
      <div v-if="form.coverImage" class="mb-6 -mx-8 -mt-8">
        <img :src="form.coverImage" :alt="form.title" class="w-full h-64 object-cover rounded-t-lg" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ form.title }}</h1>
      <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <span>By {{ form.authorName }}</span>
        <span v-if="form.readingTime">{{ form.readingTime }} min read</span>
      </div>
      <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="tag in form.tags"
          :key="tag"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
        >
          {{ tag }}
        </span>
      </div>
      <div class="prose max-w-none" v-html="form.content"></div>
    </div>

    <!-- Edit Form -->
    <form v-else @submit.prevent="handleSubmit(false)" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title & Slug -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter post title"
                  @input="handleTitleChange"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">/blog/</span>
                  <input
                    v-model="form.slug"
                    type="text"
                    required
                    :disabled="!isNew"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100"
                    placeholder="post-slug"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Excerpt -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
            <textarea
              v-model="form.excerpt"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Brief summary of the post..."
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">Used in blog listings and social sharing</p>
          </div>

          <!-- Content -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">
                Content <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-800"
                @click="calculateReadingTime"
              >
                Calculate reading time
              </button>
            </div>
            <textarea
              v-model="form.content"
              rows="20"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
              placeholder="Write your post content here... (HTML supported)"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">HTML formatting is supported</p>
          </div>

          <!-- SEO -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  v-model="form.metaTitle"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="SEO title (leave empty to use post title)"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  v-model="form.metaDescription"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="SEO description (leave empty to use excerpt)"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Publish Settings -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Publish</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  {{ statusOptions.find(o => o.value === form.status)?.description }}
                </p>
              </div>

              <div v-if="form.status === 'SCHEDULED'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                <input
                  v-model="form.scheduledAt"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  :disabled="loading"
                  @click="handleSubmit(true)"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  :disabled="loading || !form.title || !form.slug || !form.content || !form.authorName"
                >
                  {{ loading ? 'Saving...' : (form.status === 'PUBLISHED' ? 'Publish' : 'Save') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Cover Image -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Cover Image</h3>
            <div v-if="form.coverImage" class="mb-3">
              <img
                :src="form.coverImage"
                alt="Cover preview"
                class="w-full h-32 object-cover rounded-lg"
              />
            </div>
            <input
              v-model="form.coverImage"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <!-- Author -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Author</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.authorName"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Reading Time</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="form.readingTime"
                    type="number"
                    min="1"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="5"
                  />
                  <span class="text-gray-500">min</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Tags</h3>
            <div class="flex gap-2 mb-3">
              <input
                v-model="tagInput"
                type="text"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Add tag"
                @keydown.enter.prevent="addTag"
              />
              <button
                type="button"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                @click="addTag"
              >
                Add
              </button>
            </div>
            <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {{ tag }}
                <button type="button" class="hover:text-red-600" @click="removeTag(tag)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <p v-else class="text-sm text-gray-500">No tags added</p>
          </div>
        </div>
      </div>

      <!-- Bottom Actions (mobile) -->
      <div class="lg:hidden flex gap-4 pt-4">
        <NuxtLink
          to="/admin/blog"
          class="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : (isNew ? 'Create Post' : 'Update Post') }}
        </button>
      </div>
    </form>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Delete Post</h3>
            <p class="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete <span class="font-medium">"{{ form.title }}"</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            :disabled="isDeleting"
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            :disabled="isDeleting"
            @click="deletePost"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Post' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
