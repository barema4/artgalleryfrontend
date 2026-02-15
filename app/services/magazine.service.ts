import type {
  MagazineEdition,
  CreateMagazineEditionData,
  UpdateMagazineEditionData,
  MagazineEditionListParams,
  MagazineEditionListResponse,
  ArticleCategory,
  CreateArticleCategoryData,
  UpdateArticleCategoryData,
  Article,
  CreateArticleData,
  UpdateArticleData,
  ArticleListParams,
  ArticleListResponse,
} from '~/types/magazine'
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

function buildEditionQueryString(params?: MagazineEditionListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.featured !== undefined) query.set('featured', String(params.featured))
  if (params.published !== undefined) query.set('published', String(params.published))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function buildArticleQueryString(params?: ArticleListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.editionId) query.set('editionId', params.editionId)
  if (params.categoryId) query.set('categoryId', params.categoryId)
  if (params.status) query.set('status', params.status)
  if (params.featured !== undefined) query.set('featured', String(params.featured))
  if (params.search) query.set('search', params.search)
  if (params.tag) query.set('tag', params.tag)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function useMagazineService() {
  return {
    // Public edition endpoints
    getEditions: async (params?: MagazineEditionListParams): Promise<MagazineEditionListResponse> => {
      return $fetch<MagazineEditionListResponse>(`${API_BASE}/magazine/editions${buildEditionQueryString(params)}`)
    },

    getEditionBySlug: async (slug: string): Promise<MagazineEdition> => {
      return $fetch<MagazineEdition>(`${API_BASE}/magazine/editions/${slug}`)
    },

    // Public article endpoints
    getArticles: async (params?: ArticleListParams): Promise<ArticleListResponse> => {
      return $fetch<ArticleListResponse>(`${API_BASE}/magazine/articles${buildArticleQueryString(params)}`)
    },

    getArticleBySlug: async (slug: string): Promise<Article> => {
      return $fetch<Article>(`${API_BASE}/magazine/articles/${slug}`)
    },

    // Public category endpoints
    getCategories: async (): Promise<ArticleCategory[]> => {
      return $fetch<ArticleCategory[]>(`${API_BASE}/magazine/categories`)
    },

    getCategoryBySlug: async (slug: string): Promise<ArticleCategory> => {
      return $fetch<ArticleCategory>(`${API_BASE}/magazine/categories/${slug}`)
    },

    // Admin edition endpoints
    adminGetEditions: async (params?: MagazineEditionListParams): Promise<MagazineEditionListResponse> => {
      return $fetch<MagazineEditionListResponse>(`${API_BASE}/magazine/admin/editions${buildEditionQueryString(params)}`, {
        headers: getHeaders(),
      })
    },

    adminGetEditionById: async (id: string): Promise<MagazineEdition> => {
      return $fetch<MagazineEdition>(`${API_BASE}/magazine/admin/editions/${id}`, {
        headers: getHeaders(),
      })
    },

    createEdition: async (data: CreateMagazineEditionData): Promise<MagazineEdition> => {
      return $fetch<MagazineEdition>(`${API_BASE}/magazine/admin/editions`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateEdition: async (id: string, data: UpdateMagazineEditionData): Promise<MagazineEdition> => {
      return $fetch<MagazineEdition>(`${API_BASE}/magazine/admin/editions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteEdition: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/magazine/admin/editions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    publishEdition: async (id: string): Promise<MagazineEdition> => {
      return $fetch<MagazineEdition>(`${API_BASE}/magazine/admin/editions/${id}/publish`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    // Admin category endpoints
    createCategory: async (data: CreateArticleCategoryData): Promise<ArticleCategory> => {
      return $fetch<ArticleCategory>(`${API_BASE}/magazine/admin/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateCategory: async (id: string, data: UpdateArticleCategoryData): Promise<ArticleCategory> => {
      return $fetch<ArticleCategory>(`${API_BASE}/magazine/admin/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteCategory: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/magazine/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    // Admin article endpoints
    adminGetArticles: async (params?: ArticleListParams): Promise<ArticleListResponse> => {
      return $fetch<ArticleListResponse>(`${API_BASE}/magazine/admin/articles${buildArticleQueryString(params)}`, {
        headers: getHeaders(),
      })
    },

    adminGetArticleById: async (id: string): Promise<Article> => {
      return $fetch<Article>(`${API_BASE}/magazine/admin/articles/${id}`, {
        headers: getHeaders(),
      })
    },

    createArticle: async (data: CreateArticleData): Promise<Article> => {
      return $fetch<Article>(`${API_BASE}/magazine/admin/articles`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateArticle: async (id: string, data: UpdateArticleData): Promise<Article> => {
      return $fetch<Article>(`${API_BASE}/magazine/admin/articles/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteArticle: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/magazine/admin/articles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    publishArticle: async (id: string): Promise<Article> => {
      return $fetch<Article>(`${API_BASE}/magazine/admin/articles/${id}/publish`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    setArticleFeatured: async (id: string, featured: boolean): Promise<Article> => {
      return $fetch<Article>(`${API_BASE}/magazine/admin/articles/${id}/featured`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { featured },
      })
    },
  }
}
