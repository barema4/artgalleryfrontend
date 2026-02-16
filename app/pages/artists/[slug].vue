<script setup lang="ts">
import type { Artist, ArtistStats } from '~/types/artist'
import { useArtistService } from '~/services/artist.service'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const artistService = useArtistService()
const authStore = useAuthStore()

const slug = computed(() => route.params.slug as string)

const artist = ref<Artist | null>(null)
const stats = ref<ArtistStats | null>(null)
const isLoading = ref(true)
const error = ref('')

const isFollowing = ref(false)
const isFollowLoading = ref(false)

const showGuestFollowModal = ref(false)
const guestEmail = ref('')
const guestFollowError = ref('')
const guestFollowSuccess = ref(false)

async function fetchArtist() {
  isLoading.value = true
  error.value = ''

  try {
    artist.value = await artistService.getArtistBySlug(slug.value)

    if (artist.value) {
      stats.value = await artistService.getArtistStats(artist.value.id)

      if (authStore.isAuthenticated) {
        const result = await artistService.isFollowingArtist(artist.value.id)
        isFollowing.value = result.isFollowing
      }
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artist'
  } finally {
    isLoading.value = false
  }
}

async function toggleFollow() {
  if (!artist.value) return

  if (!authStore.isAuthenticated) {
    showGuestFollowModal.value = true
    return
  }

  isFollowLoading.value = true

  try {
    if (isFollowing.value) {
      await artistService.unfollowArtist(artist.value.id)
      isFollowing.value = false
      if (stats.value) stats.value.followerCount--
    } else {
      await artistService.followArtist(artist.value.id)
      isFollowing.value = true
      if (stats.value) stats.value.followerCount++
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update follow status'
  } finally {
    isFollowLoading.value = false
  }
}

async function handleGuestFollow() {
  if (!artist.value || !guestEmail.value) return

  guestFollowError.value = ''

  try {
    await artistService.followArtistAsGuest(artist.value.id, { email: guestEmail.value })
    guestFollowSuccess.value = true
  } catch (e: any) {
    guestFollowError.value = e?.data?.message || 'Failed to follow artist'
  }
}

function closeGuestModal() {
  showGuestFollowModal.value = false
  guestEmail.value = ''
  guestFollowError.value = ''
  guestFollowSuccess.value = false
}

onMounted(() => {
  fetchArtist()
})

watch(slug, () => {
  fetchArtist()
})
</script>

<template>
  <div class="min-h-screen">
    <div v-if="isLoading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="error" class="max-w-2xl mx-auto py-24 px-4 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Artist not found</h1>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <NuxtLink to="/artists" class="text-gray-900 font-medium hover:underline">
        Back to artists
      </NuxtLink>
    </div>

    <template v-else-if="artist">
      <div class="h-64 md:h-80 bg-gray-200 relative">
        <img
          v-if="artist.coverImage"
          :src="artist.coverImage"
          :alt="artist.displayName"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div class="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-shrink-0">
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 -mt-20 md:-mt-24">
                <img
                  v-if="artist.profileImage"
                  :src="artist.profileImage"
                  :alt="artist.displayName"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-4xl font-bold text-gray-400">
                    {{ artist.displayName?.[0]?.toUpperCase() || 'A' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex-1">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-3">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
                      {{ artist.displayName }}
                    </h1>
                    <span
                      v-if="artist.verified"
                      class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>

                  <div class="flex items-center gap-6 mt-3 text-sm">
                    <span>
                      <span class="font-semibold text-gray-900">{{ stats?.artworkCount || 0 }}</span>
                      <span class="text-gray-500"> artworks</span>
                    </span>
                    <span>
                      <span class="font-semibold text-gray-900">{{ stats?.followerCount || 0 }}</span>
                      <span class="text-gray-500"> followers</span>
                    </span>
                    <span>
                      <span class="font-semibold text-gray-900">{{ stats?.viewCount || 0 }}</span>
                      <span class="text-gray-500"> views</span>
                    </span>
                  </div>
                </div>

                <button
                  class="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  :class="isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'"
                  :disabled="isFollowLoading"
                  @click="toggleFollow"
                >
                  {{ isFollowLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow') }}
                </button>
              </div>

              <p v-if="artist.bio" class="mt-4 text-gray-600">
                {{ artist.bio }}
              </p>

              <div v-if="artist.statement" class="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Artist Statement</h3>
                <p class="text-gray-600 text-sm">{{ artist.statement }}</p>
              </div>

              <div class="flex items-center gap-4 mt-4">
                <a
                  v-if="artist.website"
                  :href="artist.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
                <a
                  v-if="artist.instagram"
                  :href="`https://instagram.com/${artist.instagram}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  v-if="artist.twitter"
                  :href="`https://twitter.com/${artist.twitter}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  v-if="artist.facebook"
                  :href="`https://facebook.com/${artist.facebook}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Artworks</h2>
          <div class="bg-gray-100 rounded-xl p-12 text-center">
            <p class="text-gray-500">Artworks will be displayed here once the Artworks module is integrated.</p>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="showGuestFollowModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeGuestModal"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <template v-if="!guestFollowSuccess">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Follow {{ artist?.displayName }}</h3>
          <p class="text-gray-600 text-sm mb-4">
            Enter your email to follow this artist and receive updates about their new work.
          </p>

          <UiAlert v-if="guestFollowError" type="error" class="mb-4">
            {{ guestFollowError }}
          </UiAlert>

          <input
            v-model="guestEmail"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
          />

          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              @click="closeGuestModal"
            >
              Cancel
            </button>
            <button
              class="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              @click="handleGuestFollow"
            >
              Follow
            </button>
          </div>

          <p class="text-center text-sm text-gray-500 mt-4">
            Already have an account?
            <NuxtLink to="/auth/login" class="text-gray-900 font-medium hover:underline">
              Sign in
            </NuxtLink>
          </p>
        </template>

        <template v-else>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">You're now following!</h3>
            <p class="text-gray-600 text-sm mb-4">
              You'll receive updates when {{ artist?.displayName }} adds new work.
            </p>
            <button
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              @click="closeGuestModal"
            >
              Done
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>