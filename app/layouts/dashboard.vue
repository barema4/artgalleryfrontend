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

// Get page title from route
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Dashboard'
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
  return 'Dashboard'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-earth">
    <!-- Sidebar -->
    <LayoutSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <!-- Main Content -->
    <div class="lg:ml-64 min-h-screen flex flex-col">
      <!-- Top Header Bar -->
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-earth-200">
        <div class="flex items-center justify-between h-16 px-4 lg:px-8">
          <!-- Left: Menu Button & Title -->
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

          <!-- Right: Actions -->
          <div class="flex items-center gap-3">
            <!-- Notifications -->
            <button class="p-2 text-earth-500 hover:text-earth-700 hover:bg-earth-100 rounded-lg relative">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>

            <!-- User Menu -->
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

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-8">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-earth-200 bg-white/50 py-4 px-4 lg:px-8">
        <p class="text-sm text-earth-500 text-center">
          &copy; {{ new Date().getFullYear() }} AfriCraft Gallery. Celebrating African artistry.
        </p>
      </footer>
    </div>
  </div>
</template>