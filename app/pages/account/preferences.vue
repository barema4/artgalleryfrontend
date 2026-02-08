<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { UpdatePreferencesData, NewsletterFrequency } from '~/types/user'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()

const form = reactive<UpdatePreferencesData>({
  newsletterFrequency: 'weekly',
  artInterests: [],
  emailNotifications: true,
  pushNotifications: false,
})

const newsletterOptions: { value: NewsletterFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'never', label: 'Never' },
]

const artCategories = [
  'painting',
  'sculpture',
  'photography',
  'digital-art',
  'prints',
  'mixed-media',
  'illustration',
  'street-art',
]

const isLoading = ref(true)
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  const result = await authStore.fetchPreferences()
  if (result?.success && result.data) {
    form.newsletterFrequency = result.data.newsletterFrequency
    form.artInterests = result.data.artInterests || []
    form.emailNotifications = result.data.emailNotifications
    form.pushNotifications = result.data.pushNotifications
  }
  isLoading.value = false
})

function toggleInterest(category: string) {
  const index = form.artInterests?.indexOf(category) ?? -1
  if (index === -1) {
    form.artInterests = [...(form.artInterests || []), category]
  } else {
    form.artInterests = form.artInterests?.filter((c) => c !== category)
  }
}

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''
  isSubmitting.value = true

  const result = await authStore.updatePreferences(form)

  isSubmitting.value = false

  if (result.success) {
    successMessage.value = 'Preferences updated successfully'
  } else {
    errorMessage.value = result.error || 'Failed to update preferences'
  }
}
</script>

<template>
  <div class="min-h-[80vh] py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Preferences</h1>
        <p class="text-gray-600 mt-1">Customize your experience</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Form -->
      <form v-else class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Success Message -->
        <UiAlert v-if="successMessage" type="success" dismissible @dismiss="successMessage = ''">
          {{ successMessage }}
        </UiAlert>

        <!-- Error Message -->
        <UiAlert v-if="errorMessage" type="error" dismissible @dismiss="errorMessage = ''">
          {{ errorMessage }}
        </UiAlert>

        <!-- Art Interests Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Art Interests</h2>
          <p class="text-sm text-gray-600 mb-4">Select the art categories you're interested in</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in artCategories"
              :key="category"
              type="button"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize"
              :class="
                form.artInterests?.includes(category)
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="toggleInterest(category)"
            >
              {{ category.replace('-', ' ') }}
            </button>
          </div>
        </div>

        <!-- Newsletter Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Newsletter</h2>
          <p class="text-sm text-gray-600 mb-4">How often would you like to receive our newsletter?</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="option in newsletterOptions"
              :key="option.value"
              type="button"
              class="px-4 py-3 rounded-lg text-sm font-medium transition-colors border"
              :class="
                form.newsletterFrequency === option.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              "
              @click="form.newsletterFrequency = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Notifications Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <div class="space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-medium text-gray-900">Email notifications</p>
                <p class="text-sm text-gray-500">Receive updates about new artworks and artists</p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="form.emailNotifications"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="form.emailNotifications ? 'bg-gray-900' : 'bg-gray-200'"
                @click="form.emailNotifications = !form.emailNotifications"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="form.emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-medium text-gray-900">Push notifications</p>
                <p class="text-sm text-gray-500">Get notified about orders and exclusive offers</p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="form.pushNotifications"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="form.pushNotifications ? 'bg-gray-900' : 'bg-gray-200'"
                @click="form.pushNotifications = !form.pushNotifications"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="form.pushNotifications ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <UiButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            size="lg"
          >
            Save preferences
          </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>
