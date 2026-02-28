import { defineStore } from 'pinia'
import type {
  Comment,
  CommentListParams,
  CreateCommentData,
  UpdateCommentData,
  UpdateCommentStatusData,
  CommentTargetType,
} from '~/types/comment'
import { useCommentService } from '~/services/comment.service'

interface CommentsState {
  comments: Comment[]
  currentComment: Comment | null
  replies: Comment[]
  pendingComments: Comment[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  replyPagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  pendingPagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useCommentsStore = defineStore('comments', {
  state: (): CommentsState => ({
    comments: [],
    currentComment: null,
    replies: [],
    pendingComments: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    replyPagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    pendingPagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    },
  }),

  getters: {
    hasComments: (state) => state.comments.length > 0,
    hasPendingComments: (state) => state.pendingComments.length > 0,
    approvedComments: (state) => state.comments.filter((c) => c.status === 'APPROVED'),
  },

  actions: {
    // Public Comment Fetching by Target Type
    async fetchArtworkComments(artworkId: string, params?: CommentListParams) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const response = await commentService.getArtworkComments(artworkId, {
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          ...params,
        })

        this.comments = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch comments'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchExhibitionComments(exhibitionId: string, params?: CommentListParams) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const response = await commentService.getExhibitionComments(exhibitionId, {
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          ...params,
        })

        this.comments = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch comments'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchArticleComments(articleId: string, params?: CommentListParams) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const response = await commentService.getArticleComments(articleId, {
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          ...params,
        })

        this.comments = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch comments'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchBlogPostComments(blogPostId: string, params?: CommentListParams) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const response = await commentService.getBlogPostComments(blogPostId, {
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          ...params,
        })

        this.comments = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch comments'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Unified fetch method for convenience
    async fetchComments(targetType: CommentTargetType, targetId: string, params?: CommentListParams) {
      switch (targetType) {
        case 'artwork':
          return this.fetchArtworkComments(targetId, params)
        case 'exhibition':
          return this.fetchExhibitionComments(targetId, params)
        case 'article':
          return this.fetchArticleComments(targetId, params)
        case 'blogPost':
          return this.fetchBlogPostComments(targetId, params)
        default:
          return { success: false, error: 'Invalid target type' }
      }
    },

    async fetchCommentReplies(commentId: string, params?: CommentListParams) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const response = await commentService.getCommentReplies(commentId, {
          page: params?.page || this.replyPagination.page,
          limit: params?.limit || this.replyPagination.limit,
          ...params,
        })

        this.replies = response.data
        this.replyPagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch replies'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCommentById(id: string) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        this.currentComment = await commentService.getCommentById(id)
        return { success: true, data: this.currentComment }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch comment'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Comment CRUD Actions
    async createComment(data: CreateCommentData) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const comment = await commentService.createComment(data)

        // Add to replies if it's a reply, otherwise add to comments
        if (data.parentId) {
          this.replies.unshift(comment)
          // Update reply count on parent if present
          const parentIndex = this.comments.findIndex((c) => c.id === data.parentId)
          if (parentIndex !== -1) {
            this.comments[parentIndex].replyCount += 1
          }
        } else {
          this.comments.unshift(comment)
        }

        return { success: true, data: comment }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to create comment'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateComment(id: string, data: UpdateCommentData) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const comment = await commentService.updateComment(id, data)

        // Update in comments list
        const index = this.comments.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.comments[index] = comment
        }

        // Update in replies list
        const replyIndex = this.replies.findIndex((c) => c.id === id)
        if (replyIndex !== -1) {
          this.replies[replyIndex] = comment
        }

        if (this.currentComment?.id === id) {
          this.currentComment = comment
        }

        return { success: true, data: comment }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update comment'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteComment(id: string) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        await commentService.deleteComment(id)

        this.comments = this.comments.filter((c) => c.id !== id)
        this.replies = this.replies.filter((c) => c.id !== id)

        if (this.currentComment?.id === id) {
          this.currentComment = null
        }

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete comment'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Moderation Actions
    async fetchPendingComments(params?: CommentListParams) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const response = await commentService.getPendingComments({
          page: params?.page || this.pendingPagination.page,
          limit: params?.limit || this.pendingPagination.limit,
          ...params,
        })

        this.pendingComments = response.data
        this.pendingPagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch pending comments'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateCommentStatus(id: string, data: UpdateCommentStatusData) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        const comment = await commentService.updateCommentStatus(id, data)

        // Update in all lists
        const updateInList = (list: Comment[]) => {
          const index = list.findIndex((c) => c.id === id)
          if (index !== -1) {
            list[index] = comment
          }
        }

        updateInList(this.comments)
        updateInList(this.replies)
        updateInList(this.pendingComments)

        // Remove from pending if approved or rejected
        if (data.status !== 'PENDING') {
          this.pendingComments = this.pendingComments.filter((c) => c.id !== id)
        }

        if (this.currentComment?.id === id) {
          this.currentComment = comment
        }

        return { success: true, data: comment }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update comment status'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async adminDeleteComment(id: string) {
      this.loading = true
      this.error = null

      try {
        const commentService = useCommentService()
        await commentService.adminDeleteComment(id)

        this.comments = this.comments.filter((c) => c.id !== id)
        this.replies = this.replies.filter((c) => c.id !== id)
        this.pendingComments = this.pendingComments.filter((c) => c.id !== id)

        if (this.currentComment?.id === id) {
          this.currentComment = null
        }

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete comment'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Utility Actions
    clearComments() {
      this.comments = []
      this.pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    },

    clearReplies() {
      this.replies = []
      this.replyPagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    },

    clearCurrentComment() {
      this.currentComment = null
    },

    clearError() {
      this.error = null
    },
  },
})
