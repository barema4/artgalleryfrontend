<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await notificationsStore.fetchCount()
    await notificationsStore.fetchNotifications({ limit: 5 })
  }
})

watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await notificationsStore.fetchCount()
    await notificationsStore.fetchNotifications({ limit: 5 })
  }
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

async function handleMarkAsRead(id: string) {
  await notificationsStore.markAsRead(id)
}

async function handleMarkAllRead() {
  await notificationsStore.markAllAsRead()
}

function viewAllNotifications() {
  closeDropdown()
  router.push('/notifications')
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'ORDER_UPDATE': return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
    case 'NEW_EXHIBITION': return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    case 'PRICE_DROP': return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'ARTIST_UPDATE': return 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
    case 'EVENT_REMINDER': return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    case 'COMMENT_REPLY': return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    default: return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      class="p-2.5 text-bark-500 hover:text-primary-600 hover:bg-earth-100 rounded-xl transition-all duration-200 relative"
      @click.stop="toggleDropdown"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

      <span
        v-if="notificationsStore.hasUnread"
        class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary-500 rounded-full ring-2 ring-mudcloth-cream"
      >
        {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-warm-lg border border-earth-100 overflow-hidden z-50"
      >
        <div class="px-4 py-3 bg-gradient-warm border-b border-earth-100 flex items-center justify-between">
          <h3 class="font-semibold text-bark-800">Notifications</h3>
          <button
            v-if="notificationsStore.hasUnread"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium"
            @click="handleMarkAllRead"
          >
            Mark all read
          </button>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="notificationsStore.loading" class="p-4 space-y-3">
            <div v-for="i in 3" :key="i" class="flex gap-3">
              <div class="w-10 h-10 bg-earth-100 rounded-full animate-pulse flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-earth-100 rounded animate-pulse w-3/4" />
                <div class="h-3 bg-earth-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>

          <div v-else-if="notificationsStore.notifications.length === 0" class="py-12 text-center">
            <svg class="w-12 h-12 mx-auto text-earth-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="text-sm text-bark-500">No notifications yet</p>
          </div>

          <div v-else>
            <button
              v-for="notification in notificationsStore.notifications"
              :key="notification.id"
              class="w-full px-4 py-3 flex gap-3 text-left transition-colors"
              :class="notification.read ? 'bg-white hover:bg-earth-50' : 'bg-primary-50/50 hover:bg-primary-50'"
              @click="handleMarkAsRead(notification.id)"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                :class="notification.read ? 'bg-earth-100 text-bark-500' : 'bg-primary-100 text-primary-600'"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getNotificationIcon(notification.type)" />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm truncate"
                  :class="notification.read ? 'text-bark-600' : 'text-bark-800 font-medium'"
                >
                  {{ notification.title }}
                </p>
                <p class="text-xs text-bark-500 truncate mt-0.5">{{ notification.message }}</p>
                <p class="text-xs text-bark-400 mt-1">{{ formatTime(notification.createdAt) }}</p>
              </div>

              <div v-if="!notification.read" class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
            </button>
          </div>
        </div>

        <div class="px-4 py-3 bg-earth-50 border-t border-earth-100">
          <button
            class="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700"
            @click="viewAllNotifications"
          >
            View all notifications
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
