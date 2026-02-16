<script setup lang="ts">
import type {
  Event,
  EventType,
  EventStatus,
  CreateEventData,
  UpdateEventData,
  Registration,
} from '~/types/event'
import { useEventService } from '~/services/event.service'
import { EVENT_TYPE_LABELS } from '~/stores/events'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const eventService = useEventService()

const isLoading = ref(true)
const error = ref('')

const events = ref<Event[]>([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const filters = reactive<{ status?: EventStatus; type?: EventType; search: string }>({
  status: undefined,
  type: undefined,
  search: '',
})

const showEventModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

const selectedEvent = ref<Event | null>(null)
const eventForm = reactive<CreateEventData>({
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

const showRegistrationsModal = ref(false)
const registrations = ref<Registration[]>([])
const registrationPagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
})
const isLoadingRegistrations = ref(false)

const statusOptions: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'LIVE', label: 'Live' },
  { value: 'ENDED', label: 'Ended' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const typeOptions: { value: EventType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'ARTIST_TALK', label: 'Artist Talk' },
  { value: 'LIVE_CREATION', label: 'Live Creation' },
  { value: 'QA_SESSION', label: 'Q&A Session' },
  { value: 'AUCTION', label: 'Auction' },
  { value: 'WORKSHOP', label: 'Workshop' },
]

async function fetchEvents() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await eventService.getEvents({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status,
      type: filters.type,
      sortBy: 'newest',
    })
    events.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch events'
  } finally {
    isLoading.value = false
  }
}

function openEventModal(event?: Event) {
  if (event) {
    isEditing.value = true
    selectedEvent.value = event
    eventForm.title = event.title
    eventForm.description = event.description || ''
    eventForm.type = event.type
    eventForm.coverImage = event.coverImage || ''
    eventForm.startDate = formatDateTimeForInput(event.startDate)
    eventForm.endDate = event.endDate ? formatDateTimeForInput(event.endDate) : ''
    eventForm.timezone = event.timezone
    eventForm.isVirtual = event.isVirtual
    eventForm.streamUrl = event.streamUrl || ''
    eventForm.maxAttendees = event.maxAttendees
    eventForm.artistId = event.artistId || ''
    eventForm.featured = event.featured
  } else {
    isEditing.value = false
    selectedEvent.value = null
    eventForm.title = ''
    eventForm.description = ''
    eventForm.type = 'ARTIST_TALK'
    eventForm.coverImage = ''
    eventForm.startDate = ''
    eventForm.endDate = ''
    eventForm.timezone = 'UTC'
    eventForm.isVirtual = true
    eventForm.streamUrl = ''
    eventForm.maxAttendees = undefined
    eventForm.artistId = ''
    eventForm.featured = false
  }
  showEventModal.value = true
}

async function saveEvent() {
  if (!eventForm.title || !eventForm.startDate) {
    error.value = 'Title and start date are required'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    const data = {
      ...eventForm,
      startDate: new Date(eventForm.startDate).toISOString(),
      endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : undefined,
      description: eventForm.description || undefined,
      coverImage: eventForm.coverImage || undefined,
      streamUrl: eventForm.streamUrl || undefined,
      artistId: eventForm.artistId || undefined,
      maxAttendees: eventForm.maxAttendees || undefined,
    }

    if (isEditing.value && selectedEvent.value) {
      const updateData: UpdateEventData = data
      await eventService.updateEvent(selectedEvent.value.id, updateData)
    } else {
      await eventService.createEvent(data)
    }
    showEventModal.value = false
    await fetchEvents()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save event'
  } finally {
    isSaving.value = false
  }
}

async function startEvent(event: Event) {
  if (!confirm(`Are you sure you want to start "${event.title}"?`)) return

  try {
    await eventService.startEvent(event.id)
    await fetchEvents()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to start event'
  }
}

async function endEvent(event: Event) {
  if (!confirm(`Are you sure you want to end "${event.title}"?`)) return

  try {
    await eventService.endEvent(event.id)
    await fetchEvents()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to end event'
  }
}

async function cancelEvent(event: Event) {
  if (!confirm(`Are you sure you want to cancel "${event.title}"? This cannot be undone.`)) return

  try {
    await eventService.cancelEvent(event.id)
    await fetchEvents()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to cancel event'
  }
}

async function deleteEvent(event: Event) {
  if (!confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)) return

  try {
    await eventService.deleteEvent(event.id)
    await fetchEvents()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete event'
  }
}

async function openRegistrations(event: Event) {
  selectedEvent.value = event
  showRegistrationsModal.value = true
  registrationPagination.page = 1
  await fetchRegistrations(event.id)
}

async function fetchRegistrations(eventId: string) {
  isLoadingRegistrations.value = true

  try {
    const response = await eventService.getEventRegistrations(eventId, {
      page: registrationPagination.page,
      limit: registrationPagination.limit,
    })
    registrations.value = response.data
    registrationPagination.total = response.total
    registrationPagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch registrations'
  } finally {
    isLoadingRegistrations.value = false
  }
}

async function toggleAttendance(registration: Registration) {
  try {
    await eventService.markAttendance(registration.id, !registration.attended)
    if (selectedEvent.value) {
      await fetchRegistrations(selectedEvent.value.id)
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update attendance'
  }
}

async function exportRegistrations() {
  if (!selectedEvent.value) return

  try {
    const data = await eventService.exportRegistrations(selectedEvent.value.id)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${selectedEvent.value.slug}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to export registrations'
  }
}

function formatDateTimeForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: EventStatus): string {
  const colors: Record<EventStatus, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    LIVE: 'bg-green-100 text-green-800',
    ENDED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

function getTypeLabel(type: EventType): string {
  return EVENT_TYPE_LABELS[type] || type
}

watch([() => filters.status, () => filters.type, () => filters.search], () => {
  pagination.page = 1
  fetchEvents()
})

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Events Management</h1>
          <p class="text-gray-600 mt-1">Create and manage virtual events</p>
        </div>
        <NuxtLink
          to="/admin/events/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </NuxtLink>
      </div>

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value || undefined">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="filters.type"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option v-for="option in typeOptions" :key="option.value" :value="option.value || undefined">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search events..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <div v-else-if="events.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
              <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      v-if="event.coverImage"
                      :src="event.coverImage"
                      :alt="event.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ event.title }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span v-if="event.featured" class="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Featured</span>
                      <span v-if="event.isVirtual" class="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Virtual</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ getTypeLabel(event.type) }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(event.status)"
                >
                  {{ event.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(event.startDate) }}
              </td>
              <td class="px-6 py-4">
                <button
                  class="text-sm text-primary-600 hover:text-primary-800"
                  @click="openRegistrations(event)"
                >
                  {{ event.registrationCount }}{{ event.maxAttendees ? `/${event.maxAttendees}` : '' }} registered
                </button>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="event.status === 'SCHEDULED'"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Start event"
                    @click="startEvent(event)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    v-if="event.status === 'LIVE'"
                    class="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                    title="End event"
                    @click="endEvent(event)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </button>
                  <button
                    v-if="event.status === 'SCHEDULED' || event.status === 'LIVE'"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cancel event"
                    @click="cancelEvent(event)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <NuxtLink
                    :to="`/admin/events/${event.id}`"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </NuxtLink>
                  <button
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                    @click="deleteEvent(event)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} events
          </p>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === 1"
              @click="pagination.page--; fetchEvents()"
            >
              Previous
            </button>
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === pagination.totalPages"
              @click="pagination.page++; fetchEvents()"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No events yet</h3>
        <p class="text-gray-500 mb-4">Create your first event to get started.</p>
        <NuxtLink
          to="/admin/events/new"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Event
        </NuxtLink>
      </div>

      <!-- Create/Edit Event Modal -->
      <div
        v-if="showEventModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showEventModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Event' : 'Create Event' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                v-model="eventForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="eventForm.description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Event description..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  v-model="eventForm.type"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="ARTIST_TALK">Artist Talk</option>
                  <option value="LIVE_CREATION">Live Creation</option>
                  <option value="QA_SESSION">Q&A Session</option>
                  <option value="AUCTION">Auction</option>
                  <option value="WORKSHOP">Workshop</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <input
                  v-model="eventForm.timezone"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., America/New_York"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  v-model="eventForm.startDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  v-model="eventForm.endDate"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <UiImageUpload
              v-model="eventForm.coverImage"
              label="Cover Image"
              folder="events"
              :alt="eventForm.title"
              preview-aspect="video"
            />

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input
                  v-model="eventForm.isVirtual"
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700">Virtual Event</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="eventForm.featured"
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700">Featured</span>
              </label>
            </div>

            <div v-if="eventForm.isVirtual">
              <label class="block text-sm font-medium text-gray-700 mb-1">Stream URL</label>
              <input
                v-model="eventForm.streamUrl"
                type="url"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://..."
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                <input
                  v-model.number="eventForm.maxAttendees"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Artist ID</label>
                <input
                  v-model="eventForm.artistId"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showEventModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              :disabled="isSaving || !eventForm.title || !eventForm.startDate"
              @click="saveEvent"
            >
              {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Event
            </button>
          </div>
        </div>
      </div>

      <!-- Registrations Modal -->
      <div
        v-if="showRegistrationsModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showRegistrationsModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Registrations
              </h3>
              <p class="text-sm text-gray-500 mt-1">{{ selectedEvent?.title }}</p>
            </div>
            <button
              class="px-4 py-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              @click="exportRegistrations"
            >
              Export
            </button>
          </div>

          <div class="p-6">
            <div v-if="isLoadingRegistrations" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>

            <div v-else-if="registrations.length > 0">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                    <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="reg in registrations" :key="reg.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {{ reg.firstName || '-' }} {{ reg.lastName || '' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      {{ reg.email }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">
                      {{ formatDate(reg.createdAt) }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        class="p-1 rounded transition-colors"
                        :class="reg.attended ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'"
                        @click="toggleAttendance(reg)"
                      >
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            v-if="reg.attended"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                          <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="registrationPagination.totalPages > 1" class="mt-4 flex items-center justify-between">
                <p class="text-sm text-gray-500">
                  Showing {{ (registrationPagination.page - 1) * registrationPagination.limit + 1 }} to {{ Math.min(registrationPagination.page * registrationPagination.limit, registrationPagination.total) }} of {{ registrationPagination.total }}
                </p>
                <div class="flex gap-2">
                  <button
                    class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                    :disabled="registrationPagination.page === 1"
                    @click="registrationPagination.page--; fetchRegistrations(selectedEvent!.id)"
                  >
                    Previous
                  </button>
                  <button
                    class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                    :disabled="registrationPagination.page === registrationPagination.totalPages"
                    @click="registrationPagination.page++; fetchRegistrations(selectedEvent!.id)"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              No registrations yet
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showRegistrationsModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
