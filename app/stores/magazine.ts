import { defineStore } from 'pinia'
import type {
  MagazineEdition,
  MagazineEditionListParams,
  Article,
  ArticleListParams,
  ArticleCategory,
} from '~/types/magazine'
import { useMagazineService } from '~/services/magazine.service'

interface MagazineState {
  editions: MagazineEdition[]
  currentEdition: MagazineEdition | null
  articles: Article[]
  currentArticle: Article | null
  categories: ArticleCategory[]
  featuredEdition: MagazineEdition | null
  featuredArticles: Article[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  articlePagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useMagazineStore = defineStore('magazine', {
  state: (): MagazineState => ({
    editions: [],
    currentEdition: null,
    articles: [],
    currentArticle: null,
    categories: [],
    featuredEdition: null,
    featuredArticles: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
    articlePagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  }),

  actions: {
    async fetchEditions(params?: MagazineEditionListParams) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const response = await magazineService.getEditions({
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          published: true,
          ...params,
        })

        this.editions = response.data
        this.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }

        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch editions'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchFeaturedEdition() {
      try {
        const magazineService = useMagazineService()
        const response = await magazineService.getEditions({
          featured: true,
          published: true,
          limit: 1,
        })

        if (response.data.length > 0) {
          this.featuredEdition = response.data[0]
        }

        return { success: true }
      } catch (e: any) {
        return { success: false, error: e?.data?.message || 'Failed to fetch featured edition' }
      }
    },

    async fetchEditionBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        this.currentEdition = await magazineService.getEditionBySlug(slug)
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch edition'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchArticles(params?: ArticleListParams) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const response = await magazineService.getArticles({
          page: params?.page || this.articlePagination.page,
          limit: params?.limit || this.articlePagination.limit,
          status: 'PUBLISHED',
          ...params,
        })

        this.articles = response.data
        this.articlePagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }

        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch articles'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchFeaturedArticles(limit = 6) {
      try {
        const magazineService = useMagazineService()
        const response = await magazineService.getArticles({
          featured: true,
          status: 'PUBLISHED',
          limit,
        })

        this.featuredArticles = response.data
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e?.data?.message || 'Failed to fetch featured articles' }
      }
    },

    async fetchArticleBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        this.currentArticle = await magazineService.getArticleBySlug(slug)
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch article'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const magazineService = useMagazineService()
        this.categories = await magazineService.getCategories()
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e?.data?.message || 'Failed to fetch categories' }
      }
    },

    clearCurrentEdition() {
      this.currentEdition = null
    },

    clearCurrentArticle() {
      this.currentArticle = null
    },
  },
})
