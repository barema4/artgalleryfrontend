<script setup lang="ts">
import type { Event, EventType, EventStatus, CreateEventData, UpdateEventData, Registration } from '~/types/event'
import { useEventService } from '~/services/event.service'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const eventService = useEventService()

const isNew = computed(() => route.params.id === 'new')
const eventId = computed(() => route.params.id as string)

interface EventFormData {
  title: string
  description: string
  type: EventType
  coverImage: string
  startDate: string
  endDate: string
  timezone: string
  isVirtual: boolean
  streamUrl: string
  maxAttendees: number | undefined
  artistId: string
  featured: boolean
}

const form = ref<EventFormData>({
  title: '',
  description: '',
  type: 'ARTIST_TALK',
  coverImage: '',
  startDate: '',
  endDate: '',
  timezone: 'UTC',
  isVirtual: true,
  streamUrl: '',
  maxAttendees: undefined,
  artistId: '',
  featured: false,
})

const currentEvent = ref<Event | null>(null)
const registrations = ref<Registration[]>([])

const loading = ref(false)
const error = ref('')
const success = ref(false)

// Delete confirmation
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Registrations
const showRegistrations = ref(false)
const loadingRegistrations = ref(false)
const registrationPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const eventTypes: { value: EventType; label: string; description: string }[] = [
  { value: 'ARTIST_TALK', label: 'Artist Talk', description: 'Live discussion with an artist' },
  { value: 'LIVE_CREATION', label: 'Live Creation', description: 'Watch art being created in real-time' },
  { value: 'QA_SESSION', label: 'Q&A Session', description: 'Interactive question and answer session' },
  { value: 'AUCTION', label: 'Auction', description: 'Live art auction event' },
  { value: 'WORKSHOP', label: 'Workshop', description: 'Hands-on learning experience' },
]

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

async function loadEvent() {
  if (isNew.value) return

  loading.value = true
  error.value = ''

  try {
    const event = await eventService.getEventById(eventId.value)
    currentEvent.value = event
    form.value = {
      title: event.title,
      description: event.description || '',
      type: event.type,
      coverImage: event.coverImage || '',
      startDate: formatDateTimeForInput(event.startDate),
      endDate: event.endDate ? formatDateTimeForInput(event.endDate) : '',
      timezone: event.timezone,
      isVirtual: event.isVirtual,
      streamUrl: event.streamUrl || '',
      maxAttendees: event.maxAttendees,
      artistId: event.artistId || '',
      featured: event.featured,
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load event'
  } finally {
    loading.value = false
  }
}

function formatDateTimeForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const data = {
      title: form.value.title,
      description: form.value.description || undefined,
      type: form.value.type,
      coverImage: form.value.coverImage || undefined,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
      timezone: form.value.timezone,
      isVirtual: form.value.isVirtual,
      streamUrl: form.value.streamUrl || undefined,
      maxAttendees: form.value.maxAttendees || undefined,
      artistId: form.value.artistId || undefined,
      featured: form.value.featured,
    }

    if (isNew.value) {
      await eventService.createEvent(data as CreateEventData)
    } else {
      await eventService.updateEvent(eventId.value, data as UpdateEventData)
    }
    success.value = true
    setTimeout(() => {
      router.push('/admin/events')
    }, 1500)
  } catch (e: any) {
    error.value = e?.data?.message || `Failed to ${isNew.value ? 'create' : 'update'} event`
  } finally {
    loading.value = false
  }
}

async function startEvent() {
  if (!confirm('Are you sure you want to start this event?')) return

  loading.value = true
  try {
    await eventService.startEvent(eventId.value)
    await loadEvent()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to start event'
  } finally {
    loading.value = false
  }
}

async function endEvent() {
  if (!confirm('Are you sure you want to end this event?')) return

  loading.value = true
  try {
    await eventService.endEvent(eventId.value)
    await loadEvent()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to end event'
  } finally {
    loading.value = false
  }
}

async function cancelEvent() {
  if (!confirm('Are you sure you want to cancel this event? This cannot be undone.')) return

  loading.value = true
  try {
    await eventService.cancelEvent(eventId.value)
    await loadEvent()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to cancel event'
  } finally {
    loading.value = false
  }
}

async function deleteEvent() {
  isDeleting.value = true
  try {
    await eventService.deleteEvent(eventId.value)
    router.push('/admin/events')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete event'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

async function loadRegistrations() {
  loadingRegistrations.value = true
  try {
    const response = await eventService.getEventRegistrations(eventId.value, {
      page: registrationPagination.value.page,
      limit: registrationPagination.value.limit,
    })
    registrations.value = response.data
    registrationPagination.value = {
      ...registrationPagination.value,
      total: response.total,
      totalPages: response.totalPages,
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load registrations'
  } finally {
    loadingRegistrations.value = false
  }
}

async function toggleAttendance(registration: Registration) {
  try {
    await eventService.markAttendance(registration.id, !registration.attended)
    await loadRegistrations()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update attendance'
  }
}

async function exportRegistrations() {
  try {
    const data = await eventService.exportRegistrations(eventId.value)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${currentEvent.value?.slug || eventId.value}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to export registrations'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: EventStatus) {
  const colors: Record<EventStatus, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    LIVE: 'bg-green-100 text-green-800',
    ENDED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

onMounted(() => {
  loadEvent()
})

watch(showRegistrations, (show) => {
  if (show && !isNew.value) {
    loadRegistrations()
  }
})

useHead({
  title: isNew.value ? 'Create Event | Admin' : 'Edit Event | Admin',
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink
        to="/admin/events"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </NuxtLink>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isNew ? 'Create New Event' : 'Edit Event' }}
          </h1>
          <span
            v-if="currentEvent"
            class="px-3 py-1 text-sm font-medium rounded-full"
            :class="getStatusColor(currentEvent.status)"
          >
            {{ currentEvent.status }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!isNew"
            class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            @click="showRegistrations = !showRegistrations"
          >
            {{ showRegistrations ? 'Edit Details' : 'View Registrations' }}
            <span v-if="currentEvent" class="ml-1 text-sm text-gray-500">
              ({{ currentEvent.registrationCount }})
            </span>
          </button>
          <button
            v-if="!isNew"
            class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800">
        Event {{ isNew ? 'created' : 'updated' }} successfully! Redirecting...
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !form.title && !isNew" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Registrations View -->
    <div v-else-if="showRegistrations" class="bg-white rounded-lg border border-gray-200">
      <div class="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Registrations</h2>
        <button
          class="px-4 py-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-200 rounded-lg hover:bg-primary-50"
          @click="exportRegistrations"
        >
          Export JSON
        </button>
      </div>

      <div v-if="loadingRegistrations" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="registrations.length > 0">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Registered</th>
              <th class="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Attended</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="reg in registrations" :key="reg.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ reg.firstName || '-' }} {{ reg.lastName || '' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ reg.email }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(reg.createdAt) }}</td>
              <td class="px-6 py-4 text-center">
                <button
                  class="p-1.5 rounded-lg transition-colors"
                  :class="reg.attended ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'"
                  @click="toggleAttendance(reg)"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="registrationPagination.totalPages > 1" class="px-6 py-4 border-t flex items-center justify-between">
          <span class="text-sm text-gray-500">
            {{ registrationPagination.total }} total registrations
          </span>
          <div class="flex gap-2">
            <button
              :disabled="registrationPagination.page === 1"
              class="px-3 py-1 border rounded disabled:opacity-50"
              @click="registrationPagination.page--; loadRegistrations()"
            >
              Previous
            </button>
            <button
              :disabled="registrationPagination.page === registrationPagination.totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50"
              @click="registrationPagination.page++; loadRegistrations()"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center text-gray-500">
        No registrations yet
      </div>
    </div>

    <!-- Edit Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Status Actions -->
      <div v-if="currentEvent && currentEvent.status !== 'ENDED' && currentEvent.status !== 'CANCELLED'" class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Event Status</h3>
        <div class="flex items-center gap-4">
          <span
            class="px-3 py-1 text-sm font-medium rounded-full"
            :class="getStatusColor(currentEvent.status)"
          >
            {{ currentEvent.status }}
          </span>
          <button
            v-if="currentEvent.status === 'SCHEDULED'"
            type="button"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            @click="startEvent"
          >
            Start Event
          </button>
          <button
            v-if="currentEvent.status === 'LIVE'"
            type="button"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            @click="endEvent"
          >
            End Event
          </button>
          <button
            v-if="currentEvent.status === 'SCHEDULED' || currentEvent.status === 'LIVE'"
            type="button"
            class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            @click="cancelEvent"
          >
            Cancel Event
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  v-model="form.type"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option v-for="type in eventTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
                <p class="mt-1 text-sm text-gray-500">
                  {{ eventTypes.find(t => t.value === form.type)?.description }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Event description..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.startDate"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <input
                  v-model="form.endDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  v-model="form.timezone"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Location / Stream -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Location</h3>
            <div class="space-y-4">
              <label class="flex items-center gap-3">
                <input
                  v-model="form.isVirtual"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 rounded"
                />
                <span class="text-sm text-gray-700">This is a virtual event</span>
              </label>

              <div v-if="form.isVirtual">
                <label class="block text-sm font-medium text-gray-700 mb-2">Stream URL</label>
                <input
                  v-model="form.streamUrl"
                  type="url"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://youtube.com/live/... or https://zoom.us/..."
                />
                <p class="mt-1 text-sm text-gray-500">YouTube, Zoom, or other streaming platform URL</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <UiImageUpload
              v-model="form.coverImage"
              label="Cover Image"
              folder="events"
              :alt="form.title"
              preview-aspect="video"
            />
          </div>

          <!-- Settings -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
                <input
                  v-model.number="form.maxAttendees"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Artist ID</label>
                <input
                  v-model="form.artistId"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Optional"
                />
              </div>

              <label class="flex items-center gap-3">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 rounded"
                />
                <span class="text-sm text-gray-700">Featured event</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="space-y-3">
              <button
                type="submit"
                :disabled="loading || !form.title || !form.startDate"
                class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {{ loading ? 'Saving...' : (isNew ? 'Create Event' : 'Update Event') }}
              </button>
              <NuxtLink
                to="/admin/events"
                class="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-center block"
              >
                Cancel
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Delete Event</h3>
            <p class="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete <span class="font-medium">"{{ form.title }}"</span>?
          All registrations will also be deleted.
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            :disabled="isDeleting"
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            :disabled="isDeleting"
            @click="deleteEvent"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Event' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
