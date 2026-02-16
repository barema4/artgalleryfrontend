<script setup lang="ts">
import type { EventListParams, EventType } from '~/types/event'
import { useEventsStore, EVENT_TYPE_LABELS } from '~/stores/events'

const eventsStore = useEventsStore()

const filters = reactive<EventListParams>({
  page: 1,
  limit: 9,
  type: undefined,
  upcoming: true,
  sortBy: 'startDate',
})

const typeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value: value as EventType,
  label,
}))

const sortOptions = [
  { value: 'startDate', label: 'Date' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
]

const viewOptions = [
  { value: true, label: 'Upcoming' },
  { value: false, label: 'Past Events' },
]

async function fetchEvents() {
  await eventsStore.fetchEvents(filters)
}

function handleFilterChange() {
  filters.page = 1
  fetchEvents()
}

function handlePageChange(page: number) {
  filters.page = page
  fetchEvents()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearFilters() {
  filters.type = undefined
  filters.upcoming = true
  filters.sortBy = 'startDate'
  filters.page = 1
  fetchEvents()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getEventStatus(event: typeof eventsStore.events[0]) {
  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null

  if (event.status === 'CANCELLED') return { label: 'Cancelled', class: 'bg-red-100 text-red-700' }
  if (event.status === 'LIVE') return { label: 'Live Now', class: 'bg-green-100 text-green-700 animate-pulse' }
  if (event.status === 'ENDED') return { label: 'Ended', class: 'bg-bark-100 text-bark-600' }
  if (startDate > now) return { label: 'Upcoming', class: 'bg-primary-100 text-primary-700' }
  return { label: 'Scheduled', class: 'bg-blue-100 text-blue-700' }
}

function isRegistrationOpen(event: typeof eventsStore.events[0]): boolean {
  if (event.status !== 'SCHEDULED') return false
  if (event.maxAttendees && event.registrationCount >= event.maxAttendees) return false
  return true
}

onMounted(() => {
  fetchEvents()
  eventsStore.fetchFeaturedEvents(3)
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-display font-bold text-bark-800 mb-4">Events & Exhibitions</h1>
        <p class="text-lg text-bark-500 max-w-2xl mx-auto">
          Join live artist talks, workshops, auctions, and more
        </p>
      </div>

      <section v-if="eventsStore.featuredEvents.length > 0" class="mb-12">
        <h2 class="text-xl font-semibold text-bark-800 mb-6">Featured Events</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="event in eventsStore.featuredEvents"
            :key="event.id"
            :to="`/events/${event.slug}`"
            class="group relative bg-white rounded-2xl border border-earth-100 overflow-hidden hover:shadow-warm-lg transition-all duration-300"
          >
            <div class="aspect-[16/9] bg-gradient-warm relative overflow-hidden">
              <img
                v-if="event.coverImage"
                :src="event.coverImage"
                :alt="event.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-bark-900/60 to-transparent" />

              <div class="absolute top-3 left-3">
                <span
                  class="px-3 py-1 text-xs font-semibold rounded-full"
                  :class="getEventStatus(event).class"
                >
                  {{ getEventStatus(event).label }}
                </span>
              </div>

              <div class="absolute top-3 right-3">
                <span class="px-3 py-1 bg-kente-gold text-white text-xs font-semibold rounded-full">
                  Featured
                </span>
              </div>

              <div class="absolute bottom-0 left-0 right-0 p-4">
                <span class="text-xs text-white/80 font-medium">
                  {{ EVENT_TYPE_LABELS[event.type] }}
                </span>
                <h3 class="text-lg font-semibold text-white mt-1 line-clamp-2">
                  {{ event.title }}
                </h3>
              </div>
            </div>

            <div class="p-4">
              <div class="flex items-center gap-4 text-sm text-bark-600">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(event.startDate) }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatTime(event.startDate) }}
                </span>
              </div>

              <div v-if="event.artist" class="flex items-center gap-2 mt-3 pt-3 border-t border-earth-100">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    v-if="event.artist.profileImage"
                    :src="event.artist.profileImage"
                    :alt="event.artist.displayName"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-sm font-medium text-primary-600">
                    {{ event.artist.displayName.charAt(0) }}
                  </span>
                </div>
                <span class="text-sm text-bark-600">{{ event.artist.displayName }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <div class="bg-white rounded-2xl border border-earth-100 p-4 mb-8">
        <div class="flex flex-wrap items-end gap-4">
          <div class="w-40">
            <label class="block text-sm font-medium text-bark-700 mb-1">View</label>
            <select
              v-model="filters.upcoming"
              class="w-full px-4 py-2.5 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              @change="handleFilterChange"
            >
              <option v-for="option in viewOptions" :key="String(option.value)" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="w-48">
            <label class="block text-sm font-medium text-bark-700 mb-1">Event Type</label>
            <select
              v-model="filters.type"
              class="w-full px-4 py-2.5 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              @change="handleFilterChange"
            >
              <option :value="undefined">All Types</option>
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="w-40">
            <label class="block text-sm font-medium text-bark-700 mb-1">Sort By</label>
            <select
              v-model="filters.sortBy"
              class="w-full px-4 py-2.5 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              @change="handleFilterChange"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <button
            class="px-4 py-2.5 text-bark-500 hover:text-primary-600 font-medium transition-colors"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div v-if="eventsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
          <div class="aspect-[16/9] bg-earth-100 animate-pulse" />
          <div class="p-5 space-y-3">
            <div class="h-4 bg-earth-100 rounded animate-pulse w-1/4" />
            <div class="h-6 bg-earth-100 rounded animate-pulse w-3/4" />
            <div class="h-4 bg-earth-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>

      <UiAlert v-else-if="eventsStore.error" type="error" class="mb-6" dismissible @dismiss="eventsStore.clearError()">
        {{ eventsStore.error }}
      </UiAlert>

      <div v-else-if="eventsStore.events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="event in eventsStore.events"
          :key="event.id"
          :to="`/events/${event.slug}`"
          class="group bg-white rounded-2xl border border-earth-100 overflow-hidden hover:shadow-warm-lg hover:border-earth-200 transition-all duration-300"
        >
          <div class="aspect-[16/9] bg-earth-100 relative overflow-hidden">
            <img
              v-if="event.coverImage"
              :src="event.coverImage"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-warm">
              <svg class="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div class="absolute top-3 left-3">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="getEventStatus(event).class"
              >
                {{ getEventStatus(event).label }}
              </span>
            </div>

            <div v-if="event.isVirtual" class="absolute top-3 right-3">
              <span class="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Virtual
              </span>
            </div>
          </div>

          <div class="p-5">
            <span class="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {{ EVENT_TYPE_LABELS[event.type] }}
            </span>

            <h3 class="font-semibold text-lg text-bark-800 group-hover:text-primary-600 transition-colors mt-2 line-clamp-2">
              {{ event.title }}
            </h3>

            <p v-if="event.description" class="text-sm text-bark-500 mt-2 line-clamp-2">
              {{ event.description }}
            </p>

            <div class="flex items-center gap-4 mt-4 text-sm text-bark-600">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(event.startDate) }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(event.startDate) }}
              </span>
            </div>

            <div class="flex items-center justify-between mt-4 pt-4 border-t border-earth-100">
              <div v-if="event.artist" class="flex items-center gap-2">
                <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    v-if="event.artist.profileImage"
                    :src="event.artist.profileImage"
                    :alt="event.artist.displayName"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-xs font-medium text-primary-600">
                    {{ event.artist.displayName.charAt(0) }}
                  </span>
                </div>
                <span class="text-sm text-bark-600 truncate max-w-[100px]">{{ event.artist.displayName }}</span>
              </div>
              <div v-else />

              <div class="text-sm">
                <span v-if="isRegistrationOpen(event)" class="text-green-600 font-medium">
                  {{ event.maxAttendees ? `${event.maxAttendees - event.registrationCount} spots left` : 'Open' }}
                </span>
                <span v-else-if="event.maxAttendees && event.registrationCount >= event.maxAttendees" class="text-kente-red font-medium">
                  Sold Out
                </span>
                <span v-else class="text-bark-500">
                  {{ event.registrationCount }} registered
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="bg-white rounded-2xl border border-earth-100 py-16 text-center">
        <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-bark-700">No events found</h3>
        <p class="text-bark-500 mt-1">
          {{ filters.upcoming ? 'Check back soon for upcoming events' : 'No past events to display' }}
        </p>
      </div>

      <div v-if="eventsStore.pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button
          class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="filters.page === 1"
          @click="handlePageChange((filters.page || 1) - 1)"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex items-center gap-1">
          <button
            v-for="page in eventsStore.pagination.totalPages"
            :key="page"
            class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
            :class="page === filters.page
              ? 'bg-primary-500 text-white'
              : 'text-bark-600 hover:bg-earth-100'"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="filters.page === eventsStore.pagination.totalPages"
          @click="handlePageChange((filters.page || 1) + 1)"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
