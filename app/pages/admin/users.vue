<script setup lang="ts">
import type { User, UserRole, UserStatus, UserListParams } from '~/types/user'
import { useUserService } from '~/services/user.service'

definePageMeta({
  middleware: ['admin'],
})

const userService = useUserService()

const users = ref<User[]>([])
const isLoading = ref(true)
const error = ref('')

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

const filters = reactive<{ role?: UserRole; status?: UserStatus }>({
  role: undefined,
  status: undefined,
})

const roleOptions: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ARTIST', label: 'Artist' },
  { value: 'SUBSCRIBER', label: 'Subscriber' },
  { value: 'GUEST', label: 'Guest' },
]

const statusOptions: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'PENDING_VERIFICATION', label: 'Pending' },
]

const selectedUser = ref<User | null>(null)
const showStatusModal = ref(false)
const newStatus = ref<UserStatus>('ACTIVE')
const isUpdating = ref(false)

async function fetchUsers() {
  isLoading.value = true
  error.value = ''

  try {
    const params: UserListParams = {
      page: pagination.page,
      limit: pagination.limit,
    }
    if (filters.role) params.role = filters.role
    if (filters.status) params.status = filters.status

    const response = await userService.getUsers(params)
    users.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch users'
  } finally {
    isLoading.value = false
  }
}

function openStatusModal(user: User) {
  selectedUser.value = user
  newStatus.value = user.status
  showStatusModal.value = true
}

async function updateStatus() {
  if (!selectedUser.value) return

  isUpdating.value = true
  try {
    await userService.updateUserStatus(selectedUser.value.id, { status: newStatus.value })
    showStatusModal.value = false
    await fetchUsers()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update user status'
  } finally {
    isUpdating.value = false
  }
}

async function deleteUser(user: User) {
  if (!confirm(`Are you sure you want to delete ${user.email}?`)) return

  try {
    await userService.deleteUser(user.id)
    await fetchUsers()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete user'
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

watch([() => filters.role, () => filters.status], () => {
  pagination.page = 1
  fetchUsers()
})

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600 mt-1">Manage users and their permissions</p>
      </div>

      <!-- Error -->
      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              v-model="filters.role"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option v-for="option in roleOptions" :key="option.value" :value="option.value || undefined">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value || undefined">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified
              </th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">
                      {{ (user.profile?.firstName?.[0] || user.email[0]).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'No name' }}
                    </p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="getRoleColor(user.role)"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(user.status)"
                >
                  {{ user.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="user.emailVerified" class="text-green-600">Yes</span>
                <span v-else class="text-gray-400">No</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="text-gray-600 hover:text-gray-900"
                    title="Change status"
                    @click="openStatusModal(user)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800"
                    title="Delete user"
                    @click="deleteUser(user)"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No users found
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
            {{ pagination.total }} users
          </p>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === 1"
              @click="pagination.page--; fetchUsers()"
            >
              Previous
            </button>
            <button
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              :disabled="pagination.page === pagination.totalPages"
              @click="pagination.page++; fetchUsers()"
            >
              Next
            </button>
          </div>
        </div>
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
            Changing status for: {{ selectedUser?.email }}
          </p>
          <div class="space-y-2 mb-6">
            <label
              v-for="option in statusOptions.slice(1)"
              :key="option.value"
              class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              :class="newStatus === option.value ? 'border-gray-900' : 'border-gray-200'"
            >
              <input
                v-model="newStatus"
                type="radio"
                :value="option.value"
                class="w-4 h-4 text-gray-900"
              />
              <span class="font-medium">{{ option.label }}</span>
            </label>
          </div>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              @click="showStatusModal = false"
            >
              Cancel
            </button>
            <UiButton
              :loading="isUpdating"
              :disabled="isUpdating"
              @click="updateStatus"
            >
              Update Status
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
