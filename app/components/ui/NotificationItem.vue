<script setup lang="ts">
import type { Notification } from '~/types/notification'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  markRead: [id: string]
  delete: [id: string]
}>()

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'ORDER_UPDATE': return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
    case 'NEW_EXHIBITION': return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    case 'NEWSLETTER': return 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    case 'PRICE_DROP': return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'ARTIST_UPDATE': return 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
    case 'EVENT_REMINDER': return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    case 'COMMENT_REPLY': return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'ORDER_UPDATE': return 'bg-secondary-100 text-secondary-600'
    case 'NEW_EXHIBITION': return 'bg-purple-100 text-purple-600'
    case 'NEWSLETTER': return 'bg-blue-100 text-blue-600'
    case 'PRICE_DROP': return 'bg-green-100 text-green-600'
    case 'ARTIST_UPDATE': return 'bg-primary-100 text-primary-600'
    case 'EVENT_REMINDER': return 'bg-orange-100 text-orange-600'
    case 'COMMENT_REPLY': return 'bg-cyan-100 text-cyan-600'
    default: return 'bg-earth-100 text-bark-600'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function handleMarkRead() {
  if (!props.notification.read) {
    emit('markRead', props.notification.id)
  }
}

function handleDelete() {
  emit('delete', props.notification.id)
}
</script>

<template>
  <div
    class="relative p-4 rounded-xl border transition-all duration-200"
    :class="notification.read
      ? 'bg-white border-earth-100 hover:border-earth-200'
      : 'bg-primary-50/30 border-primary-100 hover:border-primary-200'"
  >
    <div class="flex gap-4">
      <!-- Icon -->
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="getTypeColor(notification.type)"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getNotificationIcon(notification.type)" />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h4
            class="font-medium"
            :class="notification.read ? 'text-bark-700' : 'text-bark-900'"
          >
            {{ notification.title }}
          </h4>

          <!-- Unread Indicator -->
          <div v-if="!notification.read" class="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
        </div>

        <p class="text-sm text-bark-600 mt-1">{{ notification.message }}</p>

        <div class="flex items-center gap-4 mt-3">
          <span class="text-xs text-bark-400">{{ formatDate(notification.createdAt) }}</span>

          <div class="flex items-center gap-2">
            <button
              v-if="!notification.read"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium"
              @click="handleMarkRead"
            >
              Mark as read
            </button>
            <button
              class="text-xs text-bark-400 hover:text-kente-red"
              @click="handleDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
