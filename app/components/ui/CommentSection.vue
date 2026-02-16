<script setup lang="ts">
import type { Comment, CreateCommentData, CommentListParams } from '~/types/comment'
import { useCommentService } from '~/services/comment.service'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  targetType: 'artwork' | 'blogPost' | 'exhibition' | 'article'
  targetId: string
}>()

const commentService = useCommentService()
const authStore = useAuthStore()

const comments = ref<Comment[]>([])
const isLoading = ref(true)
const error = ref('')
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const newComment = ref('')
const isSubmitting = ref(false)
const editingComment = ref<Comment | null>(null)
const editContent = ref('')

const replyingTo = ref<Comment | null>(null)
const replyContent = ref('')

async function fetchComments() {
  isLoading.value = true
  error.value = ''

  try {
    const params: CommentListParams = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: 'newest',
    }

    let response
    switch (props.targetType) {
      case 'artwork':
        response = await commentService.getArtworkComments(props.targetId, params)
        break
      case 'blogPost':
        response = await commentService.getBlogPostComments(props.targetId, params)
        break
      case 'exhibition':
        response = await commentService.getExhibitionComments(props.targetId, params)
        break
      case 'article':
        response = await commentService.getArticleComments(props.targetId, params)
        break
    }

    if (response) {
      comments.value = response.data
      pagination.total = response.total
      pagination.totalPages = response.totalPages
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load comments'
  } finally {
    isLoading.value = false
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return

  isSubmitting.value = true
  error.value = ''

  try {
    const data: CreateCommentData = {
      content: newComment.value.trim(),
    }

    switch (props.targetType) {
      case 'artwork':
        data.artworkId = props.targetId
        break
      case 'blogPost':
        data.blogPostId = props.targetId
        break
      case 'exhibition':
        data.exhibitionId = props.targetId
        break
      case 'article':
        data.articleId = props.targetId
        break
    }

    await commentService.createComment(data)
    newComment.value = ''
    pagination.page = 1
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to post comment'
  } finally {
    isSubmitting.value = false
  }
}

async function submitReply() {
  if (!replyContent.value.trim() || !replyingTo.value) return

  isSubmitting.value = true
  error.value = ''

  try {
    const data: CreateCommentData = {
      content: replyContent.value.trim(),
      parentId: replyingTo.value.id,
    }

    switch (props.targetType) {
      case 'artwork':
        data.artworkId = props.targetId
        break
      case 'blogPost':
        data.blogPostId = props.targetId
        break
      case 'exhibition':
        data.exhibitionId = props.targetId
        break
      case 'article':
        data.articleId = props.targetId
        break
    }

    await commentService.createComment(data)
    replyContent.value = ''
    replyingTo.value = null
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to post reply'
  } finally {
    isSubmitting.value = false
  }
}

function startEditing(comment: Comment) {
  editingComment.value = comment
  editContent.value = comment.content
}

function cancelEditing() {
  editingComment.value = null
  editContent.value = ''
}

async function saveEdit() {
  if (!editContent.value.trim() || !editingComment.value) return

  isSubmitting.value = true
  error.value = ''

  try {
    await commentService.updateComment(editingComment.value.id, {
      content: editContent.value.trim(),
    })
    editingComment.value = null
    editContent.value = ''
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update comment'
  } finally {
    isSubmitting.value = false
  }
}

async function deleteComment(comment: Comment) {
  if (!confirm('Are you sure you want to delete this comment?')) return

  try {
    await commentService.deleteComment(comment.id)
    await fetchComments()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete comment'
  }
}

function startReply(comment: Comment) {
  replyingTo.value = comment
  replyContent.value = ''
}

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getUserInitial(comment: Comment): string {
  if (comment.user?.firstName) {
    return comment.user.firstName.charAt(0).toUpperCase()
  }
  return 'U'
}

function getUserName(comment: Comment): string {
  if (comment.user?.firstName) {
    const lastName = comment.user.lastName || ''
    return `${comment.user.firstName} ${lastName}`.trim()
  }
  return 'Anonymous'
}

function isOwnComment(comment: Comment): boolean {
  return authStore.user?.id === comment.userId
}

onMounted(() => {
  fetchComments()
})

watch(() => props.targetId, () => {
  pagination.page = 1
  fetchComments()
})
</script>

<template>
  <div class="comment-section">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-display font-bold text-bark-800">
        Comments
        <span v-if="pagination.total > 0" class="text-bark-500 font-normal text-base">
          ({{ pagination.total }})
        </span>
      </h3>
    </div>

    <UiAlert v-if="error" type="error" class="mb-4" dismissible @dismiss="error = ''">
      {{ error }}
    </UiAlert>

    <div v-if="authStore.isAuthenticated" class="mb-8">
      <div class="flex gap-3">
        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-medium text-primary-700">
            {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1">
          <textarea
            v-model="newComment"
            rows="3"
            class="w-full px-4 py-3 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Write a comment..."
            :disabled="isSubmitting"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              class="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!newComment.trim() || isSubmitting"
              @click="submitComment"
            >
              <span v-if="isSubmitting">Posting...</span>
              <span v-else>Post Comment</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mb-8 bg-earth-50 rounded-xl p-6 text-center">
      <p class="text-bark-600 mb-3">Sign in to leave a comment</p>
      <NuxtLink
        to="/auth/login"
        class="inline-block px-6 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
      >
        Sign In
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <div v-else-if="comments.length > 0" class="space-y-6">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="flex gap-3">
          <div class="w-10 h-10 bg-earth-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              v-if="comment.user?.avatar"
              :src="comment.user.avatar"
              :alt="getUserName(comment)"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-sm font-medium text-bark-600">
              {{ getUserInitial(comment) }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-bark-800">{{ getUserName(comment) }}</span>
              <span class="text-sm text-bark-400">{{ formatDate(comment.createdAt) }}</span>
              <span
                v-if="comment.status === 'PENDING'"
                class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"
              >
                Pending
              </span>
            </div>

            <div v-if="editingComment?.id === comment.id" class="mt-2">
              <textarea
                v-model="editContent"
                rows="3"
                class="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                :disabled="isSubmitting"
              ></textarea>
              <div class="flex gap-2 mt-2">
                <button
                  class="px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  :disabled="!editContent.trim() || isSubmitting"
                  @click="saveEdit"
                >
                  Save
                </button>
                <button
                  class="px-3 py-1.5 text-bark-600 text-sm font-medium hover:bg-earth-100 rounded-lg transition-colors"
                  @click="cancelEditing"
                >
                  Cancel
                </button>
              </div>
            </div>

            <p v-else class="text-bark-600 whitespace-pre-line">{{ comment.content }}</p>

            <div v-if="editingComment?.id !== comment.id" class="flex items-center gap-4 mt-2">
              <button
                v-if="authStore.isAuthenticated"
                class="text-sm text-bark-500 hover:text-primary-600 transition-colors"
                @click="startReply(comment)"
              >
                Reply
              </button>
              <button
                v-if="isOwnComment(comment)"
                class="text-sm text-bark-500 hover:text-primary-600 transition-colors"
                @click="startEditing(comment)"
              >
                Edit
              </button>
              <button
                v-if="isOwnComment(comment)"
                class="text-sm text-bark-500 hover:text-red-600 transition-colors"
                @click="deleteComment(comment)"
              >
                Delete
              </button>
            </div>

            <div v-if="replyingTo?.id === comment.id" class="mt-4 pl-4 border-l-2 border-earth-200">
              <textarea
                v-model="replyContent"
                rows="2"
                class="w-full px-3 py-2 border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                :placeholder="`Reply to ${getUserName(comment)}...`"
                :disabled="isSubmitting"
              ></textarea>
              <div class="flex gap-2 mt-2">
                <button
                  class="px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  :disabled="!replyContent.trim() || isSubmitting"
                  @click="submitReply"
                >
                  Reply
                </button>
                <button
                  class="px-3 py-1.5 text-bark-600 text-sm font-medium hover:bg-earth-100 rounded-lg transition-colors"
                  @click="cancelReply"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-4 pl-4 border-l-2 border-earth-100">
              <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                <div class="w-8 h-8 bg-earth-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    v-if="reply.user?.avatar"
                    :src="reply.user.avatar"
                    :alt="reply.user?.firstName || 'User'"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-xs font-medium text-bark-600">
                    {{ reply.user?.firstName?.charAt(0) || 'U' }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-bark-800 text-sm">
                      {{ reply.user?.firstName || 'Anonymous' }} {{ reply.user?.lastName || '' }}
                    </span>
                    <span class="text-xs text-bark-400">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                  <p class="text-bark-600 text-sm whitespace-pre-line">{{ reply.content }}</p>
                </div>
              </div>
            </div>

            <button
              v-if="comment.replyCount > (comment.replies?.length || 0)"
              class="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View {{ comment.replyCount - (comment.replies?.length || 0) }} more replies
            </button>
          </div>
        </div>
      </div>

      <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 pt-4">
        <button
          class="px-4 py-2 border border-earth-200 rounded-lg text-sm disabled:opacity-50 hover:bg-earth-50 transition-colors"
          :disabled="pagination.page === 1"
          @click="pagination.page--; fetchComments()"
        >
          Previous
        </button>
        <span class="px-4 py-2 text-sm text-bark-600">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <button
          class="px-4 py-2 border border-earth-200 rounded-lg text-sm disabled:opacity-50 hover:bg-earth-50 transition-colors"
          :disabled="pagination.page === pagination.totalPages"
          @click="pagination.page++; fetchComments()"
        >
          Next
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="text-bark-500">No comments yet. Be the first to share your thoughts!</p>
    </div>
  </div>
</template>
