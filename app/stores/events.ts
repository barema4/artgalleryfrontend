import type {
  Event,
  EventListParams,
  EventListResponse,
  EventType,
  EventStats,
  Registration,
  RegisterForEventData,
  CreateEventData,
  UpdateEventData,
  RegistrationListParams,
} from '~/types/event'
import { useEventService } from '~/services/event.service'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  ARTIST_TALK: 'Artist Talk',
  LIVE_CREATION: 'Live Creation',
  QA_SESSION: 'Q&A Session',
  AUCTION: 'Auction',
  WORKSHOP: 'Workshop',
}

interface EventsState {
  events: Event[]
  featuredEvents: Event[]
  upcomingEvents: Event[]
  currentEvent: Event | null
  myRegistrations: Registration[]
  eventStats: EventStats | null
  eventRegistrations: Registration[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  registrationPagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    featuredEvents: [],
    upcomingEvents: [],
    currentEvent: null,
    myRegistrations: [],
    eventStats: null,
    eventRegistrations: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 0,
    },
    registrationPagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    },
  }),

  getters: {
    getEventBySlug: (state) => (slug: string) => state.events.find(e => e.slug === slug),
    hasEvents: (state) => state.events.length > 0,
    liveEvents: (state) => state.events.filter(e => e.status === 'LIVE'),
    scheduledEvents: (state) => state.events.filter(e => e.status === 'SCHEDULED'),
  },

  actions: {
    async fetchEvents(params?: EventListParams) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const response: EventListResponse = await eventService.getEvents(params)

        this.events = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch events'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchFeaturedEvents(limit: number = 3) {
      try {
        const eventService = useEventService()
        const events = await eventService.getFeaturedEvents(limit)

        this.featuredEvents = events
        return { success: true, data: events }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        return { success: false, error: err?.data?.message || 'Failed to fetch featured events' }
      }
    },

    async fetchUpcomingEvents(limit: number = 6) {
      try {
        const eventService = useEventService()
        const events = await eventService.getUpcomingEvents(limit)

        this.upcomingEvents = events
        return { success: true, data: events }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        return { success: false, error: err?.data?.message || 'Failed to fetch upcoming events' }
      }
    },

    async fetchEventBySlug(slug: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.getEventBySlug(slug)

        this.currentEvent = event

        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async registerForEvent(eventId: string, data: RegisterForEventData) {
      try {
        const eventService = useEventService()
        const registration = await eventService.registerForEvent(eventId, data)

        if (this.currentEvent?.id === eventId) {
          this.currentEvent.registrationCount += 1
        }

        return { success: true, data: registration }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        return { success: false, error: err?.data?.message || 'Failed to register for event' }
      }
    },

    async fetchMyRegistrations() {
      try {
        const eventService = useEventService()
        const registrations = await eventService.getMyRegistrations()

        this.myRegistrations = registrations
        return { success: true, data: registrations }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        return { success: false, error: err?.data?.message || 'Failed to fetch registrations' }
      }
    },

    clearCurrentEvent() {
      this.currentEvent = null
    },

    clearError() {
      this.error = null
    },

    // Additional Public Actions
    async fetchEventById(id: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.getEventById(id)

        this.currentEvent = event
        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async cancelRegistration(eventId: string, email: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        await eventService.cancelRegistration(eventId, email)

        if (this.currentEvent?.id === eventId) {
          this.currentEvent.registrationCount -= 1
        }

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to cancel registration'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async registerAsUser(eventId: string, data: RegisterForEventData) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const registration = await eventService.registerAsUser(eventId, data)

        if (this.currentEvent?.id === eventId) {
          this.currentEvent.registrationCount += 1
        }
        this.myRegistrations.push(registration)

        return { success: true, data: registration }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to register for event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Event Actions
    async fetchEventStats() {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        this.eventStats = await eventService.getEventStats()
        return { success: true, data: this.eventStats }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch event stats'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createEvent(data: CreateEventData) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.createEvent(data)
        this.events.unshift(event)
        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to create event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateEvent(id: string, data: UpdateEventData) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.updateEvent(id, data)
        const index = this.events.findIndex(e => e.id === id)
        if (index !== -1) {
          this.events[index] = event
        }
        if (this.currentEvent?.id === id) {
          this.currentEvent = event
        }
        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to update event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteEvent(id: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        await eventService.deleteEvent(id)
        this.events = this.events.filter(e => e.id !== id)
        if (this.currentEvent?.id === id) {
          this.currentEvent = null
        }
        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async startEvent(id: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.startEvent(id)
        const index = this.events.findIndex(e => e.id === id)
        if (index !== -1) {
          this.events[index] = event
        }
        if (this.currentEvent?.id === id) {
          this.currentEvent = event
        }
        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to start event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async endEvent(id: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.endEvent(id)
        const index = this.events.findIndex(e => e.id === id)
        if (index !== -1) {
          this.events[index] = event
        }
        if (this.currentEvent?.id === id) {
          this.currentEvent = event
        }
        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to end event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async cancelEvent(id: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const event = await eventService.cancelEvent(id)
        const index = this.events.findIndex(e => e.id === id)
        if (index !== -1) {
          this.events[index] = event
        }
        if (this.currentEvent?.id === id) {
          this.currentEvent = event
        }
        return { success: true, data: event }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to cancel event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin Registration Actions
    async fetchEventRegistrations(eventId: string, params?: RegistrationListParams) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const response = await eventService.getEventRegistrations(eventId, {
          page: params?.page || this.registrationPagination.page,
          limit: params?.limit || this.registrationPagination.limit,
          ...params,
        })

        this.eventRegistrations = response.data
        this.registrationPagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch registrations'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async exportRegistrations(eventId: string) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const registrations = await eventService.exportRegistrations(eventId)
        return { success: true, data: registrations }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to export registrations'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async markAttendance(registrationId: string, attended: boolean) {
      this.loading = true
      this.error = null

      try {
        const eventService = useEventService()
        const registration = await eventService.markAttendance(registrationId, attended)
        const index = this.eventRegistrations.findIndex(r => r.id === registrationId)
        if (index !== -1) {
          this.eventRegistrations[index] = registration
        }
        return { success: true, data: registration }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to mark attendance'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    clearEventRegistrations() {
      this.eventRegistrations = []
    },
  },
})
