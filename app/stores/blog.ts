import type {
  BlogPost,
  BlogPostListParams,
  BlogPostListResponse,
  PopularTag,
} from '~/types/blog'
import { useBlogService } from '~/services/blog.service'

interface BlogState {
  posts: BlogPost[]
  featuredPosts: BlogPost[]
  currentPost: BlogPost | null
  popularTags: PopularTag[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useBlogStore = defineStore('blog', {
  state: (): BlogState => ({
    posts: [],
    featuredPosts: [],
    currentPost: null,
    popularTags: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  }),

  getters: {
    getPostBySlug: (state) => (slug: string) => state.posts.find(p => p.slug === slug),
    hasPosts: (state) => state.posts.length > 0,
    hasMorePages: (state) => state.pagination.page < state.pagination.totalPages,
  },

  actions: {
    async fetchPosts(params?: BlogPostListParams) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const response: BlogPostListResponse = await blogService.getPosts({
          ...params,
          status: 'PUBLISHED',
        })

        this.posts = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch blog posts'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchFeaturedPosts(limit: number = 3) {
      try {
        const blogService = useBlogService()
        const response = await blogService.getPosts({
          status: 'PUBLISHED',
          featured: true,
          limit,
        })

        this.featuredPosts = response.data
        return { success: true, data: response.data }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        return { success: false, error: err?.data?.message || 'Failed to fetch featured posts' }
      }
    },

    async fetchPostBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const post = await blogService.getPostBySlug(slug)

        this.currentPost = post

        return { success: true, data: post }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch blog post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchPopularTags(limit?: number) {
      try {
        const blogService = useBlogService()
        const tags = await blogService.getPopularTags(limit)

        this.popularTags = tags

        return { success: true, data: tags }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        return { success: false, error: err?.data?.message || 'Failed to fetch popular tags' }
      }
    },

    clearCurrentPost() {
      this.currentPost = null
    },

    clearError() {
      this.error = null
    },
  },
})
