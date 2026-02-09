<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Artworks', href: '/artworks' },
  { name: 'Artists', href: '/artists' },
  { name: 'Collections', href: '/collections' },
  { name: 'Exhibitions', href: '/exhibitions' },
  { name: 'About', href: '/about' },
]

const isActive = (href: string) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

function navigateAndClose(path: string) {
  closeUserMenu()
  closeMenu()
  router.push(path)
}

async function handleLogout() {
  await authStore.logout()
  closeUserMenu()
  router.push('/')
}

// Close user menu when clicking outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu')) {
    closeUserMenu()
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
  <header class="sticky top-0 z-50 bg-mudcloth-cream/95 backdrop-blur-md border-b border-earth-200/80">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 flex-shrink-0" @click="closeMenu">
          <div class="w-11 h-11 bg-gradient-sunset rounded-xl flex items-center justify-center shadow-warm">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="hidden sm:block">
            <span class="text-xl font-display font-bold text-bark-800">Afrika</span>
            <span class="text-xl font-display text-primary-600">Crafts</span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation - Centered -->
        <div class="hidden lg:flex items-center justify-center flex-1 px-8">
          <div class="flex items-center bg-earth-100/50 rounded-full p-1.5">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300"
              :class="isActive(item.href)
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-bark-600 hover:text-bark-900 hover:bg-white/50'"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <!-- Search Button -->
          <button class="p-2.5 text-bark-500 hover:text-primary-600 hover:bg-earth-100 rounded-xl transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Logged In State -->
          <template v-if="authStore.isAuthenticated">
            <!-- Notifications -->
            <button class="p-2.5 text-bark-500 hover:text-primary-600 hover:bg-earth-100 rounded-xl transition-all duration-200 relative">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-mudcloth-cream"></span>
            </button>

            <!-- Divider -->
            <div class="w-px h-8 bg-earth-200"></div>

            <!-- User Menu -->
            <div class="relative user-menu">
              <button
                class="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-full hover:bg-earth-100 transition-all duration-200"
                @click.stop="toggleUserMenu"
              >
                <div class="w-9 h-9 bg-gradient-sunset rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                  <span class="text-sm font-semibold text-white">
                    {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="text-sm font-medium text-bark-700 hidden xl:block">{{ authStore.user?.profile?.firstName || 'Account' }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-1"
              >
                <div
                  v-if="isUserMenuOpen"
                  class="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-warm-lg border border-earth-100 py-2 overflow-hidden"
                >
                  <!-- User Info -->
                  <div class="px-4 py-4 bg-gradient-warm border-b border-earth-100">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-gradient-sunset rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                        <span class="text-lg font-semibold text-white">
                          {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-bark-800 truncate">{{ authStore.fullName }}</p>
                        <p class="text-xs text-bark-500 truncate">{{ authStore.user?.email }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-2">
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-earth-50 hover:text-primary-600 transition-colors"
                      @click="navigateAndClose('/dashboard')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      Dashboard
                    </button>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-earth-50 hover:text-primary-600 transition-colors"
                      @click="navigateAndClose('/account/profile')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Profile
                    </button>
                    <button
                      v-if="authStore.isArtist"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-earth-50 hover:text-primary-600 transition-colors"
                      @click="navigateAndClose('/dashboard/artist-profile')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                      </svg>
                      Artist Profile
                    </button>
                    <button
                      v-if="authStore.isArtist"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-earth-50 hover:text-primary-600 transition-colors"
                      @click="navigateAndClose('/dashboard/artworks')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      My Artworks
                    </button>
                    <button
                      v-if="!authStore.isArtist && !authStore.isAdmin"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                      @click="navigateAndClose('/dashboard/artist-profile')"
                    >
                      <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Become an Artist
                    </button>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-earth-50 hover:text-primary-600 transition-colors"
                      @click="navigateAndClose('/account/preferences')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Preferences
                    </button>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-earth-50 hover:text-primary-600 transition-colors"
                      @click="navigateAndClose('/account/security')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      Security
                    </button>
                  </div>

                  <!-- Admin Section -->
                  <div v-if="authStore.isAdmin" class="border-t border-earth-100 py-2">
                    <p class="px-4 py-2 text-xs font-semibold text-secondary-600 uppercase tracking-wide">Admin</p>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-secondary-50 hover:text-secondary-600 transition-colors"
                      @click="navigateAndClose('/admin/users')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      Manage Users
                    </button>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-secondary-50 hover:text-secondary-600 transition-colors"
                      @click="navigateAndClose('/admin/artists')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                      </svg>
                      Manage Artists
                    </button>
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-secondary-50 hover:text-secondary-600 transition-colors"
                      @click="navigateAndClose('/admin/artworks')"
                    >
                      <svg class="w-5 h-5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                      Manage Artworks
                    </button>
                  </div>

                  <!-- Logout -->
                  <div class="border-t border-earth-100 py-2">
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-kente-red hover:bg-red-50 transition-colors"
                      @click="handleLogout"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Logged Out State -->
          <template v-else>
            <NuxtLink
              to="/auth/login"
              class="px-4 py-2 text-sm font-medium text-bark-600 hover:text-primary-600 transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="px-5 py-2.5 bg-gradient-sunset text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-warm transition-all"
            >
              Get Started
            </NuxtLink>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="lg:hidden p-2.5 text-bark-600 hover:text-primary-600 hover:bg-earth-100 rounded-xl transition-all"
          @click="toggleMenu"
          aria-label="Toggle menu"
        >
          <svg
            v-if="!isMenuOpen"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="isMenuOpen" class="lg:hidden py-4 border-t border-earth-200">
          <!-- Navigation Links -->
          <div class="grid grid-cols-2 gap-2 mb-4">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="px-4 py-3 text-center text-sm font-medium rounded-xl transition-all"
              :class="isActive(item.href)
                ? 'bg-primary-500 text-white shadow-warm'
                : 'bg-earth-100 text-bark-700 hover:bg-earth-200'"
              @click="closeMenu"
            >
              {{ item.name }}
            </NuxtLink>
          </div>

          <!-- Mobile Auth Section -->
          <div class="pt-4 border-t border-earth-200">
            <template v-if="authStore.isAuthenticated">
              <!-- User Info -->
              <div class="flex items-center gap-3 px-4 py-3 mb-3 bg-gradient-warm rounded-xl">
                <div class="w-12 h-12 bg-gradient-sunset rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                  <span class="text-lg font-semibold text-white">
                    {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-bark-800 truncate">{{ authStore.fullName }}</p>
                  <p class="text-sm text-bark-500 truncate">{{ authStore.user?.email }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  class="px-4 py-3 text-sm font-medium text-bark-700 bg-earth-100 hover:bg-earth-200 rounded-xl transition-colors"
                  @click="navigateAndClose('/dashboard')"
                >
                  Dashboard
                </button>
                <button
                  class="px-4 py-3 text-sm font-medium text-bark-700 bg-earth-100 hover:bg-earth-200 rounded-xl transition-colors"
                  @click="navigateAndClose('/account/profile')"
                >
                  Profile
                </button>
              </div>
              <button
                class="w-full mt-3 px-4 py-3 text-sm font-medium text-kente-red bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                @click="handleLogout"
              >
                Sign out
              </button>
            </template>

            <template v-else>
              <div class="grid grid-cols-2 gap-3">
                <button
                  class="px-4 py-3 text-sm font-medium text-bark-700 bg-earth-100 hover:bg-earth-200 rounded-xl transition-colors"
                  @click="navigateAndClose('/auth/login')"
                >
                  Sign In
                </button>
                <button
                  class="px-4 py-3 bg-gradient-sunset text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-warm transition-all"
                  @click="navigateAndClose('/auth/register')"
                >
                  Get Started
                </button>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>