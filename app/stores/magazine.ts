import { defineStore } from 'pinia'
import type {
  MagazineEdition,
  MagazineEditionListParams,
  CreateMagazineEditionData,
  UpdateMagazineEditionData,
  Article,
  ArticleListParams,
  CreateArticleData,
  UpdateArticleData,
  ArticleCategory,
  CreateArticleCategoryData,
  UpdateArticleCategoryData,
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
  adminEditions: MagazineEdition[]
  adminArticles: Article[]
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
  adminEditionPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  adminArticlePagination: {
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
    adminEditions: [],
    adminArticles: [],
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
    adminEditionPagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
    adminArticlePagination: {
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

    // Admin Edition Actions
    async adminFetchEditions(params?: MagazineEditionListParams) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const response = await magazineService.adminGetEditions({
          page: params?.page || this.adminEditionPagination.page,
          limit: params?.limit || this.adminEditionPagination.limit,
          ...params,
        })

        this.adminEditions = response.data
        this.adminEditionPagination = {
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

    async adminFetchEditionById(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        this.currentEdition = await magazineService.adminGetEditionById(id)
        return { success: true, data: this.currentEdition }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch edition'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createEdition(data: CreateMagazineEditionData) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const edition = await magazineService.createEdition(data)
        this.adminEditions.unshift(edition)
        return { success: true, data: edition }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to create edition'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateEdition(id: string, data: UpdateMagazineEditionData) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const edition = await magazineService.updateEdition(id, data)
        const index = this.adminEditions.findIndex(e => e.id === id)
        if (index !== -1) {
          this.adminEditions[index] = edition
        }
        if (this.currentEdition?.id === id) {
          this.currentEdition = edition
        }
        return { success: true, data: edition }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to update edition'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteEdition(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        await magazineService.deleteEdition(id)
        this.adminEditions = this.adminEditions.filter(e => e.id !== id)
        if (this.currentEdition?.id === id) {
          this.currentEdition = null
        }
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to delete edition'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async publishEdition(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const edition = await magazineService.publishEdition(id)
        const index = this.adminEditions.findIndex(e => e.id === id)
        if (index !== -1) {
          this.adminEditions[index] = edition
        }
        if (this.currentEdition?.id === id) {
          this.currentEdition = edition
        }
        return { success: true, data: edition }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to publish edition'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Article Actions
    async adminFetchArticles(params?: ArticleListParams) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const response = await magazineService.adminGetArticles({
          page: params?.page || this.adminArticlePagination.page,
          limit: params?.limit || this.adminArticlePagination.limit,
          ...params,
        })

        this.adminArticles = response.data
        this.adminArticlePagination = {
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

    async adminFetchArticleById(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        this.currentArticle = await magazineService.adminGetArticleById(id)
        return { success: true, data: this.currentArticle }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch article'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createArticle(data: CreateArticleData) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const article = await magazineService.createArticle(data)
        this.adminArticles.unshift(article)
        return { success: true, data: article }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to create article'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateArticle(id: string, data: UpdateArticleData) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const article = await magazineService.updateArticle(id, data)
        const index = this.adminArticles.findIndex(a => a.id === id)
        if (index !== -1) {
          this.adminArticles[index] = article
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = article
        }
        return { success: true, data: article }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to update article'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteArticle(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        await magazineService.deleteArticle(id)
        this.adminArticles = this.adminArticles.filter(a => a.id !== id)
        if (this.currentArticle?.id === id) {
          this.currentArticle = null
        }
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to delete article'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async publishArticle(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const article = await magazineService.publishArticle(id)
        const index = this.adminArticles.findIndex(a => a.id === id)
        if (index !== -1) {
          this.adminArticles[index] = article
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = article
        }
        return { success: true, data: article }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to publish article'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async setArticleFeatured(id: string, featured: boolean) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const article = await magazineService.setArticleFeatured(id, featured)
        const index = this.adminArticles.findIndex(a => a.id === id)
        if (index !== -1) {
          this.adminArticles[index] = article
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = article
        }
        return { success: true, data: article }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to update article featured status'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Category Actions
    async createCategory(data: CreateArticleCategoryData) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const category = await magazineService.createCategory(data)
        this.categories.push(category)
        return { success: true, data: category }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to create category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateCategory(id: string, data: UpdateArticleCategoryData) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const category = await magazineService.updateCategory(id, data)
        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = category
        }
        return { success: true, data: category }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to update category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        await magazineService.deleteCategory(id)
        this.categories = this.categories.filter(c => c.id !== id)
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to delete category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCategoryBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const magazineService = useMagazineService()
        const category = await magazineService.getCategoryBySlug(slug)
        return { success: true, data: category }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
