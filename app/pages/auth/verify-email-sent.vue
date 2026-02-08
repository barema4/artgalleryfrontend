<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()

const isResending = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')

async function resendVerification() {
  isResending.value = true
  resendError.value = ''
  resendSuccess.value = false

  try {
    const config = useRuntimeConfig()
    await $fetch('/auth/resend-verification', {
      baseURL: config.public.apiBaseUrl as string,
      method: 'POST',
      headers: authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : {},
    })
    resendSuccess.value = true
  } catch (error: any) {
    resendError.value = error?.data?.message || 'Failed to resend verification email'
  } finally {
    isResending.value = false
  }
}
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

      <!-- Email Icon -->
      <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
      <p class="text-gray-600 mb-2">
        We've sent a verification link to your email address.
      </p>
      <p class="text-gray-600 mb-8">
        Please check your inbox and click the link to verify your account.
      </p>

      <!-- Success Message -->
      <UiAlert v-if="resendSuccess" type="success" class="mb-6">
        Verification email sent successfully!
      </UiAlert>

      <!-- Error Message -->
      <UiAlert v-if="resendError" type="error" class="mb-6" dismissible @dismiss="resendError = ''">
        {{ resendError }}
      </UiAlert>

      <!-- Actions -->
      <div class="space-y-4">
        <button
          type="button"
          class="w-full px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          :disabled="isResending"
          @click="resendVerification"
        >
          <span v-if="isResending">Sending...</span>
          <span v-else>Resend verification email</span>
        </button>

        <NuxtLink
          to="/"
          class="inline-block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue to homepage
        </NuxtLink>
      </div>

      <!-- Help Text -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-medium text-gray-900 mb-2">Didn't receive the email?</h3>
        <ul class="text-sm text-gray-600 text-left space-y-1">
          <li>• Check your spam or junk folder</li>
          <li>• Make sure you entered the correct email</li>
          <li>• Wait a few minutes and try again</li>
        </ul>
      </div>

      <!-- Back to Login -->
      <p class="text-gray-600 mt-6">
        <NuxtLink to="/auth/login" class="text-gray-900 font-medium hover:underline">
          Back to login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
