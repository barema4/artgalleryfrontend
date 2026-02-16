import type {
  Newsletter,
  CreateNewsletterData,
  UpdateNewsletterData,
  NewsletterListParams,
  NewsletterListResponse,
  NewsletterStats,
  Subscriber,
  SubscribeData,
  UpdateSubscriberData,
  SubscriberListParams,
  SubscriberListResponse,
  SubscriberStats,
  SubscriberStatus,
} from '~/types/newsletter'
import { useAuthStore } from '~/stores/auth'

const API_BASE = '/api/v1'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('art-gallery-auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.accessToken || null
    }
  } catch {
  }

  const authStore = useAuthStore()
  return authStore.accessToken
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function buildNewsletterQueryString(params?: NewsletterListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function buildSubscriberQueryString(params?: SubscriberListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.search) query.set('search', params.search)
  if (params.frequency) query.set('frequency', params.frequency)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function useNewsletterService() {
  return {
    subscribe: async (data: SubscribeData): Promise<Subscriber> => {
      return $fetch<Subscriber>(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        body: data,
      })
    },

    confirmSubscription: async (token: string): Promise<Subscriber> => {
      return $fetch<Subscriber>(`${API_BASE}/newsletter/confirm/${token}`)
    },

    unsubscribe: async (email: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/newsletter/unsubscribe`, {
        method: 'POST',
        body: { email },
      })
    },

    trackOpen: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/newsletter/track/open/${id}`)
    },

    trackClick: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/newsletter/track/click/${id}`)
    },

    getNewsletters: async (params?: NewsletterListParams): Promise<NewsletterListResponse> => {
      return $fetch<NewsletterListResponse>(`${API_BASE}/newsletter/admin/campaigns${buildNewsletterQueryString(params)}`, {
        headers: getHeaders(),
      })
    },

    getNewsletterStats: async (): Promise<NewsletterStats> => {
      return $fetch<NewsletterStats>(`${API_BASE}/newsletter/admin/campaigns/stats`, {
        headers: getHeaders(),
      })
    },

    getNewsletterById: async (id: string): Promise<Newsletter> => {
      return $fetch<Newsletter>(`${API_BASE}/newsletter/admin/campaigns/${id}`, {
        headers: getHeaders(),
      })
    },

    createNewsletter: async (data: CreateNewsletterData): Promise<Newsletter> => {
      return $fetch<Newsletter>(`${API_BASE}/newsletter/admin/campaigns`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateNewsletter: async (id: string, data: UpdateNewsletterData): Promise<Newsletter> => {
      return $fetch<Newsletter>(`${API_BASE}/newsletter/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteNewsletter: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/newsletter/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    scheduleNewsletter: async (id: string, scheduledAt: string): Promise<Newsletter> => {
      return $fetch<Newsletter>(`${API_BASE}/newsletter/admin/campaigns/${id}/schedule`, {
        method: 'POST',
        headers: getHeaders(),
        body: { scheduledAt },
      })
    },

    sendNewsletter: async (id: string): Promise<Newsletter> => {
      return $fetch<Newsletter>(`${API_BASE}/newsletter/admin/campaigns/${id}/send`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    duplicateNewsletter: async (id: string): Promise<Newsletter> => {
      return $fetch<Newsletter>(`${API_BASE}/newsletter/admin/campaigns/${id}/duplicate`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    getSubscribers: async (params?: SubscriberListParams): Promise<SubscriberListResponse> => {
      return $fetch<SubscriberListResponse>(`${API_BASE}/newsletter/admin/subscribers${buildSubscriberQueryString(params)}`, {
        headers: getHeaders(),
      })
    },

    getSubscriberStats: async (): Promise<SubscriberStats> => {
      return $fetch<SubscriberStats>(`${API_BASE}/newsletter/admin/subscribers/stats`, {
        headers: getHeaders(),
      })
    },

    exportSubscribers: async (status?: SubscriberStatus): Promise<Subscriber[]> => {
      const query = status ? `?status=${status}` : ''
      return $fetch<Subscriber[]>(`${API_BASE}/newsletter/admin/subscribers/export${query}`, {
        headers: getHeaders(),
      })
    },

    getSubscriberById: async (id: string): Promise<Subscriber> => {
      return $fetch<Subscriber>(`${API_BASE}/newsletter/admin/subscribers/${id}`, {
        headers: getHeaders(),
      })
    },

    updateSubscriber: async (id: string, data: UpdateSubscriberData): Promise<Subscriber> => {
      return $fetch<Subscriber>(`${API_BASE}/newsletter/admin/subscribers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteSubscriber: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/newsletter/admin/subscribers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },
  }
}
