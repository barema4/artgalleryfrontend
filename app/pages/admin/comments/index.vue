<script setup lang="ts">
import type { Comment, CommentStatus, CommentListParams } from '~/types/comment'
import { useCommentService } from '~/services/comment.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const commentService = useCommentService()

const comments = ref<Comment[]>([])
const isLoading = ref(true)
const error = ref('')
const activeTab = ref<'pending' | 'all'>('pending')

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const filters = reactive<{ status?: CommentStatus }>({
  status: undefined,
})

const statusOptions: { value: CommentStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

const processingIds = ref<Set<string>>(new Set())

async function fetchComments() {
  isLoading.value = true
  error.value = ''

  try {
    if (activeTab.value === 'pending') {
      const response = await commentService.getPendingComments({
        page: pagination.page,
        limit: pagination.limit,
      })
      comments.value = response.data
      pagination.total = response.total
      pagination.totalPages = response.totalPages
    } else {
      const response = await commentService.getPendingComments({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
      })
      comments.value = response.data
      pagination.total = response.total
      pagination.totalPages = response.totalPages
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch comments'
  } finally {
    isLoading.value = false
  }
}

async function approveComment(comment: Comment) {
  processingIds.value.add(comment.id)
  error.value = ''

  try {
    await commentService.updateCommentStatus(comment.id, { status: 'APPROVED' })
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to approve comment'
  } finally {
    processingIds.value.delete(comment.id)
  }
}

async function rejectComment(comment: Comment) {
  processingIds.value.add(comment.id)
  error.value = ''

  try {
    await commentService.updateCommentStatus(comment.id, { status: 'REJECTED' })
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to reject comment'
  } finally {
    processingIds.value.delete(comment.id)
  }
}

async function deleteComment(comment: Comment) {
  if (!confirm('Are you sure you want to permanently delete this comment?')) return

  processingIds.value.add(comment.id)
  error.value = ''

  try {
    await commentService.adminDeleteComment(comment.id)
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete comment'
  } finally {
    processingIds.value.delete(comment.id)
  }
}

function getStatusColor(status: CommentStatus): string {
  const colors: Record<CommentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

function getTargetType(comment: Comment): string {
  if (comment.artworkId) return 'Artwork'
  if (comment.blogPostId) return 'Blog Post'
  if (comment.exhibitionId) return 'Exhibition'
  if (comment.articleId) return 'Article'
  return 'Unknown'
}

function getTargetLink(comment: Comment): string | null {
  if (comment.artworkId) return `/artworks/${comment.artworkId}`
  if (comment.blogPostId) return `/blog/${comment.blogPostId}`
  return null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUserName(comment: Comment): string {
  if (comment.user?.firstName) {
    const lastName = comment.user.lastName || ''
    return `${comment.user.firstName} ${lastName}`.trim()
  }
  return 'Anonymous'
}

function isProcessing(id: string): boolean {
  return processingIds.value.has(id)
}

watch(activeTab, () => {
  pagination.page = 1
  fetchComments()
})

watch(() => filters.status, () => {
  pagination.page = 1
  fetchComments()
})

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Comment Moderation</h1>
        <p class="text-gray-600 mt-1">Review and moderate user comments</p>
      </div>

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div class="flex border-b border-gray-200 mb-6">
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'pending'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'pending'"
        >
          Pending Review
          <span v-if="activeTab === 'pending' && pagination.total > 0" class="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            {{ pagination.total }}
          </span>
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'all'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'all'"
        >
          All Comments
        </button>
      </div>

      <div v-if="activeTab === 'all'" class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
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
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <div v-else-if="comments.length > 0" class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="bg-white border border-gray-200 rounded-xl p-6"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    v-if="comment.user?.avatar"
                    :src="comment.user.avatar"
                    :alt="getUserName(comment)"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-sm font-medium text-gray-600">
                    {{ comment.user?.firstName?.charAt(0) || 'U' }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ getUserName(comment) }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</p>
                </div>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(comment.status)"
                >
                  {{ comment.status }}
                </span>
              </div>

              <p class="text-gray-700 whitespace-pre-line mb-3">{{ comment.content }}</p>

              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span class="px-2 py-0.5 bg-gray-100 rounded">{{ getTargetType(comment) }}</span>
                <NuxtLink
                  v-if="getTargetLink(comment)"
                  :to="getTargetLink(comment)!"
                  class="text-primary-600 hover:text-primary-700"
                  target="_blank"
                >
                  View context
                </NuxtLink>
              </div>

              <div v-if="comment.parentId" class="mt-2 text-sm text-gray-500 italic">
                This is a reply to another comment
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <button
                v-if="comment.status === 'PENDING'"
                class="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                :disabled="isProcessing(comment.id)"
                @click="approveComment(comment)"
              >
                <span v-if="isProcessing(comment.id)">...</span>
                <span v-else>Approve</span>
              </button>
              <button
                v-if="comment.status === 'PENDING'"
                class="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                :disabled="isProcessing(comment.id)"
                @click="rejectComment(comment)"
              >
                <span v-if="isProcessing(comment.id)">...</span>
                <span v-else>Reject</span>
              </button>
              <button
                class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                :disabled="isProcessing(comment.id)"
                @click="deleteComment(comment)"
              >
                <span v-if="isProcessing(comment.id)">...</span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between pt-4">
          <p class="text-sm text-gray-500">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
            {{ pagination.total }} comments
          </p>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === 1"
              @click="pagination.page--; fetchComments()"
            >
              Previous
            </button>
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === pagination.totalPages"
              @click="pagination.page++; fetchComments()"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No comments to review</h3>
        <p class="text-gray-500">
          {{ activeTab === 'pending' ? 'All comments have been moderated.' : 'No comments found.' }}
        </p>
      </div>
    </div>
  </div>
</template>
