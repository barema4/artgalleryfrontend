import type {
  Event,
  EventListParams,
  EventListResponse,
  EventType,
  Registration,
  RegisterForEventData,
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
  loading: boolean
  error: string | null
  pagination: {
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
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 9,
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
  },
})
