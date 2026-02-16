import type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  UpdateCommentStatusData,
  CommentListParams,
  CommentListResponse,
} from '~/types/comment'
import { useAuthStore } from '~/stores/auth'

const API_BASE = '/api/v1'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('art-gallery-auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.accessToken || null
    }
  } catch {
  }

  const authStore = useAuthStore()
  return authStore.accessToken
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function buildQueryString(params?: CommentListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.status) query.set('status', params.status)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function useCommentService() {
  return {
    getArtworkComments: async (artworkId: string, params?: CommentListParams): Promise<CommentListResponse> => {
      return $fetch<CommentListResponse>(`${API_BASE}/artworks/${artworkId}/comments${buildQueryString(params)}`)
    },

    getExhibitionComments: async (exhibitionId: string, params?: CommentListParams): Promise<CommentListResponse> => {
      return $fetch<CommentListResponse>(`${API_BASE}/exhibitions/${exhibitionId}/comments${buildQueryString(params)}`)
    },

    getArticleComments: async (articleId: string, params?: CommentListParams): Promise<CommentListResponse> => {
      return $fetch<CommentListResponse>(`${API_BASE}/articles/${articleId}/comments${buildQueryString(params)}`)
    },

    getBlogPostComments: async (blogPostId: string, params?: CommentListParams): Promise<CommentListResponse> => {
      return $fetch<CommentListResponse>(`${API_BASE}/blog-posts/${blogPostId}/comments${buildQueryString(params)}`)
    },

    getCommentReplies: async (commentId: string, params?: CommentListParams): Promise<CommentListResponse> => {
      return $fetch<CommentListResponse>(`${API_BASE}/comments/${commentId}/replies${buildQueryString(params)}`)
    },

    getCommentById: async (id: string): Promise<Comment> => {
      return $fetch<Comment>(`${API_BASE}/comments/${id}`)
    },

    createComment: async (data: CreateCommentData): Promise<Comment> => {
      return $fetch<Comment>(`${API_BASE}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateComment: async (id: string, data: UpdateCommentData): Promise<Comment> => {
      return $fetch<Comment>(`${API_BASE}/comments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteComment: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/comments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    getPendingComments: async (params?: CommentListParams): Promise<CommentListResponse> => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.limit) query.set('limit', String(params.limit))
      const queryString = query.toString()

      return $fetch<CommentListResponse>(`${API_BASE}/comments/admin/pending${queryString ? `?${queryString}` : ''}`, {
        headers: getHeaders(),
      })
    },

    updateCommentStatus: async (id: string, data: UpdateCommentStatusData): Promise<Comment> => {
      return $fetch<Comment>(`${API_BASE}/comments/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    adminDeleteComment: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/comments/${id}/admin`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}
