export type NewsletterStatus = 'DRAFT' | 'SCHEDULED' | 'SENT'

export type SubscriberStatus = 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED'

export interface Newsletter {
  id: string
  subject: string
  previewText?: string
  content: string
  status: NewsletterStatus
  scheduledAt?: string
  sentAt?: string
  recipientCount: number
  openCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
  openRate?: number
  clickRate?: number
}

export interface CreateNewsletterData {
  subject: string
  previewText?: string
  content: string
  scheduledAt?: string
}

export interface UpdateNewsletterData {
  subject?: string
  previewText?: string
  content?: string
  scheduledAt?: string
}

export interface NewsletterListParams {
  page?: number
  limit?: number
  status?: NewsletterStatus
  sortBy?: 'newest' | 'oldest' | 'scheduled'
}

export interface NewsletterListResponse {
  data: Newsletter[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface NewsletterStats {
  totalNewsletters: number
  totalSent: number
  totalScheduled: number
  totalDrafts: number
  averageOpenRate: number
  averageClickRate: number
}

export interface Subscriber {
  id: string
  userId?: string
  email: string
  firstName?: string
  lastName?: string
  status: SubscriberStatus
  preferences: string[]
  frequency: string
  subscribedAt: string
  unsubscribedAt?: string
  confirmedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SubscribeData {
  email: string
  firstName?: string
  lastName?: string
  preferences?: string[]
  frequency?: string
}

export interface UpdateSubscriberData {
  firstName?: string
  lastName?: string
  preferences?: string[]
  frequency?: string
  status?: SubscriberStatus
}

export interface SubscriberListParams {
  page?: number
  limit?: number
  status?: SubscriberStatus
  search?: string
  frequency?: string
  sortBy?: 'newest' | 'oldest' | 'email'
}

export interface SubscriberListResponse {
  data: Subscriber[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SubscriberStats {
  totalSubscribers: number
  activeSubscribers: number
  unsubscribed: number
  bounced: number
  newThisMonth: number
}
