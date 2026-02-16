import type {
  Event,
  CreateEventData,
  UpdateEventData,
  EventListParams,
  EventListResponse,
  EventStats,
  RegisterForEventData,
  Registration,
  RegistrationListParams,
  RegistrationListResponse,
} from '~/types/event'
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

function buildEventQueryString(params?: EventListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.type) query.set('type', params.type)
  if (params.status) query.set('status', params.status)
  if (params.artistId) query.set('artistId', params.artistId)
  if (params.featured !== undefined) query.set('featured', String(params.featured))
  if (params.upcoming !== undefined) query.set('upcoming', String(params.upcoming))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function buildRegistrationQueryString(params?: RegistrationListParams): string {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.attended !== undefined) query.set('attended', String(params.attended))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function useEventService() {
  return {
    getEvents: async (params?: EventListParams): Promise<EventListResponse> => {
      return $fetch<EventListResponse>(`${API_BASE}/events${buildEventQueryString(params)}`)
    },

    getFeaturedEvents: async (limit?: number): Promise<Event[]> => {
      const query = limit ? `?limit=${limit}` : ''
      return $fetch<Event[]>(`${API_BASE}/events/featured${query}`)
    },

    getUpcomingEvents: async (limit?: number): Promise<Event[]> => {
      const query = limit ? `?limit=${limit}` : ''
      return $fetch<Event[]>(`${API_BASE}/events/upcoming${query}`)
    },

    getEventBySlug: async (slug: string): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events/slug/${slug}`)
    },

    getEventById: async (id: string): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events/${id}`)
    },

    registerForEvent: async (eventId: string, data: RegisterForEventData): Promise<Registration> => {
      return $fetch<Registration>(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        body: data,
      })
    },

    cancelRegistration: async (eventId: string, email: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/events/${eventId}/register`, {
        method: 'DELETE',
        body: { email },
      })
    },

    registerAsUser: async (eventId: string, data: RegisterForEventData): Promise<Registration> => {
      return $fetch<Registration>(`${API_BASE}/events/${eventId}/register/me`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    getMyRegistrations: async (): Promise<Registration[]> => {
      return $fetch<Registration[]>(`${API_BASE}/events/my/registrations`, {
        headers: getHeaders(),
      })
    },

    getEventStats: async (): Promise<EventStats> => {
      return $fetch<EventStats>(`${API_BASE}/events/admin/stats`, {
        headers: getHeaders(),
      })
    },

    createEvent: async (data: CreateEventData): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: data,
      })
    },

    updateEvent: async (id: string, data: UpdateEventData): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: data,
      })
    },

    deleteEvent: async (id: string): Promise<void> => {
      return $fetch<void>(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    },

    startEvent: async (id: string): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events/${id}/start`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    endEvent: async (id: string): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events/${id}/end`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    cancelEvent: async (id: string): Promise<Event> => {
      return $fetch<Event>(`${API_BASE}/events/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      })
    },

    getEventRegistrations: async (eventId: string, params?: RegistrationListParams): Promise<RegistrationListResponse> => {
      return $fetch<RegistrationListResponse>(`${API_BASE}/events/${eventId}/registrations${buildRegistrationQueryString(params)}`, {
        headers: getHeaders(),
      })
    },

    exportRegistrations: async (eventId: string): Promise<Registration[]> => {
      return $fetch<Registration[]>(`${API_BASE}/events/${eventId}/registrations/export`, {
        headers: getHeaders(),
      })
    },

    markAttendance: async (registrationId: string, attended: boolean): Promise<Registration> => {
      return $fetch<Registration>(`${API_BASE}/events/registrations/${registrationId}/attendance`, {
        method: 'PUT',
        headers: getHeaders(),
        body: { attended },
      })
    },
  }
}
