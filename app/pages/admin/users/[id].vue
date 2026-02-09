<script setup lang="ts">
import type { User, UserRole, UserStatus } from '~/types/user'
import { useUserService } from '~/services/user.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const router = useRouter()
const userService = useUserService()

const userId = computed(() => route.params.id as string)

const user = ref<User | null>(null)
const isLoading = ref(true)
const error = ref('')
const successMessage = ref('')

// Status update
const showStatusModal = ref(false)
const newStatus = ref<UserStatus>('ACTIVE')
const isUpdating = ref(false)

// Delete confirmation
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const statusOptions: { value: UserStatus; label: string; description: string }[] = [
  { value: 'ACTIVE', label: 'Active', description: 'User can access all features' },
  { value: 'INACTIVE', label: 'Inactive', description: 'User account is disabled' },
  { value: 'SUSPENDED', label: 'Suspended', description: 'User is temporarily banned' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification', description: 'Awaiting email verification' },
]

async function fetchUser() {
  isLoading.value = true
  error.value = ''

  try {
    user.value = await userService.getUserById(userId.value)
    newStatus.value = user.value.status
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load user'
  } finally {
    isLoading.value = false
  }
}

function openStatusModal() {
  if (user.value) {
    newStatus.value = user.value.status
    showStatusModal.value = true
  }
}

async function updateStatus() {
  if (!user.value) return

  isUpdating.value = true
  error.value = ''

  try {
    const updatedUser = await userService.updateUserStatus(user.value.id, { status: newStatus.value })
    user.value = updatedUser
    showStatusModal.value = false
    successMessage.value = 'User status updated successfully'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update status'
  } finally {
    isUpdating.value = false
  }
}

async function deleteUser() {
  if (!user.value) return

  isDeleting.value = true
  error.value = ''

  try {
    await userService.deleteUser(user.value.id)
    router.push('/admin/users')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete user'
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin/users')
  }
}

function getStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
  }
  return colors[status]
}

function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    ARTIST: 'bg-blue-100 text-blue-800',
    SUBSCRIBER: 'bg-gray-100 text-gray-800',
    GUEST: 'bg-gray-100 text-gray-600',
  }
  return colors[role]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Back Button -->
      <button
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Users
      </button>

      <!-- Messages -->
      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- User Details -->
      <template v-else-if="user">
        <!-- Header Card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <!-- Avatar -->
              <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span class="text-2xl font-bold text-white">
                  {{ (user.profile?.firstName?.[0] || user.email[0]).toUpperCase() }}
                </span>
              </div>

              <!-- Basic Info -->
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'No name set' }}
                </h1>
                <p class="text-gray-600">{{ user.email }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span
                    class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="getRoleColor(user.role)"
                  >
                    {{ user.role }}
                  </span>
                  <span
                    class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="getStatusColor(user.status)"
                  >
                    {{ user.status.replace('_', ' ') }}
                  </span>
                  <span
                    v-if="user.emailVerified"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Email Verified
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Not Verified
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                @click="openStatusModal"
              >
                Change Status
              </button>
              <button
                class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                @click="showDeleteModal = true"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Account Information -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">User ID</dt>
                <dd class="text-gray-900 font-mono text-sm">{{ user.id }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Email</dt>
                <dd class="text-gray-900">{{ user.email }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Role</dt>
                <dd class="text-gray-900">{{ user.role }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Status</dt>
                <dd class="text-gray-900">{{ user.status.replace('_', ' ') }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Email Verified</dt>
                <dd class="text-gray-900">{{ user.emailVerified ? 'Yes' : 'No' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Profile Information -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">First Name</dt>
                <dd class="text-gray-900">{{ user.profile?.firstName || '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Last Name</dt>
                <dd class="text-gray-900">{{ user.profile?.lastName || '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Phone</dt>
                <dd class="text-gray-900">{{ user.profile?.phone || '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Bio</dt>
                <dd class="text-gray-900">{{ user.profile?.bio || '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Location</dt>
                <dd class="text-gray-900">
                  {{ user.profile?.city || user.profile?.country
                    ? [user.profile?.city, user.profile?.country].filter(Boolean).join(', ')
                    : '—'
                  }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Timestamps -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-500">Account Created</dt>
                <dd class="text-gray-900">{{ formatDate(user.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Last Updated</dt>
                <dd class="text-gray-900">{{ formatDate(user.updatedAt) }}</dd>
              </div>
              <div v-if="user.lastLoginAt">
                <dt class="text-sm text-gray-500">Last Login</dt>
                <dd class="text-gray-900">{{ formatDate(user.lastLoginAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Artist Profile (if applicable) -->
          <div v-if="user.role === 'ARTIST'" class="bg-white border border-gray-200 rounded-xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Artist Profile</h2>
            <div v-if="user.artistProfile">
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm text-gray-500">Display Name</dt>
                  <dd class="text-gray-900">{{ user.artistProfile.displayName }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">Verified</dt>
                  <dd class="text-gray-900">{{ user.artistProfile.verified ? 'Yes' : 'No' }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">Artworks</dt>
                  <dd class="text-gray-900">{{ user.artistProfile.artworkCount || 0 }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">Followers</dt>
                  <dd class="text-gray-900">{{ user.artistProfile.followerCount || 0 }}</dd>
                </div>
              </dl>
              <NuxtLink
                :to="`/artists/${user.artistProfile.slug}`"
                class="inline-flex items-center gap-2 mt-4 text-sm text-primary-600 hover:text-primary-700"
              >
                View Artist Profile
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
            <p v-else class="text-gray-500">No artist profile created yet.</p>
          </div>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900">User not found</h2>
        <p class="text-gray-600 mt-2">The user you're looking for doesn't exist or has been deleted.</p>
        <NuxtLink
          to="/admin/users"
          class="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Users
        </NuxtLink>
      </div>

      <!-- Status Modal -->
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showStatusModal = false"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Update User Status</h3>
          <p class="text-sm text-gray-600 mb-4">
            Changing status for: <span class="font-medium">{{ user?.email }}</span>
          </p>
          <div class="space-y-2 mb-6">
            <label
              v-for="option in statusOptions"
              :key="option.value"
              class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="newStatus === option.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200'"
            >
              <input
                v-model="newStatus"
                type="radio"
                :value="option.value"
                class="mt-1 w-4 h-4 text-gray-900"
              />
              <div>
                <span class="font-medium text-gray-900">{{ option.label }}</span>
                <p class="text-sm text-gray-500">{{ option.description }}</p>
              </div>
            </label>
          </div>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              :disabled="isUpdating"
              @click="showStatusModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              :disabled="isUpdating"
              @click="updateStatus"
            >
              {{ isUpdating ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Delete User</h3>
              <p class="text-sm text-gray-600">This action cannot be undone.</p>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete <span class="font-medium">{{ user?.email }}</span>?
            All of their data will be permanently removed.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              :disabled="isDeleting"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              :disabled="isDeleting"
              @click="deleteUser"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>