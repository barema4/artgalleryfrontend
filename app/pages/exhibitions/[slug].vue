<script setup lang="ts">
import { ExhibitionStatus, ExhibitionType } from '~/types/exhibition'
import { useExhibitionsStore } from '~/stores/exhibitions'

const route = useRoute()
const router = useRouter()
const exhibitionsStore = useExhibitionsStore()

const slug = computed(() => route.params.slug as string)
const exhibition = computed(() => exhibitionsStore.currentExhibition)
const stats = computed(() => exhibitionsStore.currentStats)

const showVirtualTour = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/exhibitions')
  }
}

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case ExhibitionStatus.LIVE:
      return 'bg-green-100 text-green-800'
    case ExhibitionStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-800'
    case ExhibitionStatus.ENDED:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case ExhibitionStatus.LIVE:
      return 'Live Now'
    case ExhibitionStatus.SCHEDULED:
      return 'Upcoming'
    case ExhibitionStatus.ENDED:
      return 'Ended'
    default:
      return status
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case ExhibitionType.VIRTUAL_TOUR:
      return 'Virtual Tour'
    case ExhibitionType.GALLERY:
      return 'Gallery Exhibition'
    case ExhibitionType.FEATURED:
      return 'Featured Exhibition'
    case ExhibitionType.POPUP:
      return 'Pop-up Exhibition'
    default:
      return type
  }
}

onMounted(async () => {
  await exhibitionsStore.fetchExhibitionBySlug(slug.value)
  if (exhibition.value) {
    await exhibitionsStore.fetchExhibitionStats(exhibition.value.id)
  }
})

onUnmounted(() => {
  exhibitionsStore.clearCurrentExhibition()
})

useHead(() => ({
  title: exhibition.value?.title ? `${exhibition.value.title} | Exhibitions` : 'Exhibition | ArtGallery',
  meta: [
    { name: 'description', content: exhibition.value?.shortDescription || exhibition.value?.description || 'View exhibition details' },
  ],
}))
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Back Button -->
      <button
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Exhibitions
      </button>

      <!-- Loading State -->
      <div v-if="exhibitionsStore.loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="exhibitionsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800">{{ exhibitionsStore.error }}</p>
        <button
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          @click="router.push('/exhibitions')"
        >
          Back to Exhibitions
        </button>
      </div>

      <!-- Exhibition Content -->
      <div v-else-if="exhibition">
        <!-- Hero Section -->
        <div class="mb-8">
          <div class="aspect-[21/9] bg-gray-200 rounded-2xl overflow-hidden mb-6">
            <img
              v-if="exhibition.coverImage"
              :src="exhibition.coverImage"
              :alt="exhibition.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span
              class="px-4 py-2 rounded-full text-sm font-semibold"
              :class="getStatusBadgeClass(exhibition.status)"
            >
              {{ getStatusLabel(exhibition.status) }}
            </span>
            <span class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {{ getTypeLabel(exhibition.type) }}
            </span>
            <span v-if="exhibition.featured" class="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
              Featured
            </span>
          </div>

          <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{{ exhibition.title }}</h1>

          <div v-if="exhibition.startDate || exhibition.endDate" class="flex items-center gap-2 text-gray-600 text-lg mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span v-if="exhibition.startDate">{{ formatDate(exhibition.startDate) }}</span>
            <span v-if="exhibition.startDate && exhibition.endDate"> - </span>
            <span v-if="exhibition.endDate">{{ formatDate(exhibition.endDate) }}</span>
          </div>

          <p v-if="exhibition.shortDescription" class="text-xl text-gray-600 mb-6">
            {{ exhibition.shortDescription }}
          </p>

          <!-- Stats -->
          <div class="flex flex-wrap gap-6 text-gray-600">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ stats?.artworkCount || exhibition.artworkCount }} Artworks</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ stats?.artistCount || exhibition.artistCount }} Artists</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{{ stats?.viewCount || exhibition.viewCount }} Views</span>
            </div>
            <div v-if="stats?.commentCount || exhibition.commentCount" class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{{ stats?.commentCount || exhibition.commentCount }} Comments</span>
            </div>
          </div>
        </div>

        <!-- Virtual Tour Button -->
        <div v-if="exhibition.virtualTour && exhibition.type === ExhibitionType.VIRTUAL_TOUR" class="mb-8">
          <button
            class="w-full lg:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-3"
            @click="showVirtualTour = !showVirtualTour"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            {{ showVirtualTour ? 'Close Virtual Tour' : 'Launch Virtual Tour' }}
          </button>
        </div>

        <!-- Virtual Tour Viewer -->
        <div v-if="showVirtualTour && exhibition.virtualTour" class="mb-8 bg-gray-900 rounded-xl p-4 lg:p-8">
          <div class="bg-gray-800 rounded-lg p-8 text-center text-white">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <h3 class="text-2xl font-bold mb-2">Virtual Tour</h3>
            <p class="text-gray-400 mb-4">{{ exhibition.virtualTour.rooms.length }} rooms available</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div
                v-for="room in exhibition.virtualTour.rooms"
                :key="room.id"
                class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <h4 class="font-semibold mb-2">{{ room.name }}</h4>
                <p v-if="room.panoramaUrl" class="text-sm text-gray-400">360° View Available</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="exhibition.description" class="mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">About This Exhibition</h2>
          <div class="prose prose-lg max-w-none text-gray-700">
            <p class="whitespace-pre-line">{{ exhibition.description }}</p>
          </div>
        </div>

        <!-- Featured Artists -->
        <div v-if="exhibition.artists && exhibition.artists.length > 0" class="mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Featured Artists</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="artist in exhibition.artists"
              :key="artist.id"
              :to="`/artists/${artist.slug}`"
              class="group bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    v-if="artist.profileImage"
                    :src="artist.profileImage"
                    :alt="artist.displayName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {{ artist.displayName }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="artist.verified" class="inline-flex items-center gap-1 text-sm text-blue-600">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Verified
                    </span>
                    <span v-if="artist.isCurator" class="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      Curator
                    </span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Featured Artworks -->
        <div v-if="exhibition.artworks && exhibition.artworks.length > 0" class="mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Featured Artworks</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="artwork in exhibition.artworks"
              :key="artwork.id"
              :to="`/artworks/${artwork.slug}`"
              class="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div class="aspect-square bg-gray-200 overflow-hidden">
                <img
                  v-if="artwork.primaryImage"
                  :src="artwork.primaryImage"
                  :alt="artwork.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {{ artwork.title }}
                </h3>
                <p v-if="artwork.artist" class="text-sm text-gray-600">
                  by {{ artwork.artist.displayName }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Comments Section -->
        <section class="mt-12 pt-12 border-t border-gray-200">
          <UiCommentSection
            target-type="exhibition"
            :target-id="exhibition.id"
          />
        </section>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!exhibitionsStore.loading" class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Exhibition not found</h2>
        <p class="text-gray-600 mb-6">The exhibition you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/exhibitions"
          class="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse All Exhibitions
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
