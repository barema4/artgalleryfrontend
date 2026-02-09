<script setup lang="ts">
import type { Artist, CreateArtistData, UpdateArtistData } from '~/types/artist'
import { useArtistService } from '~/services/artist.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const artistService = useArtistService()
const authStore = useAuthStore()

const artist = ref<Artist | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive<CreateArtistData & UpdateArtistData>({
  slug: '',
  displayName: '',
  bio: '',
  statement: '',
  profileImage: '',
  coverImage: '',
  website: '',
  instagram: '',
  twitter: '',
  facebook: '',
})

const isNewProfile = computed(() => !artist.value)

async function fetchArtistProfile() {
  isLoading.value = true
  try {
    artist.value = await artistService.getMyArtistProfile()
    if (artist.value) {
      // Populate form with existing data
      form.slug = artist.value.slug
      form.displayName = artist.value.displayName
      form.bio = artist.value.bio || ''
      form.statement = artist.value.statement || ''
      form.profileImage = artist.value.profileImage || ''
      form.coverImage = artist.value.coverImage || ''
      form.website = artist.value.website || ''
      form.instagram = artist.value.instagram || ''
      form.twitter = artist.value.twitter || ''
      form.facebook = artist.value.facebook || ''
    }
  } catch (e: any) {
    // No profile exists, that's okay
    if (e?.status !== 404 && e?.statusCode !== 404) {
      errorMessage.value = e?.data?.message || 'Failed to load profile'
    }
  } finally {
    isLoading.value = false
  }
}

function generateSlug() {
  if (form.displayName && !form.slug) {
    form.slug = form.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!form.slug || !form.displayName) {
    errorMessage.value = 'Slug and display name are required'
    return
  }

  isSaving.value = true

  try {
    if (isNewProfile.value) {
      artist.value = await artistService.createMyArtistProfile(form as CreateArtistData)
      // Update user role in auth store
      if (authStore.user) {
        authStore.user.role = 'ARTIST'
      }
      successMessage.value = 'Artist profile created successfully!'
    } else {
      const updateData: UpdateArtistData = {
        displayName: form.displayName,
        bio: form.bio,
        statement: form.statement,
        profileImage: form.profileImage,
        coverImage: form.coverImage,
        website: form.website,
        instagram: form.instagram,
        twitter: form.twitter,
        facebook: form.facebook,
      }
      artist.value = await artistService.updateMyArtistProfile(updateData)
      successMessage.value = 'Artist profile updated successfully!'
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.message || 'Failed to save profile'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete your artist profile? This action cannot be undone.')) {
    return
  }

  isSaving.value = true
  try {
    await artistService.deleteMyArtistProfile()
    artist.value = null
    // Reset form
    form.slug = ''
    form.displayName = ''
    form.bio = ''
    form.statement = ''
    form.profileImage = ''
    form.coverImage = ''
    form.website = ''
    form.instagram = ''
    form.twitter = ''
    form.facebook = ''
    // Update user role
    if (authStore.user) {
      authStore.user.role = 'SUBSCRIBER'
    }
    successMessage.value = 'Artist profile deleted'
  } catch (e: any) {
    errorMessage.value = e?.data?.message || 'Failed to delete profile'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchArtistProfile()
})
</script>

<template>
  <div class="min-h-[80vh] py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isNewProfile ? 'Become an Artist' : 'Artist Profile' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ isNewProfile ? 'Create your artist profile to start selling your work' : 'Manage your artist profile and settings' }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Form -->
      <form v-else class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Messages -->
        <UiAlert v-if="successMessage" type="success" dismissible @dismiss="successMessage = ''">
          {{ successMessage }}
        </UiAlert>
        <UiAlert v-if="errorMessage" type="error" dismissible @dismiss="errorMessage = ''">
          {{ errorMessage }}
        </UiAlert>

        <!-- Basic Info -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div class="space-y-4">
            <UiInput
              v-model="form.displayName"
              label="Display Name"
              placeholder="Your artist name"
              required
              @blur="generateSlug"
            />

            <div>
              <UiInput
                v-model="form.slug"
                label="Profile URL"
                placeholder="your-artist-name"
                :disabled="!isNewProfile"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Your profile will be at: /artists/{{ form.slug || 'your-slug' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                v-model="form.bio"
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                placeholder="Tell visitors about yourself..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Artist Statement</label>
              <textarea
                v-model="form.statement"
                rows="4"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                placeholder="Share your artistic vision and inspiration..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Images</h2>
          <div class="space-y-4">
            <UiInput
              v-model="form.profileImage"
              label="Profile Image URL"
              placeholder="https://example.com/your-photo.jpg"
            />
            <UiInput
              v-model="form.coverImage"
              label="Cover Image URL"
              placeholder="https://example.com/your-cover.jpg"
            />
            <p class="text-xs text-gray-500">
              Tip: Use a file upload service or integrate the Media module for image uploads.
            </p>
          </div>
        </div>

        <!-- Social Links -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
          <div class="space-y-4">
            <UiInput
              v-model="form.website"
              label="Website"
              placeholder="https://yourwebsite.com"
            />
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UiInput
                v-model="form.instagram"
                label="Instagram"
                placeholder="username"
              />
              <UiInput
                v-model="form.twitter"
                label="Twitter/X"
                placeholder="username"
              />
              <UiInput
                v-model="form.facebook"
                label="Facebook"
                placeholder="username"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <div>
            <button
              v-if="!isNewProfile"
              type="button"
              class="text-red-600 hover:text-red-700 text-sm font-medium"
              @click="handleDelete"
            >
              Delete artist profile
            </button>
          </div>
          <div class="flex gap-3">
            <NuxtLink
              v-if="!isNewProfile && artist"
              :to="`/artists/${artist.slug}`"
              class="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              View Profile
            </NuxtLink>
            <UiButton
              type="submit"
              :loading="isSaving"
              :disabled="isSaving"
            >
              {{ isNewProfile ? 'Create Profile' : 'Save Changes' }}
            </UiButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>