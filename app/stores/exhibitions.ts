import { defineStore } from 'pinia'
import type {
  Exhibition,
  ExhibitionListParams,
  ExhibitionListResponse,
  ExhibitionStats,
} from '~/types/exhibition'
import { useExhibitionService } from '~/services/exhibition.service'

interface ExhibitionsState {
  exhibitions: Exhibition[]
  currentExhibition: Exhibition | null
  currentStats: ExhibitionStats | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useExhibitionsStore = defineStore('exhibitions', {
  state: (): ExhibitionsState => ({
    exhibitions: [],
    currentExhibition: null,
    currentStats: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    liveExhibitions: (state) => state.exhibitions.filter(e => e.status === 'LIVE'),
    upcomingExhibitions: (state) => state.exhibitions.filter(e => e.status === 'SCHEDULED'),
    featuredExhibitions: (state) => state.exhibitions.filter(e => e.featured),
  },

  actions: {
    async fetchExhibitions(params?: ExhibitionListParams) {
      const exhibitionService = useExhibitionService()
      this.loading = true
      this.error = null

      try {
        const response: ExhibitionListResponse = await exhibitionService.getExhibitions({
          ...params,
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
        })

        this.exhibitions = response.data
        this.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to load exhibitions'
        console.error('Failed to fetch exhibitions:', e)
      } finally {
        this.loading = false
      }
    },

    async fetchExhibitionBySlug(slug: string) {
      const exhibitionService = useExhibitionService()
      this.loading = true
      this.error = null

      try {
        this.currentExhibition = await exhibitionService.getExhibitionBySlug(slug)
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to load exhibition'
        this.currentExhibition = null
        console.error('Failed to fetch exhibition:', e)
      } finally {
        this.loading = false
      }
    },

    async fetchExhibitionStats(id: string) {
      const exhibitionService = useExhibitionService()

      try {
        this.currentStats = await exhibitionService.getExhibitionStats(id)
      } catch (e: any) {
        console.error('Failed to fetch exhibition stats:', e)
      }
    },

    clearCurrentExhibition() {
      this.currentExhibition = null
      this.currentStats = null
    },

    clearError() {
      this.error = null
    },
  },
})
