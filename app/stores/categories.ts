import type {
  Category,
  Tag,
  CategoryListParams,
  CategoryListResponse,
  CategoryTreeResponse,
  TagListResponse,
} from '~/types/category'
import { useCategoryService } from '~/services/category.service'
import { useTagService } from '~/services/tag.service'

interface CategoriesState {
  categories: Category[]
  categoryTree: Category[]
  tags: Tag[]
  popularTags: Tag[]
  currentCategory: Category | null
  currentTag: Tag | null
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    categoryTree: [],
    tags: [],
    popularTags: [],
    currentCategory: null,
    currentTag: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  }),

  getters: {
    rootCategories: (state) => state.categoryTree.filter(c => !c.parentId),
    getCategoryById: (state) => (id: string) => state.categories.find(c => c.id === id),
    getCategoryBySlug: (state) => (slug: string) => state.categories.find(c => c.slug === slug),
    getTagBySlug: (state) => (slug: string) => state.tags.find(t => t.slug === slug),
  },

  actions: {
    async fetchCategories(params?: CategoryListParams) {
      this.loading = true
      this.error = null

      try {
        const categoryService = useCategoryService()
        const response: CategoryListResponse = await categoryService.getCategories(params)

        this.categories = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch categories'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCategoryTree() {
      this.loading = true
      this.error = null

      try {
        const categoryService = useCategoryService()
        const response: CategoryTreeResponse = await categoryService.getCategoryTree()

        this.categoryTree = response.data

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch category tree'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCategoryBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const categoryService = useCategoryService()
        const category = await categoryService.getCategoryBySlug(slug)

        this.currentCategory = category

        return { success: true, data: category }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchTags(params?: CategoryListParams) {
      this.loading = true
      this.error = null

      try {
        const tagService = useTagService()
        const response: TagListResponse = await tagService.getTags(params)

        this.tags = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch tags'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchPopularTags(limit?: number) {
      this.loading = true
      this.error = null

      try {
        const tagService = useTagService()
        const tags = await tagService.getPopularTags(limit)

        this.popularTags = tags

        return { success: true, data: tags }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch popular tags'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchTagBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const tagService = useTagService()
        const tag = await tagService.getTagBySlug(slug)

        this.currentTag = tag

        return { success: true, data: tag }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch tag'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    clearCurrent() {
      this.currentCategory = null
      this.currentTag = null
    },

    clearError() {
      this.error = null
    },
  },
})
