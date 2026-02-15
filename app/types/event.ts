// Event Types

export type EventType = 'ARTIST_TALK' | 'LIVE_CREATION' | 'QA_SESSION' | 'AUCTION' | 'WORKSHOP'

export type EventStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'

export interface EventArtist {
  id: string
  displayName: string
  profileImage?: string
}

export interface Event {
  id: string
  artistId?: string
  title: string
  slug: string
  description?: string
  type: EventType
  status: EventStatus
  coverImage?: string
  startDate: string
  endDate?: string
  timezone: string
  isVirtual: boolean
  streamUrl?: string
  maxAttendees?: number
  registrationCount: number
  featured: boolean
  createdAt: string
  updatedAt: string
  artist?: EventArtist
  registrationOpen?: boolean
}

export interface CreateEventData {
  title: string
  description?: string
  type: EventType
  coverImage?: string
  startDate: string
  endDate?: string
  timezone?: string
  isVirtual?: boolean
  streamUrl?: string
  maxAttendees?: number
  artistId?: string
  featured?: boolean
}

export interface UpdateEventData {
  title?: string
  description?: string
  type?: EventType
  status?: EventStatus
  coverImage?: string
  startDate?: string
  endDate?: string
  timezone?: string
  isVirtual?: boolean
  streamUrl?: string
  maxAttendees?: number
  artistId?: string
  featured?: boolean
}

export interface EventListParams {
  page?: number
  limit?: number
  type?: EventType
  status?: EventStatus
  artistId?: string
  featured?: boolean
  upcoming?: boolean
  sortBy?: 'newest' | 'oldest' | 'startDate' | 'popular'
}

export interface EventListResponse {
  data: Event[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EventStats {
  totalEvents: number
  scheduledEvents: number
  liveEvents: number
  endedEvents: number
  cancelledEvents: number
  totalRegistrations: number
  upcomingThisWeek: number
}

// Registration Types

export interface RegisterForEventData {
  email: string
  firstName?: string
  lastName?: string
}

export interface Registration {
  id: string
  eventId: string
  userId?: string
  email: string
  firstName?: string
  lastName?: string
  attended: boolean
  reminderSent: boolean
  createdAt: string
  event?: {
    id: string
    title: string
    startDate: string
    type: EventType
  }
}

export interface RegistrationListParams {
  page?: number
  limit?: number
  search?: string
  attended?: boolean
  sortBy?: 'newest' | 'oldest' | 'email'
}

export interface RegistrationListResponse {
  data: Registration[]
  total: number
  page: number
  limit: number
  totalPages: number
}
