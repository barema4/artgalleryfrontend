import type {
  Category,
  Tag,
  CategoryListParams,
  CategoryListResponse,
  CategoryTreeResponse,
  TagListResponse,
  CreateCategoryData,
  UpdateCategoryData,
  CreateTagData,
  UpdateTagData,
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

    // Admin Category Actions
    async createCategory(data: CreateCategoryData) {
      this.loading = true
      this.error = null

      try {
        const categoryService = useCategoryService()
        const category = await categoryService.createCategory(data)
        this.categories.unshift(category)
        return { success: true, data: category }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to create category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateCategory(id: string, data: UpdateCategoryData) {
      this.loading = true
      this.error = null

      try {
        const categoryService = useCategoryService()
        const category = await categoryService.updateCategory(id, data)

        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = category
        }

        if (this.currentCategory?.id === id) {
          this.currentCategory = category
        }

        // Refresh tree if categories have hierarchy
        await this.fetchCategoryTree()

        return { success: true, data: category }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: string) {
      this.loading = true
      this.error = null

      try {
        const categoryService = useCategoryService()
        await categoryService.deleteCategory(id)

        this.categories = this.categories.filter(c => c.id !== id)

        if (this.currentCategory?.id === id) {
          this.currentCategory = null
        }

        // Refresh tree after deletion
        await this.fetchCategoryTree()

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete category'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Tag Actions
    async createTag(data: CreateTagData) {
      this.loading = true
      this.error = null

      try {
        const tagService = useTagService()
        const tag = await tagService.createTag(data)
        this.tags.unshift(tag)
        return { success: true, data: tag }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to create tag'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateTag(id: string, data: UpdateTagData) {
      this.loading = true
      this.error = null

      try {
        const tagService = useTagService()
        const tag = await tagService.updateTag(id, data)

        const index = this.tags.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tags[index] = tag
        }

        const popularIndex = this.popularTags.findIndex(t => t.id === id)
        if (popularIndex !== -1) {
          this.popularTags[popularIndex] = tag
        }

        if (this.currentTag?.id === id) {
          this.currentTag = tag
        }

        return { success: true, data: tag }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update tag'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteTag(id: string) {
      this.loading = true
      this.error = null

      try {
        const tagService = useTagService()
        await tagService.deleteTag(id)

        this.tags = this.tags.filter(t => t.id !== id)
        this.popularTags = this.popularTags.filter(t => t.id !== id)

        if (this.currentTag?.id === id) {
          this.currentTag = null
        }

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete tag'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
