<script setup lang="ts">
import { useEventsStore, EVENT_TYPE_LABELS } from '~/stores/events'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'

const route = useRoute()
const eventsStore = useEventsStore()
const authStore = useAuthStore()

const slug = computed(() => route.params.slug as string)

const isLoading = ref(true)
const error = ref('')
const showRegistrationForm = ref(false)
const registrationLoading = ref(false)
const registrationSuccess = ref(false)
const registrationError = ref('')

const registrationForm = reactive({
  email: '',
  firstName: '',
  lastName: '',
})

async function fetchEvent() {
  isLoading.value = true
  error.value = ''

  const result = await eventsStore.fetchEventBySlug(slug.value)

  if (!result.success) {
    error.value = result.error || 'Failed to load event'
  }

  isLoading.value = false
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function getEventStatus() {
  const event = eventsStore.currentEvent
  if (!event) return null

  if (event.status === 'CANCELLED') return { label: 'Cancelled', class: 'bg-red-100 text-red-700', icon: 'x' }
  if (event.status === 'LIVE') return { label: 'Live Now', class: 'bg-green-500 text-white animate-pulse', icon: 'play' }
  if (event.status === 'ENDED') return { label: 'Event Ended', class: 'bg-bark-100 text-bark-600', icon: 'check' }
  return { label: 'Upcoming', class: 'bg-primary-100 text-primary-700', icon: 'calendar' }
}

function isRegistrationOpen(): boolean {
  const event = eventsStore.currentEvent
  if (!event) return false
  if (event.status !== 'SCHEDULED') return false
  if (event.maxAttendees && event.registrationCount >= event.maxAttendees) return false
  return true
}

function isSoldOut(): boolean {
  const event = eventsStore.currentEvent
  if (!event) return false
  return !!event.maxAttendees && event.registrationCount >= event.maxAttendees
}

function openRegistrationForm() {
  if (authStore.isAuthenticated && authStore.user) {
    registrationForm.email = authStore.user.email
    registrationForm.firstName = authStore.user.profile?.firstName || ''
    registrationForm.lastName = authStore.user.profile?.lastName || ''
  }
  showRegistrationForm.value = true
}

async function handleRegister() {
  if (!eventsStore.currentEvent) return

  registrationLoading.value = true
  registrationError.value = ''

  const result = await eventsStore.registerForEvent(eventsStore.currentEvent.id, {
    email: registrationForm.email,
    firstName: registrationForm.firstName,
    lastName: registrationForm.lastName,
  })

  if (result.success) {
    registrationSuccess.value = true
    showRegistrationForm.value = false
  } else {
    registrationError.value = result.error || 'Failed to register'
  }

  registrationLoading.value = false
}

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(`Join me at: ${eventsStore.currentEvent?.title}`)
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
}

function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

function addToCalendar() {
  const event = eventsStore.currentEvent
  if (!event) return

  const startDate = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
  const endDate = event.endDate
    ? new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
    : new Date(new Date(event.startDate).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '')

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || '')}&location=${event.isVirtual ? 'Virtual Event' : ''}`

  window.open(calendarUrl, '_blank')
}

onMounted(() => {
  fetchEvent()
  eventsStore.fetchUpcomingEvents(3)
})

watch(slug, () => {
  fetchEvent()
})

onUnmounted(() => {
  eventsStore.clearCurrentEvent()
})

useHead(() => ({
  title: eventsStore.currentEvent?.title || 'Event',
  meta: [
    {
      name: 'description',
      content: eventsStore.currentEvent?.description || '',
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream">
    <div v-if="isLoading" class="max-w-4xl mx-auto py-16 px-4">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-earth-200 rounded w-3/4" />
        <div class="h-4 bg-earth-200 rounded w-1/2" />
        <div class="aspect-[21/9] bg-earth-200 rounded-2xl" />
        <div class="space-y-3">
          <div class="h-4 bg-earth-200 rounded w-full" />
          <div class="h-4 bg-earth-200 rounded w-full" />
          <div class="h-4 bg-earth-200 rounded w-2/3" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto py-16 px-4 text-center">
      <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Event Not Found</h1>
      <p class="text-bark-500 mb-6">{{ error }}</p>
      <NuxtLink
        to="/events"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Events
      </NuxtLink>
    </div>

    <article v-else-if="eventsStore.currentEvent" class="pb-16">
      <div class="relative">
        <div class="aspect-[21/9] max-h-[500px] overflow-hidden bg-gradient-warm">
          <img
            v-if="eventsStore.currentEvent.coverImage"
            :src="eventsStore.currentEvent.coverImage"
            :alt="eventsStore.currentEvent.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-bark-900/80 via-bark-900/40 to-transparent" />
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="max-w-4xl mx-auto">
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span
                v-if="getEventStatus()"
                class="px-4 py-1.5 text-sm font-semibold rounded-full"
                :class="getEventStatus()?.class"
              >
                {{ getEventStatus()?.label }}
              </span>
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                {{ EVENT_TYPE_LABELS[eventsStore.currentEvent.type] }}
              </span>
              <span v-if="eventsStore.currentEvent.isVirtual" class="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Virtual Event
              </span>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
              {{ eventsStore.currentEvent.title }}
            </h1>

            <div v-if="eventsStore.currentEvent.artist" class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/50">
                <img
                  v-if="eventsStore.currentEvent.artist.profileImage"
                  :src="eventsStore.currentEvent.artist.profileImage"
                  :alt="eventsStore.currentEvent.artist.displayName"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-lg font-bold text-primary-600">
                  {{ eventsStore.currentEvent.artist.displayName.charAt(0) }}
                </span>
              </div>
              <div>
                <p class="text-white/70 text-sm">Hosted by</p>
                <p class="text-white font-semibold">{{ eventsStore.currentEvent.artist.displayName }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1">
            <div class="bg-white rounded-2xl border border-earth-100 p-6 mb-6">
              <h2 class="font-semibold text-bark-800 mb-4">Date & Time</h2>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-bark-800">{{ formatDate(eventsStore.currentEvent.startDate) }}</p>
                    <p class="text-sm text-bark-500">{{ formatTime(eventsStore.currentEvent.startDate) }}</p>
                  </div>
                </div>

                <div v-if="eventsStore.currentEvent.endDate" class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-earth-100 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-bark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-bark-500">Ends</p>
                    <p class="font-medium text-bark-700">{{ formatTime(eventsStore.currentEvent.endDate) }}</p>
                  </div>
                </div>

                <button
                  class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border border-earth-200 text-bark-700 rounded-xl hover:bg-earth-50 transition-colors"
                  @click="addToCalendar"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Calendar
                </button>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-earth-100 p-6 mb-6">
              <h2 class="font-semibold text-bark-800 mb-4">About This Event</h2>
              <div class="prose prose-bark max-w-none">
                <p v-if="eventsStore.currentEvent.description" class="text-bark-600 whitespace-pre-line">
                  {{ eventsStore.currentEvent.description }}
                </p>
                <p v-else class="text-bark-500 italic">No description provided.</p>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-earth-100 p-6">
              <h2 class="font-semibold text-bark-800 mb-4">Share This Event</h2>
              <div class="flex gap-3">
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1DA1F2] text-white rounded-xl hover:opacity-90 transition-opacity"
                  @click="shareOnTwitter"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-xl hover:opacity-90 transition-opacity"
                  @click="shareOnFacebook"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>

          <div class="lg:w-80">
            <div class="bg-white rounded-2xl border border-earth-100 p-6 sticky top-24">
              <div class="text-center mb-6">
                <div class="text-3xl font-bold text-bark-800">
                  {{ eventsStore.currentEvent.registrationCount }}
                </div>
                <p class="text-bark-500">
                  {{ eventsStore.currentEvent.maxAttendees ? `of ${eventsStore.currentEvent.maxAttendees} spots` : 'registered' }}
                </p>

                <div v-if="eventsStore.currentEvent.maxAttendees" class="mt-3">
                  <div class="h-2 bg-earth-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-500 rounded-full transition-all"
                      :style="{ width: `${Math.min(100, (eventsStore.currentEvent.registrationCount / eventsStore.currentEvent.maxAttendees) * 100)}%` }"
                    />
                  </div>
                </div>
              </div>

              <div v-if="registrationSuccess" class="text-center py-6">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 class="font-semibold text-bark-800 mb-2">You're Registered!</h3>
                <p class="text-sm text-bark-500">A confirmation email has been sent to your inbox.</p>
              </div>

              <div v-else-if="showRegistrationForm" class="space-y-4">
                <h3 class="font-semibold text-bark-800">Register for Event</h3>

                <UiAlert v-if="registrationError" type="error" class="text-sm">
                  {{ registrationError }}
                </UiAlert>

                <div>
                  <label class="block text-sm font-medium text-bark-700 mb-1">Email *</label>
                  <input
                    v-model="registrationForm.email"
                    type="email"
                    required
                    class="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">First Name</label>
                    <input
                      v-model="registrationForm.firstName"
                      type="text"
                      class="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-bark-700 mb-1">Last Name</label>
                    <input
                      v-model="registrationForm.lastName"
                      type="text"
                      class="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div class="flex gap-3">
                  <button
                    class="flex-1 px-4 py-2.5 border border-earth-200 text-bark-700 rounded-xl hover:bg-earth-50 transition-colors"
                    @click="showRegistrationForm = false"
                  >
                    Cancel
                  </button>
                  <button
                    class="flex-1 px-4 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
                    :disabled="registrationLoading || !registrationForm.email"
                    @click="handleRegister"
                  >
                    {{ registrationLoading ? 'Registering...' : 'Register' }}
                  </button>
                </div>
              </div>

              <div v-else>
                <button
                  v-if="isRegistrationOpen()"
                  class="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                  @click="openRegistrationForm"
                >
                  Register Now
                </button>
                <button
                  v-else-if="isSoldOut()"
                  class="w-full py-3.5 bg-bark-200 text-bark-600 font-semibold rounded-xl cursor-not-allowed"
                  disabled
                >
                  Sold Out
                </button>
                <button
                  v-else-if="eventsStore.currentEvent.status === 'LIVE'"
                  class="w-full py-3.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  Join Live Event
                </button>
                <button
                  v-else
                  class="w-full py-3.5 bg-bark-200 text-bark-600 font-semibold rounded-xl cursor-not-allowed"
                  disabled
                >
                  Registration Closed
                </button>

                <p class="text-center text-xs text-bark-500 mt-3">
                  Free to attend
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <NuxtLink
            to="/events"
            class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </NuxtLink>
        </div>
      </div>

      <section v-if="eventsStore.upcomingEvents.length > 0" class="bg-white py-16 border-t border-earth-100">
        <div class="max-w-7xl mx-auto px-4">
          <h2 class="text-2xl font-display font-bold text-bark-800 mb-8">More Upcoming Events</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink
              v-for="event in eventsStore.upcomingEvents.filter(e => e.slug !== slug).slice(0, 3)"
              :key="event.id"
              :to="`/events/${event.slug}`"
              class="group bg-earth-50 rounded-2xl overflow-hidden hover:shadow-warm-lg transition-all duration-300"
            >
              <div class="aspect-[16/9] bg-earth-100 overflow-hidden">
                <img
                  v-if="event.coverImage"
                  :src="event.coverImage"
                  :alt="event.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div class="p-5">
                <span class="text-xs font-medium text-primary-600 uppercase">
                  {{ EVENT_TYPE_LABELS[event.type] }}
                </span>
                <h3 class="font-semibold text-bark-800 group-hover:text-primary-600 transition-colors mt-2 line-clamp-2">
                  {{ event.title }}
                </h3>
                <p class="text-sm text-bark-500 mt-2">
                  {{ formatDate(event.startDate) }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>
