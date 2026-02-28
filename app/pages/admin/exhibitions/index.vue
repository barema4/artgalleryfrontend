<script setup lang="ts">
import { ExhibitionStatus, ExhibitionType } from '~/types/exhibition'
import { useExhibitionsStore } from '~/stores/exhibitions'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const exhibitionsStore = useExhibitionsStore()

const filters = ref({
  search: '',
  status: undefined as ExhibitionStatus | undefined,
  type: undefined as ExhibitionType | undefined,
})

async function fetchExhibitions() {
  await exhibitionsStore.fetchExhibitions({
    ...filters.value,
    limit: 20,
  })
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case ExhibitionStatus.DRAFT:
      return 'bg-gray-100 text-gray-800'
    case ExhibitionStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-800'
    case ExhibitionStatus.LIVE:
      return 'bg-green-100 text-green-800'
    case ExhibitionStatus.ENDED:
      return 'bg-gray-100 text-gray-600'
    case ExhibitionStatus.ARCHIVED:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchExhibitions()
})

useHead({
  title: 'Manage Exhibitions | Admin',
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Exhibitions</h1>
          <p class="text-gray-600 mt-1">Manage your art exhibitions and virtual tours</p>
        </div>
        <NuxtLink
          to="/admin/exhibitions/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Exhibition
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search exhibitions..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="fetchExhibitions"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchExhibitions"
            >
              <option :value="undefined">All Status</option>
              <option :value="ExhibitionStatus.DRAFT">Draft</option>
              <option :value="ExhibitionStatus.SCHEDULED">Scheduled</option>
              <option :value="ExhibitionStatus.LIVE">Live</option>
              <option :value="ExhibitionStatus.ENDED">Ended</option>
              <option :value="ExhibitionStatus.ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchExhibitions"
            >
              <option :value="undefined">All Types</option>
              <option :value="ExhibitionType.GALLERY">Gallery</option>
              <option :value="ExhibitionType.VIRTUAL_TOUR">Virtual Tour</option>
              <option :value="ExhibitionType.FEATURED">Featured</option>
              <option :value="ExhibitionType.POPUP">Pop-up</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="exhibitionsStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="exhibitionsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p class="text-red-800">{{ exhibitionsStore.error }}</p>
    </div>

    <!-- Table -->
    <div v-else-if="exhibitionsStore.exhibitions.length > 0" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhibition</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artworks</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="exhibition in exhibitionsStore.exhibitions" :key="exhibition.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="exhibition.coverImage"
                      :src="exhibition.coverImage"
                      :alt="exhibition.title"
                      class="h-10 w-10 rounded-lg object-cover"
                    />
                    <div v-else class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ exhibition.title }}</div>
                    <div class="text-sm text-gray-500">{{ exhibition.slug }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ exhibition.type }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStatusBadgeClass(exhibition.status)"
                >
                  {{ exhibition.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ formatDate(exhibition.startDate) }}</div>
                <div>{{ formatDate(exhibition.endDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ exhibition.artworkCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ exhibition.viewCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink
                  :to="`/exhibitions/${exhibition.slug}`"
                  class="text-primary-600 hover:text-primary-900 mr-3"
                  target="_blank"
                >
                  View
                </NuxtLink>
                <NuxtLink
                  :to="`/admin/exhibitions/${exhibition.id}`"
                  class="text-gray-600 hover:text-gray-900"
                >
                  Edit
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="exhibitionsStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ (exhibitionsStore.pagination.page - 1) * exhibitionsStore.pagination.limit + 1 }} 
          to {{ Math.min(exhibitionsStore.pagination.page * exhibitionsStore.pagination.limit, exhibitionsStore.pagination.total) }} 
          of {{ exhibitionsStore.pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            :disabled="exhibitionsStore.pagination.page === 1"
            class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="fetchExhibitions"
          >
            Previous
          </button>
          <button
            :disabled="exhibitionsStore.pagination.page === exhibitionsStore.pagination.totalPages"
            class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="fetchExhibitions"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No exhibitions yet</h3>
      <p class="text-gray-600 mb-4">Get started by creating your first exhibition</p>
      <NuxtLink
        to="/admin/exhibitions/new"
        class="inline-flex px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Create Exhibition
      </NuxtLink>
    </div>
  </div>
</template>
