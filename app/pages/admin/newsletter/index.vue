<script setup lang="ts">
import type { Newsletter, NewsletterStatus, NewsletterListParams, NewsletterStats, Subscriber, SubscriberStats } from '~/types/newsletter'
import { useNewsletterService } from '~/services/newsletter.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const newsletterService = useNewsletterService()

const newsletters = ref<Newsletter[]>([])
const isLoading = ref(true)
const error = ref('')
const activeTab = ref<'campaigns' | 'subscribers'>('campaigns')

const stats = ref<NewsletterStats | null>(null)
const subscriberStats = ref<SubscriberStats | null>(null)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const filters = reactive<{ status?: NewsletterStatus }>({
  status: undefined,
})

const statusOptions: { value: NewsletterStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'SENT', label: 'Sent' },
]

const isSending = ref(false)

const subscribers = ref<Subscriber[]>([])
const subscriberPagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})
const subscriberSearch = ref('')

async function fetchNewsletters() {
  isLoading.value = true
  error.value = ''

  try {
    const params: NewsletterListParams = {
      page: pagination.page,
      limit: pagination.limit,
    }
    if (filters.status) params.status = filters.status

    const response = await newsletterService.getNewsletters(params)
    newsletters.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch newsletters'
  } finally {
    isLoading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await newsletterService.getNewsletterStats()
    subscriberStats.value = await newsletterService.getSubscriberStats()
  } catch {
  }
}

async function fetchSubscribers() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await newsletterService.getSubscribers({
      page: subscriberPagination.page,
      limit: subscriberPagination.limit,
      search: subscriberSearch.value || undefined,
    })
    subscribers.value = response.data
    subscriberPagination.total = response.total
    subscriberPagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch subscribers'
  } finally {
    isLoading.value = false
  }
}

async function sendNewsletter(newsletter: Newsletter) {
  if (!confirm(`Are you sure you want to send "${newsletter.subject}" to all subscribers? This action cannot be undone.`)) {
    return
  }

  isSending.value = true
  error.value = ''

  try {
    await newsletterService.sendNewsletter(newsletter.id)
    await fetchNewsletters()
    await fetchStats()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to send newsletter'
  } finally {
    isSending.value = false
  }
}

async function duplicateNewsletter(newsletter: Newsletter) {
  try {
    await newsletterService.duplicateNewsletter(newsletter.id)
    await fetchNewsletters()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to duplicate newsletter'
  }
}

async function deleteNewsletter(newsletter: Newsletter) {
  if (!confirm(`Are you sure you want to delete "${newsletter.subject}"?`)) return

  try {
    await newsletterService.deleteNewsletter(newsletter.id)
    await fetchNewsletters()
    await fetchStats()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete newsletter'
  }
}

async function deleteSubscriber(subscriber: Subscriber) {
  if (!confirm(`Are you sure you want to delete subscriber ${subscriber.email}?`)) return

  try {
    await newsletterService.deleteSubscriber(subscriber.id)
    await fetchSubscribers()
    await fetchStats()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete subscriber'
  }
}

function getStatusColor(status: NewsletterStatus): string {
  const colors: Record<NewsletterStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    SENT: 'bg-green-100 text-green-800',
  }
  return colors[status]
}

function getSubscriberStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    UNSUBSCRIBED: 'bg-gray-100 text-gray-800',
    BOUNCED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
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

watch(() => filters.status, () => {
  pagination.page = 1
  fetchNewsletters()
})

watch(activeTab, (tab) => {
  if (tab === 'campaigns') {
    fetchNewsletters()
  } else {
    fetchSubscribers()
  }
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(subscriberSearch, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    subscriberPagination.page = 1
    fetchSubscribers()
  }, 300)
})

onMounted(() => {
  fetchNewsletters()
  fetchStats()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Newsletter Management</h1>
          <p class="text-gray-600 mt-1">Create, schedule, and send newsletters to subscribers</p>
        </div>
        <NuxtLink
          to="/admin/newsletter/campaigns/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Newsletter
        </NuxtLink>
      </div>

      <div v-if="stats && subscriberStats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Total Subscribers</p>
          <p class="text-2xl font-bold text-gray-900">{{ subscriberStats.totalSubscribers }}</p>
          <p class="text-xs text-green-600">{{ subscriberStats.activeSubscribers }} active</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Newsletters Sent</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalSent }}</p>
          <p class="text-xs text-gray-500">{{ stats.totalDrafts }} drafts</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Avg Open Rate</p>
          <p class="text-2xl font-bold text-gray-900">{{ (stats.averageOpenRate * 100).toFixed(1) }}%</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Avg Click Rate</p>
          <p class="text-2xl font-bold text-gray-900">{{ (stats.averageClickRate * 100).toFixed(1) }}%</p>
        </div>
      </div>

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <div class="flex border-b border-gray-200 mb-6">
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'campaigns'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'campaigns'"
        >
          Campaigns
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === 'subscribers'
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'subscribers'"
        >
          Subscribers
        </button>
      </div>

      <div v-if="activeTab === 'campaigns'">
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
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Newsletter
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="newsletter in newsletters" :key="newsletter.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ newsletter.subject }}</p>
                    <p v-if="newsletter.previewText" class="text-sm text-gray-500 truncate max-w-xs">
                      {{ newsletter.previewText }}
                    </p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusColor(newsletter.status)"
                  >
                    {{ newsletter.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ newsletter.recipientCount }}
                </td>
                <td class="px-6 py-4">
                  <div v-if="newsletter.status === 'SENT'" class="text-sm">
                    <p class="text-gray-600">
                      Opens: {{ newsletter.openCount }} ({{ ((newsletter.openRate || 0) * 100).toFixed(1) }}%)
                    </p>
                    <p class="text-gray-600">
                      Clicks: {{ newsletter.clickCount }} ({{ ((newsletter.clickRate || 0) * 100).toFixed(1) }}%)
                    </p>
                  </div>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <template v-if="newsletter.status === 'SENT'">
                    {{ formatDate(newsletter.sentAt) }}
                  </template>
                  <template v-else-if="newsletter.status === 'SCHEDULED'">
                    {{ formatDate(newsletter.scheduledAt) }}
                  </template>
                  <template v-else>
                    {{ formatDate(newsletter.createdAt) }}
                  </template>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="newsletter.status === 'DRAFT'"
                      class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Send now"
                      :disabled="isSending"
                      @click="sendNewsletter(newsletter)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                    <NuxtLink
                      v-if="newsletter.status !== 'SENT'"
                      :to="`/admin/newsletter/campaigns/${newsletter.id}`"
                      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </NuxtLink>
                    <button
                      class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicate"
                      @click="duplicateNewsletter(newsletter)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      v-if="newsletter.status !== 'SENT'"
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      @click="deleteNewsletter(newsletter)"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="newsletters.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  No newsletters found. Create your first newsletter to get started.
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p class="text-sm text-gray-500">
              Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
              {{ pagination.total }} newsletters
            </p>
            <div class="flex gap-2">
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="pagination.page === 1"
                @click="pagination.page--; fetchNewsletters()"
              >
                Previous
              </button>
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="pagination.page === pagination.totalPages"
                @click="pagination.page++; fetchNewsletters()"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'subscribers'">
        <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                v-model="subscriberSearch"
                type="text"
                placeholder="Search by email..."
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscriber
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confirmed
                </th>
                <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="subscriber in subscribers" :key="subscriber.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ subscriber.email }}</p>
                    <p v-if="subscriber.firstName" class="text-sm text-gray-500">
                      {{ subscriber.firstName }} {{ subscriber.lastName }}
                    </p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getSubscriberStatusColor(subscriber.status)"
                  >
                    {{ subscriber.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(subscriber.subscribedAt) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span v-if="subscriber.confirmedAt" class="text-green-600">Yes</span>
                  <span v-else class="text-gray-400">No</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete subscriber"
                    @click="deleteSubscriber(subscriber)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="subscribers.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  No subscribers found
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="subscriberPagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p class="text-sm text-gray-500">
              Showing {{ (subscriberPagination.page - 1) * subscriberPagination.limit + 1 }} to
              {{ Math.min(subscriberPagination.page * subscriberPagination.limit, subscriberPagination.total) }} of
              {{ subscriberPagination.total }} subscribers
            </p>
            <div class="flex gap-2">
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="subscriberPagination.page === 1"
                @click="subscriberPagination.page--; fetchSubscribers()"
              >
                Previous
              </button>
              <button
                class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                :disabled="subscriberPagination.page === subscriberPagination.totalPages"
                @click="subscriberPagination.page++; fetchSubscribers()"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
