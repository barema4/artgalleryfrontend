<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { UpdateProfileData } from '~/types/user'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()

const form = reactive<UpdateProfileData>({
  firstName: '',
  lastName: '',
  displayName: '',
  bio: '',
  phone: '',
  country: '',
  city: '',
})

const isLoading = ref(true)
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  const result = await authStore.fetchProfile()
  if (result?.success && result.data) {
    form.firstName = result.data.firstName || ''
    form.lastName = result.data.lastName || ''
    form.displayName = result.data.displayName || ''
    form.bio = result.data.bio || ''
    form.phone = result.data.phone || ''
    form.country = result.data.country || ''
    form.city = result.data.city || ''
  }
  isLoading.value = false
})

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''
  isSubmitting.value = true

  const result = await authStore.updateProfile(form)

  isSubmitting.value = false

  if (result.success) {
    successMessage.value = 'Profile updated successfully'
  } else {
    errorMessage.value = result.error || 'Failed to update profile'
  }
}
</script>

<template>
  <div class="min-h-[80vh] py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p class="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Form -->
      <form v-else class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Success Message -->
        <UiAlert v-if="successMessage" type="success" dismissible @dismiss="successMessage = ''">
          {{ successMessage }}
        </UiAlert>

        <!-- Error Message -->
        <UiAlert v-if="errorMessage" type="error" dismissible @dismiss="errorMessage = ''">
          {{ errorMessage }}
        </UiAlert>

        <!-- Account Info Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-600">
                  {{ (form.firstName?.[0] || authStore.user?.email?.[0] || 'U').toUpperCase() }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ authStore.user?.email }}</p>
                <p class="text-sm text-gray-500">
                  {{ authStore.user?.role }} - {{ authStore.user?.status }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Info Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UiInput
                v-model="form.firstName"
                label="First name"
                placeholder="John"
                autocomplete="given-name"
              />
              <UiInput
                v-model="form.lastName"
                label="Last name"
                placeholder="Doe"
                autocomplete="family-name"
              />
            </div>

            <UiInput
              v-model="form.displayName"
              label="Display name"
              placeholder="How you want to be called"
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                v-model="form.bio"
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Contact Info Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div class="space-y-4">
            <UiInput
              v-model="form.phone"
              label="Phone number"
              placeholder="+1 (555) 000-0000"
              autocomplete="tel"
            />

            <div class="grid grid-cols-2 gap-4">
              <UiInput
                v-model="form.country"
                label="Country"
                placeholder="United States"
                autocomplete="country-name"
              />
              <UiInput
                v-model="form.city"
                label="City"
                placeholder="New York"
                autocomplete="address-level2"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <UiButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            size="lg"
          >
            Save changes
          </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>
