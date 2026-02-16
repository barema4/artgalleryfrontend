<script setup lang="ts">
import type { Newsletter, CreateNewsletterData, UpdateNewsletterData } from '~/types/newsletter'
import { useNewsletterService } from '~/services/newsletter.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const newsletterService = useNewsletterService()

const campaignId = computed(() => route.params.id as string)
const isNew = computed(() => campaignId.value === 'new')

const isLoading = ref(true)
const isSaving = ref(false)
const isSending = ref(false)
const error = ref('')
const successMessage = ref('')

const campaign = ref<Newsletter | null>(null)

const form = reactive({
  subject: '',
  previewText: '',
  content: '',
  scheduledAt: '',
})

const showDeleteModal = ref(false)
const isDeleting = ref(false)
const showSendModal = ref(false)

async function fetchCampaign() {
  if (isNew.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await newsletterService.getNewsletterById(campaignId.value)
    campaign.value = data

    form.subject = data.subject
    form.previewText = data.previewText || ''
    form.content = data.content
    form.scheduledAt = data.scheduledAt ? formatDateForInput(data.scheduledAt) : ''
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch campaign'
  } finally {
    isLoading.value = false
  }
}

function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

async function saveCampaign() {
  if (!form.subject || !form.content) {
    error.value = 'Subject and content are required'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (isNew.value) {
      const data: CreateNewsletterData = {
        subject: form.subject,
        previewText: form.previewText || undefined,
        content: form.content,
        scheduledAt: form.scheduledAt || undefined,
      }
      const newCampaign = await newsletterService.createNewsletter(data)
      successMessage.value = 'Campaign created successfully'
      setTimeout(() => {
        router.push(`/admin/newsletter/campaigns/${newCampaign.id}`)
      }, 1000)
    } else {
      const data: UpdateNewsletterData = {
        subject: form.subject,
        previewText: form.previewText || undefined,
        content: form.content,
        scheduledAt: form.scheduledAt || undefined,
      }
      await newsletterService.updateNewsletter(campaignId.value, data)
      successMessage.value = 'Campaign updated successfully'
      await fetchCampaign()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save campaign'
  } finally {
    isSaving.value = false
  }
}

async function scheduleCampaign() {
  if (!form.scheduledAt) {
    error.value = 'Please select a schedule date and time'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    await newsletterService.scheduleNewsletter(campaignId.value, form.scheduledAt)
    successMessage.value = 'Campaign scheduled successfully'
    await fetchCampaign()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to schedule campaign'
  } finally {
    isSaving.value = false
  }
}

async function sendCampaign() {
  isSending.value = true
  error.value = ''

  try {
    await newsletterService.sendNewsletter(campaignId.value)
    successMessage.value = 'Campaign sent successfully'
    showSendModal.value = false
    await fetchCampaign()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to send campaign'
    showSendModal.value = false
  } finally {
    isSending.value = false
  }
}

async function duplicateCampaign() {
  try {
    const newCampaign = await newsletterService.duplicateNewsletter(campaignId.value)
    successMessage.value = 'Campaign duplicated successfully'
    setTimeout(() => {
      router.push(`/admin/newsletter/campaigns/${newCampaign.id}`)
    }, 1000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to duplicate campaign'
  }
}

async function deleteCampaign() {
  isDeleting.value = true
  error.value = ''

  try {
    await newsletterService.deleteNewsletter(campaignId.value)
    router.push('/admin/newsletter')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete campaign'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    SENT: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchCampaign()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin/newsletter"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isNew ? 'Create Campaign' : 'Edit Campaign' }}
            </h1>
            <p v-if="campaign" class="text-gray-600 mt-1">
              {{ campaign.status === 'SENT' ? 'Sent to' : 'Will be sent to' }} {{ campaign.recipientCount }} subscribers
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="!isNew && campaign?.status === 'DRAFT'"
            class="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            @click="showSendModal = true"
          >
            Send Now
          </button>
          <button
            v-if="!isNew && campaign?.status !== 'SENT'"
            class="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click="duplicateCampaign"
          >
            Duplicate
          </button>
          <button
            v-if="!isNew && campaign?.status !== 'SENT'"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
          <button
            v-if="!campaign || campaign.status !== 'SENT'"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            :disabled="isSaving || !form.subject || !form.content"
            @click="saveCampaign"
          >
            {{ isSaving ? 'Saving...' : (isNew ? 'Create Campaign' : 'Save Changes') }}
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Sent Campaign View (read-only) -->
      <div v-else-if="campaign?.status === 'SENT'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Subject</label>
                <p class="text-gray-900">{{ campaign.subject }}</p>
              </div>

              <div v-if="campaign.previewText">
                <label class="block text-sm font-medium text-gray-500 mb-1">Preview Text</label>
                <p class="text-gray-900">{{ campaign.previewText }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Content</label>
                <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 prose prose-sm max-w-none" v-html="campaign.content"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Performance -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Performance</h2>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500">Opens</span>
                  <span class="text-gray-900 font-medium">{{ campaign.openCount }} ({{ ((campaign.openRate || 0) * 100).toFixed(1) }}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${(campaign.openRate || 0) * 100}%` }"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500">Clicks</span>
                  <span class="text-gray-900 font-medium">{{ campaign.clickCount }} ({{ ((campaign.clickRate || 0) * 100).toFixed(1) }}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" :style="{ width: `${(campaign.clickRate || 0) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status & Info -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getStatusColor(campaign.status)">
                  {{ campaign.status }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Recipients</span>
                <span class="text-gray-900 font-medium">{{ campaign.recipientCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Sent</span>
                <span class="text-gray-900">{{ formatDate(campaign.sentAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created</span>
                <span class="text-gray-900">{{ formatDate(campaign.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Editable Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  v-model="form.subject"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Newsletter subject line..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Preview Text</label>
                <input
                  v-model="form.previewText"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Brief preview shown in email clients..."
                />
                <p class="text-sm text-gray-500 mt-1">This text appears in the inbox preview</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  v-model="form.content"
                  rows="16"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                  placeholder="Newsletter content (HTML supported)..."
                ></textarea>
                <p class="text-sm text-gray-500 mt-1">You can use HTML for formatting</p>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="form.content" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Content Preview</h2>
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 prose prose-sm max-w-none" v-html="form.content"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Status</span>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="campaign ? getStatusColor(campaign.status) : 'bg-gray-100 text-gray-800'"
                >
                  {{ campaign?.status || 'Draft' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Scheduling -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Scheduling</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Schedule Date & Time</label>
                <input
                  v-model="form.scheduledAt"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p class="text-sm text-gray-500 mt-1">Leave empty to save as draft</p>
              </div>

              <button
                v-if="!isNew && campaign?.status === 'DRAFT' && form.scheduledAt"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
                @click="scheduleCampaign"
              >
                Schedule Campaign
              </button>
            </div>
          </div>

          <!-- Campaign Info -->
          <div v-if="campaign" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Information</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Recipients</span>
                <span class="text-gray-900 font-medium">{{ campaign.recipientCount }}</span>
              </div>
              <div v-if="campaign.scheduledAt" class="flex justify-between">
                <span class="text-gray-500">Scheduled</span>
                <span class="text-gray-900">{{ formatDate(campaign.scheduledAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Created</span>
                <span class="text-gray-900">{{ formatDate(campaign.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Updated</span>
                <span class="text-gray-900">{{ formatDate(campaign.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="!isNew && campaign?.status === 'DRAFT'" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <button
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="showSendModal = true"
            >
              Send Now
            </button>
            <p class="text-xs text-gray-500 mt-2 text-center">
              Send immediately to all active subscribers
            </p>
          </div>
        </div>
      </div>

      <!-- Send Confirmation Modal -->
      <div
        v-if="showSendModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showSendModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Send Campaign</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to send "{{ campaign?.subject }}" to {{ campaign?.recipientCount }} subscribers?
            <span class="block mt-2 text-amber-600">
              This action cannot be undone.
            </span>
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showSendModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              :disabled="isSending"
              @click="sendCampaign"
            >
              {{ isSending ? 'Sending...' : 'Send Campaign' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Campaign</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ campaign?.subject }}"? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              :disabled="isDeleting"
              @click="deleteCampaign"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Campaign' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
