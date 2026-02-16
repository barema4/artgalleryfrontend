import { defineStore } from 'pinia'
import type {
  Artwork,
  ArtworkListParams,
  ArtworkListResponse,
  ArtworkStatus,
  CreateArtworkData,
  UpdateArtworkData,
  CreateArtworkImageData,
  ArtworkImage,
  ArtworkStats,
} from '~/types/artwork'
import { useArtworkService } from '~/services/artwork.service'

export const useArtworksStore = defineStore('artworks', {
  state: () => ({
    artworks: [] as Artwork[],
    currentArtwork: null as Artwork | null,
    currentArtworkStats: null as ArtworkStats | null,
    loading: false,
    error: null as string | null,
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    },
  }),

  getters: {
    availableArtworks: (state) => state.artworks.filter((a) => a.status === 'AVAILABLE'),
    soldArtworks: (state) => state.artworks.filter((a) => a.status === 'SOLD'),
    draftArtworks: (state) => state.artworks.filter((a) => a.status === 'DRAFT'),
    featuredArtworks: (state) => state.artworks.filter((a) => a.featured),
    getById: (state) => (id: string) => state.artworks.find((a) => a.id === id),
    byCategory: (state) => (categoryId: string) =>
      state.artworks.filter((a) => a.categoryId === categoryId),
    byArtist: (state) => (artistId: string) =>
      state.artworks.filter((a) => a.artistId === artistId),
  },

  actions: {
    async fetchArtworks(params?: ArtworkListParams) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        const response: ArtworkListResponse = await artworkService.getArtworks(params)
        this.artworks = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to fetch artworks'
        console.error('Failed to fetch artworks:', e)
      } finally {
        this.loading = false
      }
    },

    async fetchArtworkBySlug(slug: string) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        this.currentArtwork = await artworkService.getArtworkBySlug(slug)
        return this.currentArtwork
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to fetch artwork'
        console.error('Failed to fetch artwork:', e)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchArtworkStats(id: string) {
      try {
        const artworkService = useArtworkService()
        this.currentArtworkStats = await artworkService.getArtworkStats(id)
        return this.currentArtworkStats
      } catch (e: any) {
        console.error('Failed to fetch artwork stats:', e)
        return null
      }
    },

    async createArtwork(data: CreateArtworkData) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        const artwork = await artworkService.createArtwork(data)
        this.artworks.unshift(artwork)
        return { success: true, artwork }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to create artwork'
        console.error('Failed to create artwork:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateArtwork(id: string, data: UpdateArtworkData) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        const artwork = await artworkService.updateArtwork(id, data)
        const index = this.artworks.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artworks[index] = artwork
        }
        if (this.currentArtwork?.id === id) {
          this.currentArtwork = artwork
        }
        return { success: true, artwork }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to update artwork'
        console.error('Failed to update artwork:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteArtwork(id: string) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        await artworkService.deleteArtwork(id)
        const index = this.artworks.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artworks.splice(index, 1)
        }
        if (this.currentArtwork?.id === id) {
          this.currentArtwork = null
        }
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to delete artwork'
        console.error('Failed to delete artwork:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async publishArtwork(id: string) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        const artwork = await artworkService.publishArtwork(id)
        const index = this.artworks.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artworks[index] = artwork
        }
        if (this.currentArtwork?.id === id) {
          this.currentArtwork = artwork
        }
        return { success: true, artwork }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to publish artwork'
        console.error('Failed to publish artwork:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateArtworkStatus(id: string, status: ArtworkStatus) {
      this.loading = true
      this.error = null
      try {
        const artworkService = useArtworkService()
        const artwork = await artworkService.updateArtworkStatus(id, status)
        const index = this.artworks.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artworks[index] = artwork
        }
        if (this.currentArtwork?.id === id) {
          this.currentArtwork = artwork
        }
        return { success: true, artwork }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to update artwork status'
        console.error('Failed to update artwork status:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async addArtworkImage(artworkId: string, data: CreateArtworkImageData) {
      try {
        const artworkService = useArtworkService()
        const image = await artworkService.addArtworkImage(artworkId, data)
        if (this.currentArtwork?.id === artworkId) {
          this.currentArtwork.images.push(image)
        }
        return { success: true, image }
      } catch (e: any) {
        console.error('Failed to add artwork image:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to add image' }
      }
    },

    async removeArtworkImage(artworkId: string, imageId: string) {
      try {
        const artworkService = useArtworkService()
        await artworkService.removeArtworkImage(artworkId, imageId)
        if (this.currentArtwork?.id === artworkId) {
          this.currentArtwork.images = this.currentArtwork.images.filter((img) => img.id !== imageId)
        }
        return { success: true }
      } catch (e: any) {
        console.error('Failed to remove artwork image:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to remove image' }
      }
    },

    async setPrimaryImage(artworkId: string, imageId: string) {
      try {
        const artworkService = useArtworkService()
        await artworkService.setPrimaryImage(artworkId, imageId)
        if (this.currentArtwork?.id === artworkId) {
          this.currentArtwork.images = this.currentArtwork.images.map((img) => ({
            ...img,
            isPrimary: img.id === imageId,
          }))
        }
        return { success: true }
      } catch (e: any) {
        console.error('Failed to set primary image:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to set primary image' }
      }
    },

    async setArtworkFeatured(id: string, featured: boolean) {
      try {
        const artworkService = useArtworkService()
        const artwork = await artworkService.setArtworkFeatured(id, featured)
        const index = this.artworks.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artworks[index] = artwork
        }
        if (this.currentArtwork?.id === id) {
          this.currentArtwork = artwork
        }
        return { success: true, artwork }
      } catch (e: any) {
        console.error('Failed to set featured status:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to set featured status' }
      }
    },

    async adminUpdateStatus(id: string, status: ArtworkStatus) {
      try {
        const artworkService = useArtworkService()
        const artwork = await artworkService.adminUpdateStatus(id, status)
        const index = this.artworks.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artworks[index] = artwork
        }
        if (this.currentArtwork?.id === id) {
          this.currentArtwork = artwork
        }
        return { success: true, artwork }
      } catch (e: any) {
        console.error('Failed to update status:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to update status' }
      }
    },

    clearCurrentArtwork() {
      this.currentArtwork = null
      this.currentArtworkStats = null
    },

    clearError() {
      this.error = null
    },
  },
})