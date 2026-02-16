import { defineStore } from 'pinia'
import type {
  Newsletter,
  NewsletterListParams,
  CreateNewsletterData,
  UpdateNewsletterData,
  NewsletterStats,
  Subscriber,
  SubscribeData,
  UpdateSubscriberData,
  SubscriberListParams,
  SubscriberStats,
  SubscriberStatus,
} from '~/types/newsletter'
import { useNewsletterService } from '~/services/newsletter.service'

interface NewsletterState {
  newsletters: Newsletter[]
  currentNewsletter: Newsletter | null
  newsletterStats: NewsletterStats | null
  subscribers: Subscriber[]
  currentSubscriber: Subscriber | null
  subscriberStats: SubscriberStats | null
  loading: boolean
  error: string | null
  newsletterPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  subscriberPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useNewsletterStore = defineStore('newsletter', {
  state: (): NewsletterState => ({
    newsletters: [],
    currentNewsletter: null,
    newsletterStats: null,
    subscribers: [],
    currentSubscriber: null,
    subscriberStats: null,
    loading: false,
    error: null,
    newsletterPagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
    subscriberPagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  }),

  actions: {
    // Public Actions
    async subscribe(data: SubscribeData) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const subscriber = await newsletterService.subscribe(data)
        return { success: true, data: subscriber }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to subscribe'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async confirmSubscription(token: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const subscriber = await newsletterService.confirmSubscription(token)
        return { success: true, data: subscriber }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to confirm subscription'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async unsubscribe(email: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        await newsletterService.unsubscribe(email)
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to unsubscribe'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async trackOpen(id: string) {
      try {
        const newsletterService = useNewsletterService()
        await newsletterService.trackOpen(id)
        return { success: true }
      } catch {
        return { success: false }
      }
    },

    async trackClick(id: string) {
      try {
        const newsletterService = useNewsletterService()
        await newsletterService.trackClick(id)
        return { success: true }
      } catch {
        return { success: false }
      }
    },

    // Admin Campaign Actions
    async fetchNewsletters(params?: NewsletterListParams) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const response = await newsletterService.getNewsletters({
          page: params?.page || this.newsletterPagination.page,
          limit: params?.limit || this.newsletterPagination.limit,
          ...params,
        })

        this.newsletters = response.data
        this.newsletterPagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }

        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch newsletters'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchNewsletterStats() {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        this.newsletterStats = await newsletterService.getNewsletterStats()
        return { success: true, data: this.newsletterStats }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch newsletter stats'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchNewsletterById(id: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        this.currentNewsletter = await newsletterService.getNewsletterById(id)
        return { success: true, data: this.currentNewsletter }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createNewsletter(data: CreateNewsletterData) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const newsletter = await newsletterService.createNewsletter(data)
        this.newsletters.unshift(newsletter)
        return { success: true, data: newsletter }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to create newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateNewsletter(id: string, data: UpdateNewsletterData) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const newsletter = await newsletterService.updateNewsletter(id, data)
        const index = this.newsletters.findIndex(n => n.id === id)
        if (index !== -1) {
          this.newsletters[index] = newsletter
        }
        if (this.currentNewsletter?.id === id) {
          this.currentNewsletter = newsletter
        }
        return { success: true, data: newsletter }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to update newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteNewsletter(id: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        await newsletterService.deleteNewsletter(id)
        this.newsletters = this.newsletters.filter(n => n.id !== id)
        if (this.currentNewsletter?.id === id) {
          this.currentNewsletter = null
        }
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to delete newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async scheduleNewsletter(id: string, scheduledAt: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const newsletter = await newsletterService.scheduleNewsletter(id, scheduledAt)
        const index = this.newsletters.findIndex(n => n.id === id)
        if (index !== -1) {
          this.newsletters[index] = newsletter
        }
        if (this.currentNewsletter?.id === id) {
          this.currentNewsletter = newsletter
        }
        return { success: true, data: newsletter }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to schedule newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async sendNewsletter(id: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const newsletter = await newsletterService.sendNewsletter(id)
        const index = this.newsletters.findIndex(n => n.id === id)
        if (index !== -1) {
          this.newsletters[index] = newsletter
        }
        if (this.currentNewsletter?.id === id) {
          this.currentNewsletter = newsletter
        }
        return { success: true, data: newsletter }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to send newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async duplicateNewsletter(id: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const newsletter = await newsletterService.duplicateNewsletter(id)
        this.newsletters.unshift(newsletter)
        return { success: true, data: newsletter }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to duplicate newsletter'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Subscriber Actions
    async fetchSubscribers(params?: SubscriberListParams) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const response = await newsletterService.getSubscribers({
          page: params?.page || this.subscriberPagination.page,
          limit: params?.limit || this.subscriberPagination.limit,
          ...params,
        })

        this.subscribers = response.data
        this.subscriberPagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }

        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch subscribers'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchSubscriberStats() {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        this.subscriberStats = await newsletterService.getSubscriberStats()
        return { success: true, data: this.subscriberStats }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch subscriber stats'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async exportSubscribers(status?: SubscriberStatus) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const subscribers = await newsletterService.exportSubscribers(status)
        return { success: true, data: subscribers }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to export subscribers'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchSubscriberById(id: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        this.currentSubscriber = await newsletterService.getSubscriberById(id)
        return { success: true, data: this.currentSubscriber }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to fetch subscriber'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateSubscriber(id: string, data: UpdateSubscriberData) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        const subscriber = await newsletterService.updateSubscriber(id, data)
        const index = this.subscribers.findIndex(s => s.id === id)
        if (index !== -1) {
          this.subscribers[index] = subscriber
        }
        if (this.currentSubscriber?.id === id) {
          this.currentSubscriber = subscriber
        }
        return { success: true, data: subscriber }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to update subscriber'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteSubscriber(id: string) {
      this.loading = true
      this.error = null

      try {
        const newsletterService = useNewsletterService()
        await newsletterService.deleteSubscriber(id)
        this.subscribers = this.subscribers.filter(s => s.id !== id)
        if (this.currentSubscriber?.id === id) {
          this.currentSubscriber = null
        }
        return { success: true }
      } catch (e: any) {
        this.error = e?.data?.message || 'Failed to delete subscriber'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Utility Actions
    clearCurrentNewsletter() {
      this.currentNewsletter = null
    },

    clearCurrentSubscriber() {
      this.currentSubscriber = null
    },
  },
})
