<script setup lang="ts">
import type { SubscribeData } from '~/types/newsletter'
import { useNewsletterService } from '~/services/newsletter.service'

const props = defineProps<{
  variant?: 'default' | 'compact' | 'footer'
  showPreferences?: boolean
}>()

const newsletterService = useNewsletterService()

const form = reactive<SubscribeData>({
  email: '',
  firstName: '',
  preferences: [],
  frequency: 'weekly',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

const preferenceOptions = [
  { value: 'new_artworks', label: 'New Artworks' },
  { value: 'artist_features', label: 'Artist Features' },
  { value: 'events', label: 'Events & Exhibitions' },
  { value: 'promotions', label: 'Special Offers' },
]

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

async function handleSubscribe() {
  if (!form.email) {
    error.value = 'Please enter your email address'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await newsletterService.subscribe(form)
    success.value = true
    form.email = ''
    form.firstName = ''
    form.preferences = []
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Failed to subscribe. Please try again.'
  } finally {
    loading.value = false
  }
}

function togglePreference(pref: string) {
  const index = form.preferences?.indexOf(pref) ?? -1
  if (index === -1) {
    form.preferences = [...(form.preferences || []), pref]
  } else {
    form.preferences = form.preferences?.filter(p => p !== pref)
  }
}
</script>

<template>
  <!-- Success State -->
  <div v-if="success" class="text-center py-4">
    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 class="font-semibold text-bark-800 mb-1">You're Subscribed!</h3>
    <p class="text-sm text-bark-500">Check your inbox to confirm your subscription.</p>
  </div>

  <!-- Compact Variant (Footer inline) -->
  <div v-else-if="variant === 'compact' || variant === 'footer'" class="w-full">
    <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <input
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          required
          class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          :class="{ 'border-red-300': error }"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {{ loading ? 'Subscribing...' : 'Subscribe' }}
      </button>
    </form>
    <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
  </div>

  <!-- Default Variant (Full form) -->
  <div v-else class="w-full">
    <form @submit.prevent="handleSubscribe" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-bark-700 mb-1">Email Address *</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="your@email.com"
          required
          class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          :class="{ 'border-red-300': error }"
        />
      </div>

      <!-- First Name (optional) -->
      <div>
        <label class="block text-sm font-medium text-bark-700 mb-1">First Name</label>
        <input
          v-model="form.firstName"
          type="text"
          placeholder="Your first name"
          class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </div>

      <!-- Preferences -->
      <div v-if="showPreferences">
        <label class="block text-sm font-medium text-bark-700 mb-2">I'm interested in</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in preferenceOptions"
            :key="option.value"
            type="button"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="form.preferences?.includes(option.value)
              ? 'bg-primary-500 text-white'
              : 'bg-earth-100 text-bark-600 hover:bg-earth-200'"
            @click="togglePreference(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Frequency -->
      <div v-if="showPreferences">
        <label class="block text-sm font-medium text-bark-700 mb-2">Email Frequency</label>
        <div class="flex gap-3">
          <label
            v-for="option in frequencyOptions"
            :key="option.value"
            class="flex items-center gap-2 cursor-pointer"
          >
            <input
              v-model="form.frequency"
              type="radio"
              :value="option.value"
              class="w-4 h-4 text-primary-500 border-earth-300 focus:ring-primary-500"
            />
            <span class="text-sm text-bark-600">{{ option.label }}</span>
          </label>
        </div>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Subscribing...' : 'Subscribe to Newsletter' }}
      </button>

      <!-- Privacy Note -->
      <p class="text-xs text-bark-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  </div>
</template>
