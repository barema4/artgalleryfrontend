import type {
  BlogPost,
  BlogPostListParams,
  BlogPostListResponse,
  CreateBlogPostData,
  UpdateBlogPostData,
  PopularTag,
} from '~/types/blog'
import { useBlogService } from '~/services/blog.service'

interface BlogState {
  posts: BlogPost[]
  featuredPosts: BlogPost[]
  currentPost: BlogPost | null
  popularTags: PopularTag[]
  adminPosts: BlogPost[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  adminPagination: {
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
    adminPosts: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    adminPagination: {
      total: 0,
      page: 1,
      limit: 12,
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

    // Admin Actions
    async adminFetchPosts(params?: BlogPostListParams) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const response = await blogService.adminGetPosts({
          page: params?.page || this.adminPagination.page,
          limit: params?.limit || this.adminPagination.limit,
          ...params,
        })

        this.adminPosts = response.data
        this.adminPagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch posts'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async adminFetchPostById(id: string) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        this.currentPost = await blogService.adminGetPostById(id)
        return { success: true, data: this.currentPost }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createPost(data: CreateBlogPostData) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const post = await blogService.createPost(data)
        this.adminPosts.unshift(post)
        return { success: true, data: post }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to create post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updatePost(id: string, data: UpdateBlogPostData) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const post = await blogService.updatePost(id, data)
        const index = this.adminPosts.findIndex(p => p.id === id)
        if (index !== -1) {
          this.adminPosts[index] = post
        }
        if (this.currentPost?.id === id) {
          this.currentPost = post
        }
        return { success: true, data: post }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deletePost(id: string) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        await blogService.deletePost(id)
        this.adminPosts = this.adminPosts.filter(p => p.id !== id)
        if (this.currentPost?.id === id) {
          this.currentPost = null
        }
        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async publishPost(id: string) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const post = await blogService.publishPost(id)
        const index = this.adminPosts.findIndex(p => p.id === id)
        if (index !== -1) {
          this.adminPosts[index] = post
        }
        if (this.currentPost?.id === id) {
          this.currentPost = post
        }
        return { success: true, data: post }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to publish post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async unpublishPost(id: string) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const post = await blogService.unpublishPost(id)
        const index = this.adminPosts.findIndex(p => p.id === id)
        if (index !== -1) {
          this.adminPosts[index] = post
        }
        if (this.currentPost?.id === id) {
          this.currentPost = post
        }
        return { success: true, data: post }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to unpublish post'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async setFeatured(id: string, featured: boolean) {
      this.loading = true
      this.error = null

      try {
        const blogService = useBlogService()
        const post = await blogService.setFeatured(id, featured)
        const index = this.adminPosts.findIndex(p => p.id === id)
        if (index !== -1) {
          this.adminPosts[index] = post
        }
        if (this.currentPost?.id === id) {
          this.currentPost = post
        }
        return { success: true, data: post }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update featured status'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
