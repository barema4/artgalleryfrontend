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

async function handleLogout() {
  await authStore.logout()
  closeUserMenu()
  router.push('/')
}

// Close user menu when clicking outside
if (import.meta.client) {
  onMounted(() => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu')) {
        closeUserMenu()
      }
    })
  })
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2" @click="closeMenu">
          <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">A</span>
          </div>
          <span class="text-xl font-semibold text-gray-900 hidden sm:block">ArtGallery</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-8">
          <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="text-sm font-medium transition-colors duration-200"
            :class="isActive(item.href) ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'"
          >
            {{ item.name }}
          </NuxtLink>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden lg:flex items-center gap-4">
          <button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Logged In State -->
          <template v-if="authStore.isAuthenticated">
            <div class="relative user-menu">
              <button
                class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                @click.stop="toggleUserMenu"
              >
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="isUserMenuOpen"
                  class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2"
                >
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900">{{ authStore.fullName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-1">
                    <NuxtLink
                      to="/dashboard"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeUserMenu"
                    >
                      Dashboard
                    </NuxtLink>
                    <NuxtLink
                      to="/account/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeUserMenu"
                    >
                      Profile
                    </NuxtLink>
                    <NuxtLink
                      v-if="authStore.isArtist"
                      to="/dashboard/artworks"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeUserMenu"
                    >
                      My Artworks
                    </NuxtLink>
                    <NuxtLink
                      to="/account/preferences"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="closeUserMenu"
                    >
                      Settings
                    </NuxtLink>
                  </div>

                  <!-- Logout -->
                  <div class="border-t border-gray-100 py-1">
                    <button
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      @click="handleLogout"
                    >
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
              class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </NuxtLink>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="lg:hidden p-2 text-gray-600 hover:text-gray-900"
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
        <div v-if="isMenuOpen" class="lg:hidden py-4 border-t border-gray-100">
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="px-4 py-3 text-base font-medium rounded-lg transition-colors"
              :class="isActive(item.href) ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              @click="closeMenu"
            >
              {{ item.name }}
            </NuxtLink>
          </div>

          <!-- Mobile Auth Section -->
          <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <template v-if="authStore.isAuthenticated">
              <!-- User Info -->
              <div class="px-4 py-3 flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ authStore.user?.profile?.firstName?.charAt(0) || authStore.user?.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ authStore.fullName }}</p>
                  <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                </div>
              </div>

              <NuxtLink
                to="/dashboard"
                class="px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                @click="closeMenu"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/account/profile"
                class="px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                @click="closeMenu"
              >
                Profile
              </NuxtLink>
              <button
                class="px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                @click="handleLogout"
              >
                Sign out
              </button>
            </template>

            <template v-else>
              <NuxtLink
                to="/auth/login"
                class="px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                @click="closeMenu"
              >
                Sign In
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="mx-4 py-3 bg-gray-900 text-white text-base font-medium text-center rounded-lg hover:bg-gray-800 transition-colors"
                @click="closeMenu"
              >
                Get Started
              </NuxtLink>
            </template>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>
