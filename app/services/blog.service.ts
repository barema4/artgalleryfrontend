import type {
  BlogPost,
  CreateBlogPostData,
  UpdateBlogPostData,
  BlogPostListParams,
  BlogPostListResponse,
  PopularTag,
} from '~/types/blog'
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
    // Fallback to store
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

function buildQueryString(params?: BlogPostListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.featured !== undefined) query.set('featured', String(params.featured))
  if (params.search) query.set('search', params.search)
  if (params.tag) query.set('tag', params.tag)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function useBlogService() {
  return {
    // Public endpoints
    getPosts: async (params?: BlogPostListParams): Promise<BlogPostListResponse> => {
      return $fetch<BlogPostListResponse>(`${API_BASE}/blog/posts${buildQueryString(params)}`)
    },

    getPostBySlug: async (slug: string): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/posts/${slug}`)
    },

    getPopularTags: async (limit?: number): Promise<PopularTag[]> => {
      const query = limit ? `?limit=${limit}` : ''
      return $fetch<PopularTag[]>(`${API_BASE}/blog/tags/popular${query}`)
    },

    // Admin endpoints
    adminGetPosts: async (params?: BlogPostListParams): Promise<BlogPostListResponse> => {
      return $fetch<BlogPostListResponse>(`${API_BASE}/blog/admin/posts${buildQueryString(params)}`, {
        headers: getHeaders(),
      })
    },

    adminGetPostById: async (id: string): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/admin/posts/${id}`, {
        headers: getHeaders(),
      })
    },

    createPost: async (data: CreateBlogPostData): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/admin/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updatePost: async (id: string, data: UpdateBlogPostData): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/admin/posts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deletePost: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/blog/admin/posts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    publishPost: async (id: string): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/admin/posts/${id}/publish`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    unpublishPost: async (id: string): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/admin/posts/${id}/unpublish`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    setFeatured: async (id: string, featured: boolean): Promise<BlogPost> => {
      return $fetch<BlogPost>(`${API_BASE}/blog/admin/posts/${id}/featured`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { featured },
      })
    },
  }
}
