<script setup lang="ts">
import type { Artist, ArtistStats } from '~/types/artist'
import { useArtistService } from '~/services/artist.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const artistService = useArtistService()

const artistId = computed(() => route.params.id as string)

const artist = ref<Artist | null>(null)
const stats = ref<ArtistStats | null>(null)
const followers = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')
const successMessage = ref('')

const followersPagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const isUpdating = ref(false)

async function fetchArtist() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await artistService.getArtists({ limit: 100 })
    artist.value = response.data.find(a => a.id === artistId.value) || null

    if (artist.value) {
      stats.value = await artistService.getArtistStats(artist.value.id)
      await fetchFollowers()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artist'
  } finally {
    isLoading.value = false
  }
}

async function fetchFollowers() {
  if (!artist.value) return

  try {
    const response = await artistService.getArtistFollowers(
      artist.value.id,
      followersPagination.page,
      followersPagination.limit
    ) as any
    followers.value = response.data || []
    followersPagination.total = response.total || 0
    followersPagination.totalPages = response.totalPages || 0
  } catch (e: any) {
    console.error('Failed to fetch followers:', e)
  }
}

async function toggleVerification() {
  if (!artist.value) return

  isUpdating.value = true
  error.value = ''

  try {
    if (artist.value.verified) {
      await artistService.unverifyArtist(artist.value.id)
      artist.value.verified = false
      successMessage.value = 'Artist verification removed'
    } else {
      await artistService.verifyArtist(artist.value.id)
      artist.value.verified = true
      successMessage.value = 'Artist verified successfully'
    }
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update verification'
  } finally {
    isUpdating.value = false
  }
}

async function toggleFeatured() {
  if (!artist.value) return

  isUpdating.value = true
  error.value = ''

  try {
    await artistService.setArtistFeatured(artist.value.id, !artist.value.featured)
    artist.value.featured = !artist.value.featured
    successMessage.value = artist.value.featured ? 'Artist featured' : 'Artist unfeatured'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update featured status'
  } finally {
    isUpdating.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin/artists')
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchArtist()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <button
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Artists
      </button>

      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <template v-else-if="artist">
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div class="h-32 bg-gradient-to-r from-primary-500 to-secondary-500">
            <img
              v-if="artist.coverImage"
              :src="artist.coverImage"
              :alt="artist.displayName"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="p-6 -mt-12">
            <div class="flex items-end justify-between">
              <div class="flex items-end gap-4">
                <div class="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img
                    v-if="artist.profileImage"
                    :src="artist.profileImage"
                    :alt="artist.displayName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <span class="text-2xl font-bold text-white">
                      {{ artist.displayName?.[0]?.toUpperCase() || 'A' }}
                    </span>
                  </div>
                </div>

                <div class="mb-2">
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold text-gray-900">{{ artist.displayName }}</h1>
                    <span
                      v-if="artist.verified"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Verified
                    </span>
                    <span
                      v-if="artist.featured"
                      class="inline-flex px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full"
                    >
                      Featured
                    </span>
                  </div>
                  <p class="text-gray-500">@{{ artist.slug }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                  :class="artist.verified
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                  :disabled="isUpdating"
                  @click="toggleVerification"
                >
                  {{ artist.verified ? 'Remove Verification' : 'Verify Artist' }}
                </button>
                <button
                  class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                  :class="artist.featured
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                  :disabled="isUpdating"
                  @click="toggleFeatured"
                >
                  {{ artist.featured ? 'Unfeature' : 'Feature Artist' }}
                </button>
                <NuxtLink
                  :to="`/artists/${artist.slug}`"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Public Profile
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.artworkCount || artist.artworkCount || 0 }}</p>
                <p class="text-sm text-gray-500">Artworks</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.followerCount || artist.followerCount || 0 }}</p>
                <p class="text-sm text-gray-500">Followers</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats?.viewCount || 0 }}</p>
                <p class="text-sm text-gray-500">Profile Views</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Artist Information</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">Artist ID</dt>
                <dd class="text-gray-900 font-mono text-sm">{{ artist.id }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Display Name</dt>
                <dd class="text-gray-900">{{ artist.displayName }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Slug</dt>
                <dd class="text-gray-900">{{ artist.slug }}</dd>
              </div>
              <div v-if="artist.location">
                <dt class="text-sm text-gray-500">Location</dt>
                <dd class="text-gray-900">{{ artist.location }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Joined</dt>
                <dd class="text-gray-900">{{ formatDate(artist.createdAt) }}</dd>
              </div>
            </dl>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Bio & Statement</h2>
            <div class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500 mb-1">Bio</dt>
                <dd class="text-gray-900">{{ artist.bio || '—' }}</dd>
              </div>
              <div v-if="artist.statement">
                <dt class="text-sm text-gray-500 mb-1">Artist Statement</dt>
                <dd class="text-gray-900 whitespace-pre-line">{{ artist.statement }}</dd>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">Website</dt>
                <dd>
                  <a v-if="artist.website" :href="artist.website" class="text-primary-600 hover:underline">
                    {{ artist.website }}
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Instagram</dt>
                <dd>
                  <a v-if="artist.instagram" :href="`https://instagram.com/${artist.instagram}`" class="text-primary-600 hover:underline">
                    @{{ artist.instagram }}
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Twitter</dt>
                <dd>
                  <a v-if="artist.twitter" :href="`https://twitter.com/${artist.twitter}`" class="text-primary-600 hover:underline">
                    @{{ artist.twitter }}
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Facebook</dt>
                <dd>
                  <a v-if="artist.facebook" :href="`https://facebook.com/${artist.facebook}`" class="text-primary-600 hover:underline">
                    {{ artist.facebook }}
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Sales & Performance</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">Total Sales</dt>
                <dd class="text-gray-900 text-xl font-bold">{{ stats?.totalSales || 0 }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Total Revenue</dt>
                <dd class="text-gray-900 text-xl font-bold">
                  ${{ (stats?.totalRevenue || 0).toLocaleString() }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Average Artwork Price</dt>
                <dd class="text-gray-900">
                  ${{ (stats?.averagePrice || 0).toLocaleString() }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Followers</h2>
            <span class="text-sm text-gray-500">{{ followersPagination.total }} total</span>
          </div>

          <div v-if="followers.length > 0" class="space-y-3">
            <div
              v-for="follower in followers"
              :key="follower.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ (follower.email?.[0] || '?').toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ follower.name || follower.email }}</p>
                  <p class="text-sm text-gray-500">{{ follower.email }}</p>
                </div>
              </div>
              <span class="text-xs text-gray-400">
                {{ follower.followedAt ? formatDate(follower.followedAt) : '' }}
              </span>
            </div>

            <div v-if="followersPagination.totalPages > 1" class="flex items-center justify-between pt-4 border-t">
              <button
                class="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
                :disabled="followersPagination.page === 1"
                @click="followersPagination.page--; fetchFollowers()"
              >
                Previous
              </button>
              <span class="text-sm text-gray-500">
                Page {{ followersPagination.page }} of {{ followersPagination.totalPages }}
              </span>
              <button
                class="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
                :disabled="followersPagination.page === followersPagination.totalPages"
                @click="followersPagination.page++; fetchFollowers()"
              >
                Next
              </button>
            </div>
          </div>

          <p v-else class="text-gray-500 text-center py-8">
            No followers yet
          </p>
        </div>
      </template>

      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900">Artist not found</h2>
        <p class="text-gray-600 mt-2">The artist you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/admin/artists"
          class="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Artists
        </NuxtLink>
      </div>
    </div>
  </div>
</template>