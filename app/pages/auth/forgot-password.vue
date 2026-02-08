<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()

const email = ref('')
const emailError = ref('')
const serverError = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

function validateEmail(): boolean {
  emailError.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email'
    return false
  }

  return true
}

async function handleSubmit() {
  serverError.value = ''

  if (!validateEmail()) return

  isSubmitting.value = true

  const result = await authStore.forgotPassword(email.value)

  isSubmitting.value = false

  if (result.success) {
    isSuccess.value = true
  } else {
    serverError.value = result.error || 'Failed to send reset email'
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6">
          <div class="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-2xl">A</span>
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p class="text-gray-600 mt-2">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      <!-- Success State -->
      <div v-if="isSuccess" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
        <p class="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{{ email }}</strong>
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Didn't receive the email? Check your spam folder or
          <button
            class="text-gray-900 font-medium hover:underline"
            @click="isSuccess = false"
          >
            try again
          </button>
        </p>
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </NuxtLink>
      </div>

      <!-- Form -->
      <form v-else class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Server Error -->
        <UiAlert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
          {{ serverError }}
        </UiAlert>

        <!-- Email -->
        <UiInput
          v-model="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          :error="emailError"
          autocomplete="email"
          required
        />

        <!-- Submit Button -->
        <UiButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          full-width
          size="lg"
        >
          Send reset link
        </UiButton>

        <!-- Back to Login -->
        <div class="text-center">
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
