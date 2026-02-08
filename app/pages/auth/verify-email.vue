<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const route = useRoute()

const token = computed(() => route.query.token as string || '')

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

async function verifyEmail() {
  if (!token.value) {
    status.value = 'error'
    errorMessage.value = 'Invalid or missing verification token'
    return
  }

  const result = await authStore.verifyEmail(token.value)

  if (result.success) {
    status.value = 'success'
  } else {
    status.value = 'error'
    errorMessage.value = result.error || 'Failed to verify email'
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md text-center">
      <!-- Logo -->
      <NuxtLink to="/" class="inline-flex items-center gap-2 mb-8">
        <div class="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-2xl">A</span>
        </div>
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="status === 'loading'">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
        <p class="text-gray-600">Please wait while we verify your email address</p>
      </div>

      <!-- Success State -->
      <div v-else-if="status === 'success'">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Email verified!</h1>
        <p class="text-gray-600 mb-8">
          Your email has been successfully verified. You can now access all features.
        </p>
        <NuxtLink
          to="/"
          class="inline-block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue to homepage
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-else>
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Verification failed</h1>
        <p class="text-gray-600 mb-8">{{ errorMessage }}</p>
        <div class="space-y-3">
          <NuxtLink
            to="/auth/login"
            class="inline-block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to login
          </NuxtLink>
          <p class="text-sm text-gray-500">
            Need help?
            <NuxtLink to="/contact" class="text-gray-900 font-medium hover:underline">
              Contact support
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
