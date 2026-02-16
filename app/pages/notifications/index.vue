<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import type { NotificationType } from '~/types/notification'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const notificationsStore = useNotificationsStore()

const filterType = ref<NotificationType | ''>('')
const filterRead = ref<'' | 'read' | 'unread'>('')
const currentPage = ref(1)
const limit = 20

onMounted(async () => {
  await fetchNotifications()
})

async function fetchNotifications() {
  await notificationsStore.fetchNotifications({
    page: currentPage.value,
    limit,
    type: filterType.value || undefined,
    read: filterRead.value === '' ? undefined : filterRead.value === 'read',
  })
}

watch([filterType, filterRead], () => {
  currentPage.value = 1
  fetchNotifications()
})

async function handleMarkRead(id: string) {
  await notificationsStore.markAsRead(id)
}

async function handleDelete(id: string) {
  await notificationsStore.deleteNotification(id)
}

async function handleMarkAllRead() {
  await notificationsStore.markAllAsRead()
}

async function handleDeleteRead() {
  await notificationsStore.deleteReadNotifications()
}

async function handleDeleteAll() {
  if (confirm('Are you sure you want to delete all notifications?')) {
    await notificationsStore.deleteAllNotifications()
  }
}

function changePage(page: number) {
  currentPage.value = page
  fetchNotifications()
}

const notificationTypes: { value: NotificationType | '', label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'ORDER_UPDATE', label: 'Order Updates' },
  { value: 'NEW_EXHIBITION', label: 'New Exhibitions' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'PRICE_DROP', label: 'Price Drops' },
  { value: 'ARTIST_UPDATE', label: 'Artist Updates' },
  { value: 'EVENT_REMINDER', label: 'Event Reminders' },
  { value: 'COMMENT_REPLY', label: 'Comment Replies' },
  { value: 'SYSTEM', label: 'System' },
]
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-display font-bold text-bark-800">Notifications</h1>
      <p class="mt-1 text-bark-500">Stay updated with your latest activities</p>
    </div>

    <div class="bg-white rounded-2xl border border-earth-100 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-wrap gap-3">
          <select
            v-model="filterType"
            class="px-3 py-2 text-sm border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option v-for="type in notificationTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>

          <select
            v-model="filterRead"
            class="px-3 py-2 text-sm border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-if="notificationsStore.hasUnread"
            class="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
            @click="handleMarkAllRead"
          >
            Mark all as read
          </button>
          <button
            v-if="notificationsStore.readNotifications.length > 0"
            class="px-3 py-2 text-sm font-medium text-bark-500 hover:text-bark-700 hover:bg-earth-100 rounded-xl transition-colors"
            @click="handleDeleteRead"
          >
            Clear read
          </button>
          <button
            v-if="notificationsStore.notifications.length > 0"
            class="px-3 py-2 text-sm font-medium text-kente-red hover:bg-red-50 rounded-xl transition-colors"
            @click="handleDeleteAll"
          >
            Clear all
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4 mt-4 pt-4 border-t border-earth-100">
        <div class="flex items-center gap-2">
          <span class="text-sm text-bark-500">Total:</span>
          <span class="text-sm font-medium text-bark-700">{{ notificationsStore.pagination.total }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-bark-500">Unread:</span>
          <span class="text-sm font-medium text-primary-600">{{ notificationsStore.unreadCount }}</span>
        </div>
      </div>
    </div>

    <div v-if="notificationsStore.loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-earth-100 p-4">
        <div class="flex gap-4">
          <div class="w-12 h-12 bg-earth-100 rounded-xl animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-earth-100 rounded animate-pulse w-1/3" />
            <div class="h-4 bg-earth-100 rounded animate-pulse w-2/3" />
            <div class="h-3 bg-earth-100 rounded animate-pulse w-1/4" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="notificationsStore.notifications.length === 0" class="bg-white rounded-2xl border border-earth-100 py-16 text-center">
      <svg class="w-16 h-16 mx-auto text-earth-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <h3 class="text-lg font-medium text-bark-700 mb-1">No notifications</h3>
      <p class="text-sm text-bark-500">You're all caught up! Check back later for updates.</p>
    </div>

    <div v-else class="space-y-3">
      <UiNotificationItem
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        :notification="notification"
        @mark-read="handleMarkRead"
        @delete="handleDelete"
      />
    </div>

    <div v-if="notificationsStore.pagination.totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
      <button
        class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="flex items-center gap-1">
        <button
          v-for="page in notificationsStore.pagination.totalPages"
          :key="page"
          class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
          :class="page === currentPage
            ? 'bg-primary-500 text-white'
            : 'text-bark-600 hover:bg-earth-100'"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentPage === notificationsStore.pagination.totalPages"
        @click="changePage(currentPage + 1)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
