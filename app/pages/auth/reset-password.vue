<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const token = computed(() => route.query.token as string || '')

const form = reactive({
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  password: '',
  confirmPassword: '',
})

const serverError = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

const passwordRequirements = [
  { text: 'At least 8 characters', met: computed(() => form.password.length >= 8) },
  { text: 'One uppercase letter', met: computed(() => /[A-Z]/.test(form.password)) },
  { text: 'One lowercase letter', met: computed(() => /[a-z]/.test(form.password)) },
  { text: 'One number or special character', met: computed(() => /[0-9!@#$%^&*]/.test(form.password)) },
]

function validateForm(): boolean {
  let isValid = true
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (!passwordRequirements.every((req) => req.met.value)) {
    errors.password = 'Password does not meet requirements'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  serverError.value = ''

  if (!token.value) {
    serverError.value = 'Invalid or missing reset token'
    return
  }

  if (!validateForm()) return

  isSubmitting.value = true

  const result = await authStore.resetPassword(token.value, form.password)

  isSubmitting.value = false

  if (result.success) {
    isSuccess.value = true
  } else {
    serverError.value = result.error || 'Failed to reset password'
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
        <h1 class="text-2xl font-bold text-gray-900">Set new password</h1>
        <p class="text-gray-600 mt-2">Create a new password for your account</p>
      </div>

      <!-- Success State -->
      <div v-if="isSuccess" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Password reset successful</h2>
        <p class="text-gray-600 mb-6">
          Your password has been reset. You can now log in with your new password.
        </p>
        <NuxtLink
          to="/auth/login"
          class="inline-block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
        >
          Sign in
        </NuxtLink>
      </div>

      <!-- No Token Error -->
      <div v-else-if="!token" class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Invalid reset link</h2>
        <p class="text-gray-600 mb-6">
          This password reset link is invalid or has expired.
        </p>
        <NuxtLink
          to="/auth/forgot-password"
          class="inline-block w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
        >
          Request new link
        </NuxtLink>
      </div>

      <!-- Form -->
      <form v-else class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Server Error -->
        <UiAlert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
          {{ serverError }}
        </UiAlert>

        <!-- Password -->
        <div>
          <UiInput
            v-model="form.password"
            type="password"
            label="New password"
            placeholder="Enter new password"
            :error="errors.password"
            autocomplete="new-password"
            required
          />
          <!-- Password Requirements -->
          <ul class="mt-2 space-y-1">
            <li
              v-for="req in passwordRequirements"
              :key="req.text"
              class="flex items-center gap-2 text-xs"
              :class="req.met.value ? 'text-green-600' : 'text-gray-400'"
            >
              <svg v-if="req.met.value" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <circle cx="10" cy="10" r="6" stroke-width="2" />
              </svg>
              {{ req.text }}
            </li>
          </ul>
        </div>

        <!-- Confirm Password -->
        <UiInput
          v-model="form.confirmPassword"
          type="password"
          label="Confirm new password"
          placeholder="Confirm new password"
          :error="errors.confirmPassword"
          autocomplete="new-password"
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
          Reset password
        </UiButton>
      </form>
    </div>
  </div>
</template>
