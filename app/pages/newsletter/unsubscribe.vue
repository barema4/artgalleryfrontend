<script setup lang="ts">
import { useNewsletterService } from '~/services/newsletter.service'

const route = useRoute()
const newsletterService = useNewsletterService()

const email = ref(route.query.email as string || '')
const loading = ref(false)
const success = ref(false)
const error = ref('')

async function handleUnsubscribe() {
  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await newsletterService.unsubscribe(email.value)
    success.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Failed to unsubscribe. Please try again.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Unsubscribe from Newsletter',
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream flex items-center justify-center py-16 px-4">
    <div class="max-w-md w-full">
      <!-- Success State -->
      <div v-if="success" class="bg-white rounded-2xl border border-earth-100 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Unsubscribed Successfully</h1>
        <p class="text-bark-500 mb-6">
          You've been removed from our mailing list. We're sorry to see you go!
        </p>
        <p class="text-sm text-bark-400 mb-6">
          Changed your mind? You can always subscribe again from our website.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Back to Home
        </NuxtLink>
      </div>

      <!-- Unsubscribe Form -->
      <div v-else class="bg-white rounded-2xl border border-earth-100 p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-bark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Unsubscribe</h1>
          <p class="text-bark-500">
            We're sad to see you go. Enter your email to unsubscribe from our newsletter.
          </p>
        </div>

        <form @submit.prevent="handleUnsubscribe" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-bark-700 mb-1">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              :class="{ 'border-red-300': error }"
            />
          </div>

          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-bark-700 text-white font-semibold rounded-xl hover:bg-bark-800 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Processing...' : 'Unsubscribe' }}
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-earth-100 text-center">
          <p class="text-sm text-bark-500 mb-3">Changed your mind?</p>
          <NuxtLink
            to="/"
            class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Go back to homepage
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
