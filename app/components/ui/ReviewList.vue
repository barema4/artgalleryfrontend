<script setup lang="ts">
import type { Review, ReviewStats, ReviewListParams } from '~/types/review'

const props = defineProps<{
  reviews: Review[]
  stats?: ReviewStats | null
  loading?: boolean
  pagination?: {
    total: number
    page: number
    totalPages: number
  }
  currentUserId?: string
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  loadMore: []
  sort: [sortBy: ReviewListParams['sortBy']]
  helpful: [id: string]
  edit: [review: Review]
  delete: [id: string]
}>()

const sortBy = ref<ReviewListParams['sortBy']>('newest')

const sortOptions = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
]

function handleSortChange() {
  emit('sort', sortBy.value)
}

function getRatingPercentage(count: number): number {
  if (!props.stats?.totalReviews) return 0
  return Math.round((count / props.stats.totalReviews) * 100)
}

function canEditReview(review: Review): boolean {
  return review.userId === props.currentUserId
}

function canDeleteReview(review: Review): boolean {
  return review.userId === props.currentUserId || props.isAdmin
}
</script>

<template>
  <div>
    <!-- Summary Section -->
    <div v-if="stats" class="bg-white rounded-2xl border border-earth-100 p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-start gap-8">
        <!-- Average Rating -->
        <div class="text-center lg:text-left lg:w-48 flex-shrink-0">
          <div class="text-5xl font-bold text-bark-800">{{ stats.averageRating.toFixed(1) }}</div>
          <UiStarRating :model-value="stats.averageRating" readonly size="md" class="mt-2 justify-center lg:justify-start" />
          <p class="text-bark-500 mt-2">{{ stats.totalReviews }} review{{ stats.totalReviews !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Rating Distribution -->
        <div class="flex-1">
          <div class="space-y-2">
            <div
              v-for="star in [5, 4, 3, 2, 1]"
              :key="star"
              class="flex items-center gap-3"
            >
              <span class="w-8 text-sm text-bark-600 text-right">{{ star }} star</span>
              <div class="flex-1 h-2 bg-earth-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-kente-gold rounded-full transition-all duration-500"
                  :style="{ width: `${getRatingPercentage(stats.ratingDistribution[star as 1|2|3|4|5])}%` }"
                />
              </div>
              <span class="w-12 text-sm text-bark-500">
                {{ stats.ratingDistribution[star as 1|2|3|4|5] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sort & Filter Bar -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-bark-800">
        {{ stats?.totalReviews || reviews.length }} Review{{ (stats?.totalReviews || reviews.length) !== 1 ? 's' : '' }}
      </h3>
      <div class="flex items-center gap-2">
        <label class="text-sm text-bark-500">Sort by:</label>
        <select
          v-model="sortBy"
          class="px-3 py-2 text-sm border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          @change="handleSortChange"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && reviews.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-earth-100 p-5">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-earth-100 rounded-full animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-earth-100 rounded animate-pulse w-1/4" />
            <div class="h-3 bg-earth-100 rounded animate-pulse w-1/6" />
          </div>
          <div class="h-4 bg-earth-100 rounded animate-pulse w-20" />
        </div>
        <div class="mt-4 space-y-2">
          <div class="h-4 bg-earth-100 rounded animate-pulse w-full" />
          <div class="h-4 bg-earth-100 rounded animate-pulse w-2/3" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="bg-white rounded-2xl border border-earth-100 py-12 text-center">
      <svg class="w-16 h-16 mx-auto text-earth-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="text-lg font-medium text-bark-700 mb-1">No reviews yet</h3>
      <p class="text-bark-500">Be the first to share your thoughts!</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-4">
      <UiReviewCard
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        :can-edit="canEditReview(review)"
        :can-delete="canDeleteReview(review)"
        @helpful="emit('helpful', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>

    <!-- Load More -->
    <div v-if="pagination && pagination.page < pagination.totalPages" class="mt-8 text-center">
      <button
        class="px-6 py-2.5 border border-earth-200 text-bark-600 font-medium rounded-xl hover:bg-earth-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 transition-all"
        :disabled="loading"
        @click="emit('loadMore')"
      >
        <span v-if="loading" class="inline-flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
        <span v-else>Load More Reviews</span>
      </button>
    </div>
  </div>
</template>
