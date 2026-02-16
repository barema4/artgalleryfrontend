import type {
  Notification,
  NotificationListParams,
  NotificationListResponse,
  NotificationCount,
} from '~/types/notification'
import { useNotificationService } from '~/services/notification.service'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  totalCount: number
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    readNotifications: (state) => state.notifications.filter(n => n.read),
    getById: (state) => (id: string) => state.notifications.find(n => n.id === id),
  },

  actions: {
    async fetchNotifications(params?: NotificationListParams) {
      this.loading = true
      this.error = null

      try {
        const notificationService = useNotificationService()
        const response: NotificationListResponse = await notificationService.getNotifications(params)

        this.notifications = response.data
        this.unreadCount = response.unreadCount
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch notifications'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCount() {
      try {
        const notificationService = useNotificationService()
        const count: NotificationCount = await notificationService.getNotificationCount()

        this.unreadCount = count.unread
        this.totalCount = count.total

        return { success: true, data: count }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch notification count'
        return { success: false, error: this.error }
      }
    },

    async markAsRead(id: string) {
      try {
        const notificationService = useNotificationService()
        const notification = await notificationService.markAsRead(id)

        const index = this.notifications.findIndex(n => n.id === id)
        if (index !== -1) {
          this.notifications[index] = notification
        }

        if (this.unreadCount > 0) {
          this.unreadCount--
        }

        return { success: true, data: notification }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to mark notification as read'
        return { success: false, error: this.error }
      }
    },

    async markAllAsRead() {
      try {
        const notificationService = useNotificationService()
        const result = await notificationService.markAllAsRead()

        this.notifications = this.notifications.map(n => ({
          ...n,
          read: true,
          readAt: new Date().toISOString(),
        }))

        this.unreadCount = 0

        return { success: true, data: result }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to mark all as read'
        return { success: false, error: this.error }
      }
    },

    async markMultipleAsRead(ids: string[]) {
      try {
        const notificationService = useNotificationService()
        const result = await notificationService.markMultipleAsRead(ids)

        this.notifications = this.notifications.map(n => {
          if (ids.includes(n.id)) {
            return { ...n, read: true, readAt: new Date().toISOString() }
          }
          return n
        })

        await this.fetchCount()

        return { success: true, data: result }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to mark notifications as read'
        return { success: false, error: this.error }
      }
    },

    async deleteNotification(id: string) {
      try {
        const notificationService = useNotificationService()
        await notificationService.deleteNotification(id)

        const notification = this.notifications.find(n => n.id === id)
        this.notifications = this.notifications.filter(n => n.id !== id)

        if (notification && !notification.read && this.unreadCount > 0) {
          this.unreadCount--
        }

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete notification'
        return { success: false, error: this.error }
      }
    },

    async deleteAllNotifications() {
      try {
        const notificationService = useNotificationService()
        const result = await notificationService.deleteAllNotifications()

        this.notifications = []
        this.unreadCount = 0
        this.totalCount = 0

        return { success: true, data: result }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete all notifications'
        return { success: false, error: this.error }
      }
    },

    async deleteReadNotifications() {
      try {
        const notificationService = useNotificationService()
        const result = await notificationService.deleteReadNotifications()

        this.notifications = this.notifications.filter(n => !n.read)

        return { success: true, data: result }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete read notifications'
        return { success: false, error: this.error }
      }
    },

    clearError() {
      this.error = null
    },
  },
})
