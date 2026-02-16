<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchCurrentUser()
})

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const passwordRequirements = [
  { text: 'At least 8 characters', met: computed(() => form.newPassword.length >= 8) },
  { text: 'One uppercase letter', met: computed(() => /[A-Z]/.test(form.newPassword)) },
  { text: 'One lowercase letter', met: computed(() => /[a-z]/.test(form.newPassword)) },
  { text: 'One number or special character', met: computed(() => /[0-9!@#$%^&*]/.test(form.newPassword)) },
]

function validateForm(): boolean {
  let isValid = true
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''

  if (!form.currentPassword) {
    errors.currentPassword = 'Current password is required'
    isValid = false
  }

  if (!form.newPassword) {
    errors.newPassword = 'New password is required'
    isValid = false
  } else if (form.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters'
    isValid = false
  } else if (!passwordRequirements.every((req) => req.met.value)) {
    errors.newPassword = 'Password does not meet requirements'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (form.currentPassword === form.newPassword) {
    errors.newPassword = 'New password must be different from current password'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) return

  isSubmitting.value = true

  try {
    await $fetch('/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      },
    })

    successMessage.value = 'Password changed successfully'
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Failed to change password'
  } finally {
    isSubmitting.value = false
  }
}

const isResending = ref(false)
const resendSuccess = ref(false)

async function resendVerification() {
  if (!authStore.user?.email) {
    errorMessage.value = 'No email found for current user'
    return
  }

  isResending.value = true
  try {
    await $fetch('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: {
        email: authStore.user.email,
      },
    })
    resendSuccess.value = true
    setTimeout(() => { resendSuccess.value = false }, 5000)
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Failed to send verification email'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p class="text-gray-600 mt-1">Manage your password and account security</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <UiAlert v-if="successMessage" type="success" dismissible @dismiss="successMessage = ''">
            {{ successMessage }}
          </UiAlert>

          <UiAlert v-if="errorMessage" type="error" dismissible @dismiss="errorMessage = ''">
            {{ errorMessage }}
          </UiAlert>

          <UiInput
            v-model="form.currentPassword"
            type="password"
            label="Current password"
            placeholder="Enter your current password"
            :error="errors.currentPassword"
            autocomplete="current-password"
          />

          <div>
            <UiInput
              v-model="form.newPassword"
              type="password"
              label="New password"
              placeholder="Enter new password"
              :error="errors.newPassword"
              autocomplete="new-password"
            />
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

          <UiInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm new password"
            placeholder="Confirm new password"
            :error="errors.confirmPassword"
            autocomplete="new-password"
          />

          <div class="flex justify-end pt-2">
            <UiButton
              type="submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              Change password
            </UiButton>
          </div>
        </form>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6 mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Email Verification</h2>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <p class="text-gray-900">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <div v-if="authStore.isEmailVerified" class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium text-green-600">Verified</span>
          </div>

          <div v-else class="flex items-center gap-3">
            <span v-if="resendSuccess" class="text-sm text-green-600">Email sent!</span>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-yellow-600">Not verified</span>
            </div>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              :disabled="isResending"
              @click="resendVerification"
            >
              {{ isResending ? 'Sending...' : 'Resend verification' }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6 mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Log out of all devices</p>
              <p class="text-sm text-gray-500">This will log you out everywhere except here</p>
            </div>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Log out all
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
