<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home' },
  { name: 'Notifications', href: '/notifications', icon: 'bell' },
  { name: 'Profile', href: '/account/profile', icon: 'user' },
  { name: 'Preferences', href: '/account/preferences', icon: 'settings' },
  { name: 'Security', href: '/account/security', icon: 'shield' },
]

const artistNavigation = [
  { name: 'Artist Profile', href: '/dashboard/artist-profile', icon: 'palette' },
  { name: 'My Artworks', href: '/dashboard/artworks', icon: 'image' },
]

const adminNavigation = [
  { name: 'Manage Users', href: '/admin/users', icon: 'users' },
  { name: 'Manage Artists', href: '/admin/artists', icon: 'verified' },
  { name: 'Manage Artworks', href: '/admin/artworks', icon: 'gallery' },
  { name: 'Media', href: '/admin/media', icon: 'media' },
  { name: 'Magazine', href: '/admin/magazine', icon: 'magazine' },
  { name: 'Newsletter', href: '/admin/newsletter', icon: 'mail' },
  { name: 'Comments', href: '/admin/comments', icon: 'comments' },
]

const isActive = (href: string) => {
  return route.path === href || route.path.startsWith(href + '/')
}

function handleNavClick() {
  emit('close')
}
</script>

<template>
  <!-- Mobile Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    @click="emit('close')"
  ></div>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 z-40 h-screen transition-transform duration-300 lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-full w-64 bg-gradient-to-b from-earth-900 to-bark-950 text-white flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-earth-700/50">
        <NuxtLink to="/" class="flex items-center gap-3" @click="handleNavClick">
          <div class="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center shadow-warm">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <span class="text-lg font-display font-bold text-white">AfriCraft</span>
            <span class="block text-xs text-earth-300">Gallery</span>
          </div>
        </NuxtLink>
      </div>

      <!-- User Info -->
      <div class="p-4 border-b border-earth-700/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
            <span class="text-primary-300 font-medium">
              {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ authStore.fullName }}</p>
            <p class="text-xs text-earth-400 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Main Navigation -->
        <div>
          <p class="px-3 mb-2 text-xs font-semibold text-earth-400 uppercase tracking-wider">Main</p>
          <ul class="space-y-1">
            <li v-for="item in mainNavigation" :key="item.name">
              <NuxtLink
                :to="item.href"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                :class="isActive(item.href)
                  ? 'bg-primary-500/20 text-primary-300 shadow-warm'
                  : 'text-earth-300 hover:bg-earth-700/50 hover:text-white'"
                @click="handleNavClick"
              >
                <!-- Icons -->
                <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <svg v-if="item.icon === 'bell'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <svg v-if="item.icon === 'user'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg v-if="item.icon === 'settings'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-if="item.icon === 'shield'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{{ item.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Artist Navigation -->
        <div v-if="authStore.isArtist">
          <p class="px-3 mb-2 text-xs font-semibold text-earth-400 uppercase tracking-wider">Artist</p>
          <ul class="space-y-1">
            <li v-for="item in artistNavigation" :key="item.name">
              <NuxtLink
                :to="item.href"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                :class="isActive(item.href)
                  ? 'bg-primary-500/20 text-primary-300 shadow-warm'
                  : 'text-earth-300 hover:bg-earth-700/50 hover:text-white'"
                @click="handleNavClick"
              >
                <svg v-if="item.icon === 'palette'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <svg v-if="item.icon === 'image'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ item.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Admin Navigation -->
        <div v-if="authStore.isAdmin">
          <p class="px-3 mb-2 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Admin</p>
          <ul class="space-y-1">
            <li v-for="item in adminNavigation" :key="item.name">
              <NuxtLink
                :to="item.href"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                :class="isActive(item.href)
                  ? 'bg-secondary-500/20 text-secondary-300'
                  : 'text-earth-300 hover:bg-earth-700/50 hover:text-white'"
                @click="handleNavClick"
              >
                <svg v-if="item.icon === 'users'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-if="item.icon === 'verified'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <svg v-if="item.icon === 'gallery'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <svg v-if="item.icon === 'magazine'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <svg v-if="item.icon === 'mail'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg v-if="item.icon === 'media'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg v-if="item.icon === 'comments'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ item.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-earth-700/50">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-earth-300 hover:bg-earth-700/50 hover:text-white transition-colors"
          @click="handleNavClick"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Back to Gallery</span>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>