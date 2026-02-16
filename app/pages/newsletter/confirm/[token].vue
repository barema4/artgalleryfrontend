<script setup lang="ts">
import { useNewsletterService } from '~/services/newsletter.service'

const route = useRoute()
const newsletterService = useNewsletterService()

const loading = ref(true)
const success = ref(false)
const error = ref('')

async function confirmSubscription() {
  const token = route.params.token as string

  if (!token) {
    error.value = 'Invalid confirmation link'
    loading.value = false
    return
  }

  try {
    await newsletterService.confirmSubscription(token)
    success.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Failed to confirm subscription. The link may have expired.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  confirmSubscription()
})

useHead({
  title: 'Confirm Newsletter Subscription',
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream flex items-center justify-center py-16 px-4">
    <div class="max-w-md w-full">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl border border-earth-100 p-8 text-center">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Confirming...</h1>
        <p class="text-bark-500">Please wait while we confirm your subscription.</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="bg-white rounded-2xl border border-earth-100 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Subscription Confirmed!</h1>
        <p class="text-bark-500 mb-6">
          Thank you for confirming your email. You'll now receive our newsletter with the latest updates.
        </p>

        <div class="bg-primary-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-primary-700">
            Keep an eye on your inbox for exclusive content, new artworks, and special offers!
          </p>
        </div>

        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Explore Artworks
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-2xl border border-earth-100 p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Confirmation Failed</h1>
        <p class="text-bark-500 mb-6">{{ error }}</p>

        <div class="space-y-3">
          <NuxtLink
            to="/"
            class="block w-full px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-center"
          >
            Go to Homepage
          </NuxtLink>
          <p class="text-sm text-bark-500">
            Need help? <a href="mailto:support@afrikacrafts.com" class="text-primary-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
