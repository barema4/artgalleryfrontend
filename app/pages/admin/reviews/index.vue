<script setup lang="ts">
import type { Review, ReviewListParams } from '~/types/review'
import { useReviewService } from '~/services/review.service'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard',
})

const reviewService = useReviewService()

const reviews = ref<Review[]>([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const filters = ref<ReviewListParams & { search?: string }>({
  search: '',
  sortBy: 'newest',
  minRating: undefined,
})

const ratingOptions = [
  { value: undefined, label: 'All Ratings' },
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
]

// Delete confirmation
const showDeleteModal = ref(false)
const reviewToDelete = ref<Review | null>(null)
const isDeleting = ref(false)

// Detail view
const selectedReview = ref<Review | null>(null)

async function fetchReviews() {
  loading.value = true
  error.value = ''

  try {
    const response = await reviewService.getAllReviews({
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value,
    })
    reviews.value = response.data
    pagination.value = {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load reviews'
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  pagination.value.page = 1
  fetchReviews()
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchReviews()
}

function confirmDelete(review: Review) {
  reviewToDelete.value = review
  showDeleteModal.value = true
}

async function deleteReview() {
  if (!reviewToDelete.value) return

  isDeleting.value = true
  try {
    await reviewService.adminDeleteReview(reviewToDelete.value.id)
    reviews.value = reviews.value.filter(r => r.id !== reviewToDelete.value!.id)
    pagination.value.total--
    showDeleteModal.value = false
    reviewToDelete.value = null
    successMessage.value = 'Review deleted successfully'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete review'
  } finally {
    isDeleting.value = false
  }
}

function viewReview(review: Review) {
  selectedReview.value = review
}

function closeDetail() {
  selectedReview.value = null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUserName(review: Review) {
  if (review.user?.firstName || review.user?.lastName) {
    return `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim()
  }
  return 'Anonymous'
}

function renderStars(rating: number) {
  return Array(5).fill(0).map((_, i) => i < rating ? 'filled' : 'empty')
}

onMounted(() => {
  fetchReviews()
})

useHead({
  title: 'Manage Reviews | Admin',
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Reviews</h1>
          <p class="text-gray-600 mt-1">Moderate and manage user reviews</p>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <p class="text-green-800">{{ successMessage }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search reviews..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="handleFilterChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select
              v-model="filters.minRating"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="handleFilterChange"
            >
              <option v-for="opt in ratingOptions" :key="String(opt.value)" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="handleFilterChange"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Reviews List -->
    <div v-else-if="reviews.length > 0" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-4">
          <!-- Artwork Image -->
          <div class="flex-shrink-0">
            <img
              v-if="review.artwork?.primaryImage"
              :src="review.artwork.primaryImage"
              :alt="review.artwork?.title"
              class="w-16 h-16 rounded-lg object-cover"
            />
            <div v-else class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Review Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <!-- Rating -->
                <div class="flex items-center gap-1 mb-1">
                  <template v-for="(star, index) in renderStars(review.rating)" :key="index">
                    <svg
                      class="w-4 h-4"
                      :class="star === 'filled' ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </template>
                  <span class="text-sm text-gray-500 ml-2">{{ review.rating }}/5</span>
                  <span
                    v-if="review.isVerifiedPurchase"
                    class="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    Verified Purchase
                  </span>
                </div>

                <!-- Title & Artwork -->
                <h3 class="font-medium text-gray-900">
                  {{ review.title || 'No title' }}
                </h3>
                <p class="text-sm text-gray-500">
                  on <NuxtLink
                    v-if="review.artwork"
                    :to="`/artworks/${review.artwork.slug}`"
                    class="text-blue-600 hover:underline"
                  >
                    {{ review.artwork.title }}
                  </NuxtLink>
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="View Details"
                  @click="viewReview(review)"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  class="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete Review"
                  @click="confirmDelete(review)"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Review Text Preview -->
            <p v-if="review.content" class="mt-2 text-gray-600 text-sm line-clamp-2">
              {{ review.content }}
            </p>

            <!-- Meta -->
            <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>By {{ getUserName(review) }}</span>
              <span>{{ formatDate(review.createdAt) }}</span>
              <span v-if="review.helpful > 0">{{ review.helpful }} found helpful</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between pt-4">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }}
          to {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          of {{ pagination.total }} reviews
        </div>
        <div class="flex gap-2">
          <button
            :disabled="pagination.page === 1"
            class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </button>
          <button
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
      <p class="text-gray-600">Reviews from users will appear here</p>
    </div>

    <!-- Review Detail Modal -->
    <div
      v-if="selectedReview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeDetail"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Review Details</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeDetail">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Artwork Info -->
        <div v-if="selectedReview.artwork" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <img
            v-if="selectedReview.artwork.primaryImage"
            :src="selectedReview.artwork.primaryImage"
            :alt="selectedReview.artwork.title"
            class="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <p class="font-medium text-gray-900">{{ selectedReview.artwork.title }}</p>
            <NuxtLink
              :to="`/artworks/${selectedReview.artwork.slug}`"
              class="text-sm text-blue-600 hover:underline"
            >
              View Artwork
            </NuxtLink>
          </div>
        </div>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex">
            <template v-for="(star, index) in renderStars(selectedReview.rating)" :key="index">
              <svg
                class="w-6 h-6"
                :class="star === 'filled' ? 'text-yellow-400' : 'text-gray-300'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </template>
          </div>
          <span class="text-lg font-medium">{{ selectedReview.rating }}/5</span>
          <span
            v-if="selectedReview.isVerifiedPurchase"
            class="px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded-full"
          >
            Verified Purchase
          </span>
        </div>

        <!-- Title -->
        <h4 v-if="selectedReview.title" class="text-xl font-medium text-gray-900 mb-2">
          {{ selectedReview.title }}
        </h4>

        <!-- Content -->
        <p v-if="selectedReview.content" class="text-gray-600 whitespace-pre-line mb-4">
          {{ selectedReview.content }}
        </p>
        <p v-else class="text-gray-400 italic mb-4">No review content</p>

        <!-- Meta -->
        <div class="border-t pt-4 space-y-2 text-sm text-gray-500">
          <p><span class="font-medium">Reviewer:</span> {{ getUserName(selectedReview) }}</p>
          <p><span class="font-medium">User ID:</span> {{ selectedReview.userId }}</p>
          <p><span class="font-medium">Created:</span> {{ formatDate(selectedReview.createdAt) }}</p>
          <p><span class="font-medium">Updated:</span> {{ formatDate(selectedReview.updatedAt) }}</p>
          <p><span class="font-medium">Helpful votes:</span> {{ selectedReview.helpful }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            @click="closeDetail"
          >
            Close
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            @click="confirmDelete(selectedReview); closeDetail()"
          >
            Delete Review
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
            <h3 class="text-lg font-semibold text-gray-900">Delete Review</h3>
            <p class="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete this {{ reviewToDelete?.rating }}-star review
          <span v-if="reviewToDelete?.title">titled "{{ reviewToDelete.title }}"</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            :disabled="isDeleting"
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            :disabled="isDeleting"
            @click="deleteReview"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Review' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
