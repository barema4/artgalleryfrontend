import { defineStore } from 'pinia'
import type {
  Review,
  ReviewStats,
  ReviewListParams,
  CreateReviewData,
  UpdateReviewData,
} from '~/types/review'
import { useReviewService } from '~/services/review.service'

interface ReviewsState {
  reviews: Review[]
  myReviews: Review[]
  currentArtworkStats: ReviewStats | null
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useReviewsStore = defineStore('reviews', {
  state: (): ReviewsState => ({
    reviews: [],
    myReviews: [],
    currentArtworkStats: null,
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
    averageRating: (state): number => {
      return state.currentArtworkStats?.averageRating || 0
    },

    totalReviews: (state): number => {
      return state.currentArtworkStats?.totalReviews || 0
    },

    ratingDistribution: (state) => {
      return state.currentArtworkStats?.ratingDistribution || {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }
    },

    hasReviews: (state): boolean => {
      return state.reviews.length > 0
    },

    sortedByNewest: (state): Review[] => {
      return [...state.reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },

    sortedByRating: (state): Review[] => {
      return [...state.reviews].sort((a, b) => b.rating - a.rating)
    },

    sortedByHelpful: (state): Review[] => {
      return [...state.reviews].sort((a, b) => b.helpful - a.helpful)
    },
  },

  actions: {
    async fetchArtworkReviews(artworkId: string, params?: ReviewListParams) {
      this.loading = true
      this.error = null

      try {
        const reviewService = useReviewService()
        const response = await reviewService.getArtworkReviews(artworkId, params)

        this.reviews = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to fetch reviews'
        console.error('Failed to fetch reviews:', e)
      } finally {
        this.loading = false
      }
    },

    async fetchArtworkStats(artworkId: string) {
      try {
        const reviewService = useReviewService()
        this.currentArtworkStats = await reviewService.getArtworkReviewStats(artworkId)
        return this.currentArtworkStats
      } catch (e: unknown) {
        console.error('Failed to fetch review stats:', e)
        return null
      }
    },

    async fetchMyReviews(params?: ReviewListParams) {
      this.loading = true
      this.error = null

      try {
        const reviewService = useReviewService()
        const response = await reviewService.getMyReviews(params)

        this.myReviews = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to fetch your reviews'
        console.error('Failed to fetch my reviews:', e)
      } finally {
        this.loading = false
      }
    },

    async createReview(artworkId: string, data: CreateReviewData) {
      this.loading = true
      this.error = null

      try {
        const reviewService = useReviewService()
        const review = await reviewService.createReview(artworkId, data)

        this.reviews.unshift(review)

        await this.fetchArtworkStats(artworkId)

        return { success: true, review }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to create review'
        console.error('Failed to create review:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateReview(id: string, data: UpdateReviewData, artworkId?: string) {
      this.loading = true
      this.error = null

      try {
        const reviewService = useReviewService()
        const review = await reviewService.updateReview(id, data)

        const index = this.reviews.findIndex((r) => r.id === id)
        if (index > -1) {
          this.reviews[index] = review
        }

        const myIndex = this.myReviews.findIndex((r) => r.id === id)
        if (myIndex > -1) {
          this.myReviews[myIndex] = review
        }

        if (artworkId) {
          await this.fetchArtworkStats(artworkId)
        }

        return { success: true, review }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to update review'
        console.error('Failed to update review:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteReview(id: string, artworkId?: string) {
      this.loading = true
      this.error = null

      try {
        const reviewService = useReviewService()
        await reviewService.deleteReview(id)

        this.reviews = this.reviews.filter((r) => r.id !== id)

        this.myReviews = this.myReviews.filter((r) => r.id !== id)

        if (artworkId) {
          await this.fetchArtworkStats(artworkId)
        }

        return { success: true }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to delete review'
        console.error('Failed to delete review:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async markHelpful(id: string) {
      try {
        const reviewService = useReviewService()
        const review = await reviewService.markHelpful(id)

        const index = this.reviews.findIndex((r) => r.id === id)
        if (index > -1) {
          this.reviews[index] = review
        }

        return { success: true, review }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        console.error('Failed to mark review as helpful:', e)
        return { success: false, error: err?.data?.message || err?.message || 'Failed to mark as helpful' }
      }
    },

    async adminDeleteReview(id: string) {
      this.loading = true
      this.error = null

      try {
        const reviewService = useReviewService()
        await reviewService.adminDeleteReview(id)

        this.reviews = this.reviews.filter((r) => r.id !== id)

        return { success: true }
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to delete review'
        console.error('Failed to delete review:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    clearReviews() {
      this.reviews = []
      this.currentArtworkStats = null
      this.pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    },

    clearError() {
      this.error = null
    },
  },
})
