<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Dashboard'

  if (path.includes('/notifications')) return 'Notifications'
  if (path.includes('/account/profile')) return 'Profile'
  if (path.includes('/account/preferences')) return 'Preferences'
  if (path.includes('/account/security')) return 'Security'
  if (path.includes('/dashboard/artist-profile')) return 'Artist Profile'
  if (path.includes('/dashboard/artworks/new')) return 'New Artwork'
  if (path.includes('/dashboard/artworks') && path.includes('/edit')) return 'Edit Artwork'
  if (path.includes('/dashboard/artworks')) return 'My Artworks'
  if (path.includes('/admin/users')) return 'Manage Users'
  if (path.includes('/admin/artists')) return 'Manage Artists'
  if (path.includes('/admin/artworks')) return 'Manage Artworks'
  if (path.includes('/admin/newsletter')) return 'Newsletter'
  if (path.includes('/admin/comments')) return 'Comments'
  if (path.includes('/admin/magazine')) return 'Magazine'
  if (path.includes('/admin/media')) return 'Media Library'
  return 'Dashboard'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-earth">
    <LayoutSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <div class="lg:ml-64 min-h-screen flex flex-col">
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-earth-200">
        <div class="flex items-center justify-between h-16 px-4 lg:px-8">
          <div class="flex items-center gap-4">
            <button
              class="lg:hidden p-2 text-earth-600 hover:text-earth-900 hover:bg-earth-100 rounded-lg"
              @click="toggleSidebar"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-xl font-display font-semibold text-earth-900">{{ pageTitle }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <UiNotificationBell />

            <div class="relative">
              <button
                class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-earth-100 transition-colors"
                @click="handleLogout"
              >
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-primary-700">
                    {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <svg class="w-4 h-4 text-earth-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-8">
        <slot />
      </main>

      <footer class="border-t border-earth-200 bg-white/50 py-4 px-4 lg:px-8">
        <p class="text-sm text-earth-500 text-center">
          &copy; {{ new Date().getFullYear() }} AfriCraft Gallery. Celebrating African artistry.
        </p>
      </footer>
    </div>
  </div>
</template>