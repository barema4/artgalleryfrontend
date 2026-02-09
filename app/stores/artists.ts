import { defineStore } from 'pinia'
import type {
  Artist,
  ArtistStats,
  ArtistListParams,
  ArtistListResponse,
  CreateArtistData,
  UpdateArtistData,
  FollowArtistGuestData,
} from '~/types/artist'
import { useArtistService } from '~/services/artist.service'

export const useArtistsStore = defineStore('artists', {
  state: () => ({
    artists: [] as Artist[],
    currentArtist: null as Artist | null,
    currentArtistStats: null as ArtistStats | null,
    myArtistProfile: null as Artist | null,
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
    verifiedArtists: (state) => state.artists.filter((a) => a.verified),
    featuredArtists: (state) => state.artists.filter((a) => a.featured),
    getById: (state) => (id: string) => state.artists.find((a) => a.id === id),
    getBySlug: (state) => (slug: string) => state.artists.find((a) => a.slug === slug),
    isArtist: (state) => !!state.myArtistProfile,
  },

  actions: {
    // Public endpoints
    async fetchArtists(params?: ArtistListParams) {
      this.loading = true
      this.error = null
      try {
        const artistService = useArtistService()
        const response: ArtistListResponse = await artistService.getArtists(params)
        this.artists = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to fetch artists'
        console.error('Failed to fetch artists:', e)
      } finally {
        this.loading = false
      }
    },

    async fetchArtistBySlug(slug: string) {
      this.loading = true
      this.error = null
      try {
        const artistService = useArtistService()
        this.currentArtist = await artistService.getArtistBySlug(slug)
        return this.currentArtist
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to fetch artist'
        console.error('Failed to fetch artist:', e)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchArtistStats(id: string) {
      try {
        const artistService = useArtistService()
        this.currentArtistStats = await artistService.getArtistStats(id)
        return this.currentArtistStats
      } catch (e: any) {
        console.error('Failed to fetch artist stats:', e)
        return null
      }
    },

    // Current user's artist profile
    async fetchMyArtistProfile() {
      this.loading = true
      this.error = null
      try {
        const artistService = useArtistService()
        this.myArtistProfile = await artistService.getMyArtistProfile()
        return this.myArtistProfile
      } catch (e: any) {
        // 404 means user is not an artist yet, not an error
        if (e?.response?.status !== 404) {
          this.error = e?.data?.message || e?.message || 'Failed to fetch artist profile'
          console.error('Failed to fetch artist profile:', e)
        }
        this.myArtistProfile = null
        return null
      } finally {
        this.loading = false
      }
    },

    async createMyArtistProfile(data: CreateArtistData) {
      this.loading = true
      this.error = null
      try {
        const artistService = useArtistService()
        this.myArtistProfile = await artistService.createMyArtistProfile(data)
        return { success: true, artist: this.myArtistProfile }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to create artist profile'
        console.error('Failed to create artist profile:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateMyArtistProfile(data: UpdateArtistData) {
      this.loading = true
      this.error = null
      try {
        const artistService = useArtistService()
        this.myArtistProfile = await artistService.updateMyArtistProfile(data)
        return { success: true, artist: this.myArtistProfile }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to update artist profile'
        console.error('Failed to update artist profile:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteMyArtistProfile() {
      this.loading = true
      this.error = null
      try {
        const artistService = useArtistService()
        await artistService.deleteMyArtistProfile()
        this.myArtistProfile = null
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || e?.message || 'Failed to delete artist profile'
        console.error('Failed to delete artist profile:', e)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Follow/Unfollow
    async followArtist(id: string) {
      try {
        const artistService = useArtistService()
        await artistService.followArtist(id)
        // Update follower count in state
        const artist = this.artists.find((a) => a.id === id)
        if (artist) {
          artist.followerCount++
        }
        if (this.currentArtist?.id === id) {
          this.currentArtist.followerCount++
        }
        return { success: true }
      } catch (e: any) {
        console.error('Failed to follow artist:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to follow artist' }
      }
    },

    async unfollowArtist(id: string) {
      try {
        const artistService = useArtistService()
        await artistService.unfollowArtist(id)
        // Update follower count in state
        const artist = this.artists.find((a) => a.id === id)
        if (artist && artist.followerCount > 0) {
          artist.followerCount--
        }
        if (this.currentArtist?.id === id && this.currentArtist.followerCount > 0) {
          this.currentArtist.followerCount--
        }
        return { success: true }
      } catch (e: any) {
        console.error('Failed to unfollow artist:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to unfollow artist' }
      }
    },

    async isFollowingArtist(id: string) {
      try {
        const artistService = useArtistService()
        const result = await artistService.isFollowingArtist(id)
        return result.isFollowing
      } catch (e: any) {
        console.error('Failed to check following status:', e)
        return false
      }
    },

    async followArtistAsGuest(id: string, data: FollowArtistGuestData) {
      try {
        const artistService = useArtistService()
        await artistService.followArtistAsGuest(id, data)
        return { success: true }
      } catch (e: any) {
        console.error('Failed to follow artist as guest:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to follow artist' }
      }
    },

    // Admin actions
    async verifyArtist(id: string) {
      try {
        const artistService = useArtistService()
        const artist = await artistService.verifyArtist(id)
        const index = this.artists.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artists[index] = artist
        }
        if (this.currentArtist?.id === id) {
          this.currentArtist = artist
        }
        return { success: true, artist }
      } catch (e: any) {
        console.error('Failed to verify artist:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to verify artist' }
      }
    },

    async unverifyArtist(id: string) {
      try {
        const artistService = useArtistService()
        const artist = await artistService.unverifyArtist(id)
        const index = this.artists.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artists[index] = artist
        }
        if (this.currentArtist?.id === id) {
          this.currentArtist = artist
        }
        return { success: true, artist }
      } catch (e: any) {
        console.error('Failed to unverify artist:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to remove verification' }
      }
    },

    async setArtistFeatured(id: string, featured: boolean) {
      try {
        const artistService = useArtistService()
        const artist = await artistService.setArtistFeatured(id, featured)
        const index = this.artists.findIndex((a) => a.id === id)
        if (index > -1) {
          this.artists[index] = artist
        }
        if (this.currentArtist?.id === id) {
          this.currentArtist = artist
        }
        return { success: true, artist }
      } catch (e: any) {
        console.error('Failed to set featured status:', e)
        return { success: false, error: e?.data?.message || e?.message || 'Failed to set featured status' }
      }
    },

    async getArtistFollowers(id: string, page = 1, limit = 20) {
      try {
        const artistService = useArtistService()
        return await artistService.getArtistFollowers(id, page, limit)
      } catch (e: any) {
        console.error('Failed to get followers:', e)
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }
      }
    },

    // Utility actions
    clearCurrentArtist() {
      this.currentArtist = null
      this.currentArtistStats = null
    },

    clearError() {
      this.error = null
    },
  },
})