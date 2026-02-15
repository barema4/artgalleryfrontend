// Notification Types

export type NotificationType =
  | 'ORDER_UPDATE'
  | 'NEW_EXHIBITION'
  | 'NEWSLETTER'
  | 'PRICE_DROP'
  | 'ARTIST_UPDATE'
  | 'EVENT_REMINDER'
  | 'COMMENT_REPLY'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  readAt?: string
  createdAt: string
}

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}

export interface CreateBulkNotificationData {
  userIds: string[]
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}

export interface NotificationListParams {
  page?: number
  limit?: number
  type?: NotificationType
  read?: boolean
}

export interface NotificationListResponse {
  data: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}

export interface NotificationCount {
  total: number
  unread: number
}

export interface CountResponse {
  count: number
}
