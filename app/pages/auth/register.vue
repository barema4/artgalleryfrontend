<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: ['guest'],
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const serverError = ref('')
const isSubmitting = ref(false)

const passwordRequirements = [
  { text: 'At least 8 characters', met: computed(() => form.password.length >= 8) },
  { text: 'One uppercase letter', met: computed(() => /[A-Z]/.test(form.password)) },
  { text: 'One lowercase letter', met: computed(() => /[a-z]/.test(form.password)) },
  { text: 'One number or special character', met: computed(() => /[0-9!@#$%^&*]/.test(form.password)) },
]

function validateForm(): boolean {
  let isValid = true
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

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

  if (!validateForm()) return

  isSubmitting.value = true

  const result = await authStore.register({
    email: form.email,
    password: form.password,
    firstName: form.firstName,
    lastName: form.lastName,
  })

  isSubmitting.value = false

  if (result.success) {
    router.push('/auth/verify-email-sent')
  } else {
    serverError.value = result.error || 'Registration failed'
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gradient-warm">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-3 mb-6">
          <div class="w-14 h-14 bg-gradient-sunset rounded-xl flex items-center justify-center shadow-warm">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-display font-bold text-bark-900">Create an account</h1>
        <p class="text-bark-600 mt-2">Start your African art journey today</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-warm-lg p-8 border border-earth-200">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <!-- Server Error -->
          <UiAlert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
            {{ serverError }}
          </UiAlert>

          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <UiInput
              v-model="form.firstName"
              label="First name"
              placeholder="Kwame"
              :error="errors.firstName"
              autocomplete="given-name"
              required
            />
            <UiInput
              v-model="form.lastName"
              label="Last name"
              placeholder="Asante"
              :error="errors.lastName"
              autocomplete="family-name"
              required
            />
          </div>

          <!-- Email -->
          <UiInput
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            :error="errors.email"
            autocomplete="email"
            required
          />

          <!-- Password -->
          <div>
            <UiInput
              v-model="form.password"
              type="password"
              label="Password"
              placeholder="Create a password"
              :error="errors.password"
              autocomplete="new-password"
              required
            />
            <!-- Password Requirements -->
            <ul class="mt-3 space-y-1.5">
              <li
                v-for="req in passwordRequirements"
                :key="req.text"
                class="flex items-center gap-2 text-xs"
                :class="req.met.value ? 'text-kente-green' : 'text-bark-400'"
              >
                <svg v-if="req.met.value" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <circle cx="10" cy="10" r="5" stroke-width="1.5" />
                </svg>
                {{ req.text }}
              </li>
            </ul>
          </div>

          <!-- Confirm Password -->
          <UiInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Confirm your password"
            :error="errors.confirmPassword"
            autocomplete="new-password"
            required
          />

          <!-- Terms -->
          <p class="text-xs text-bark-500">
            By creating an account, you agree to our
            <NuxtLink to="/terms" class="text-primary-600 hover:underline">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="text-primary-600 hover:underline">Privacy Policy</NuxtLink>.
          </p>

          <!-- Submit Button -->
          <UiButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            full-width
            size="lg"
          >
            Create account
          </UiButton>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-earth-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-bark-500">or continue with</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="space-y-3">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-earth-200 rounded-xl text-bark-700 hover:bg-earth-50 transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <!-- Login Link -->
      <p class="text-center text-bark-600 mt-8">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary-600 font-semibold hover:text-primary-700">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>