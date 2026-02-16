<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: ['guest'],
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const serverError = ref('')
const isSubmitting = ref(false)

const sessionExpired = computed(() => route.query.expired === 'true')

function validateForm(): boolean {
  let isValid = true
  errors.email = ''
  errors.password = ''

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
  }

  return isValid
}

async function handleSubmit() {
  serverError.value = ''

  if (!validateForm()) return

  isSubmitting.value = true

  const result = await authStore.login({
    email: form.email,
    password: form.password,
  })

  isSubmitting.value = false

  if (result.success) {
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } else {
    serverError.value = result.error || 'Login failed'
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gradient-warm">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-3 mb-6">
          <div class="w-14 h-14 bg-gradient-sunset rounded-xl flex items-center justify-center shadow-warm">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-display font-bold text-bark-900">Welcome back</h1>
        <p class="text-bark-600 mt-2">Sign in to your account to continue</p>
      </div>

      <UiAlert v-if="sessionExpired" type="warning" class="mb-4">
        Your session has expired. Please sign in again.
      </UiAlert>

      <div class="bg-white rounded-2xl shadow-warm-lg p-8 border border-earth-200">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <UiAlert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
            {{ serverError }}
          </UiAlert>

          <UiInput
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            :error="errors.email"
            autocomplete="email"
            required
          />

          <UiInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :error="errors.password"
            autocomplete="current-password"
            required
          />

          <div class="flex justify-end">
            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <UiButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            full-width
            size="lg"
          >
            Sign in
          </UiButton>
        </form>

        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-earth-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-bark-500">or continue with</span>
          </div>
        </div>

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

      <p class="text-center text-bark-600 mt-8">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary-600 font-semibold hover:text-primary-700">
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
