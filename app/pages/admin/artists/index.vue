<script setup lang="ts">
import type { Artist, ArtistListParams } from '~/types/artist'
import { useArtistService } from '~/services/artist.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const router = useRouter()
const artistService = useArtistService()

function viewArtist(artistId: string) {
  router.push(`/admin/artists/${artistId}`)
}

const artists = ref<Artist[]>([])
const isLoading = ref(true)
const error = ref('')

const filters = reactive<ArtistListParams>({
  page: 1,
  limit: 20,
  verified: undefined,
  featured: undefined,
  search: '',
})

const pagination = reactive({
  total: 0,
  totalPages: 0,
})

async function fetchArtists() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await artistService.getArtists(filters)
    artists.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load artists'
  } finally {
    isLoading.value = false
  }
}

async function toggleVerification(artist: Artist) {
  try {
    if (artist.verified) {
      await artistService.unverifyArtist(artist.id)
      artist.verified = false
    } else {
      await artistService.verifyArtist(artist.id)
      artist.verified = true
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update verification'
  }
}

async function toggleFeatured(artist: Artist) {
  try {
    await artistService.setArtistFeatured(artist.id, !artist.featured)
    artist.featured = !artist.featured
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update featured status'
  }
}

function handleSearch() {
  filters.page = 1
  fetchArtists()
}

onMounted(() => {
  fetchArtists()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Artist Management</h1>
        <p class="text-gray-600 mt-1">Verify and manage artist profiles</p>
      </div>

      <!-- Error -->
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px]">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search artists..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              @keyup.enter="handleSearch"
            />
          </div>
          <select
            v-model="filters.verified"
            class="px-4 py-2 border border-gray-200 rounded-lg"
            @change="handleSearch"
          >
            <option :value="undefined">All Status</option>
            <option :value="true">Verified</option>
            <option :value="false">Unverified</option>
          </select>
          <select
            v-model="filters.featured"
            class="px-4 py-2 border border-gray-200 rounded-lg"
            @change="handleSearch"
          >
            <option :value="undefined">All Artists</option>
            <option :value="true">Featured</option>
            <option :value="false">Not Featured</option>
          </select>
          <button
            class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            @click="handleSearch"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Artist</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="artist in artists" :key="artist.id" class="hover:bg-gray-50 cursor-pointer" @click="viewArtist(artist.id)">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      v-if="artist.profileImage"
                      :src="artist.profileImage"
                      :alt="artist.displayName"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-400">
                        {{ artist.displayName[0].toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <NuxtLink
                      :to="`/artists/${artist.slug}`"
                      class="font-medium text-gray-900 hover:underline"
                    >
                      {{ artist.displayName }}
                    </NuxtLink>
                    <p class="text-sm text-gray-500">@{{ artist.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm">
                  <span class="text-gray-900 font-medium">{{ artist.artworkCount }}</span>
                  <span class="text-gray-500"> artworks</span>
                  <span class="text-gray-300 mx-2">|</span>
                  <span class="text-gray-900 font-medium">{{ artist.followerCount }}</span>
                  <span class="text-gray-500"> followers</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span
                    v-if="artist.verified"
                    class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                  >
                    Verified
                  </span>
                  <span
                    v-if="artist.featured"
                    class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full"
                  >
                    Featured
                  </span>
                  <span
                    v-if="!artist.verified && !artist.featured"
                    class="text-gray-400 text-sm"
                  >
                    —
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ new Date(artist.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View details"
                    @click.stop="viewArtist(artist.id)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    class="px-3 py-1 text-sm rounded-lg border transition-colors"
                    :class="artist.verified
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                    @click.stop="toggleVerification(artist)"
                  >
                    {{ artist.verified ? 'Unverify' : 'Verify' }}
                  </button>
                  <button
                    class="px-3 py-1 text-sm rounded-lg border transition-colors"
                    :class="artist.featured
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                    @click.stop="toggleFeatured(artist)"
                  >
                    {{ artist.featured ? 'Unfeature' : 'Feature' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="artists.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No artists found
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Showing {{ (filters.page! - 1) * filters.limit! + 1 }} to
            {{ Math.min(filters.page! * filters.limit!, pagination.total) }} of
            {{ pagination.total }} artists
          </p>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="filters.page === 1"
              @click="filters.page!--; fetchArtists()"
            >
              Previous
            </button>
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="filters.page === pagination.totalPages"
              @click="filters.page!++; fetchArtists()"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>