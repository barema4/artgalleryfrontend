<script setup lang="ts">
import type { Review } from '~/types/review'

const props = defineProps<{
  review: Review
  showArtwork?: boolean
  canEdit?: boolean
  canDelete?: boolean
}>()

const emit = defineEmits<{
  edit: [review: Review]
  delete: [id: string]
  helpful: [id: string]
}>()

const isExpanded = ref(false)

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getInitials(user?: { firstName?: string; lastName?: string }): string {
  if (!user) return '?'
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

function getUserName(user?: { firstName?: string; lastName?: string }): string {
  if (!user) return 'Anonymous'
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return user.firstName || user.lastName || 'Anonymous'
}

const contentPreview = computed(() => {
  if (!props.review.content) return ''
  if (props.review.content.length <= 200 || isExpanded.value) {
    return props.review.content
  }
  return props.review.content.substring(0, 200) + '...'
})

const hasMoreContent = computed(() => {
  return (props.review.content?.length || 0) > 200
})
</script>

<template>
  <div class="bg-white rounded-xl border border-earth-100 p-5 transition-all hover:border-earth-200">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <img
            v-if="review.user?.avatar"
            :src="review.user.avatar"
            :alt="getUserName(review.user)"
            class="w-full h-full rounded-full object-cover"
          />
          <span v-else class="text-sm font-medium text-primary-600">
            {{ getInitials(review.user) }}
          </span>
        </div>

        <!-- User Info -->
        <div>
          <div class="flex items-center gap-2">
            <span class="font-medium text-bark-800">{{ getUserName(review.user) }}</span>
            <span
              v-if="review.isVerifiedPurchase"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Verified Purchase
            </span>
          </div>
          <p class="text-sm text-bark-400">{{ formatDate(review.createdAt) }}</p>
        </div>
      </div>

      <!-- Rating -->
      <UiStarRating :model-value="review.rating" readonly size="sm" />
    </div>

    <!-- Artwork (if shown) -->
    <NuxtLink
      v-if="showArtwork && review.artwork"
      :to="`/artworks/${review.artwork.slug}`"
      class="flex items-center gap-3 mt-4 p-3 bg-earth-50 rounded-lg hover:bg-earth-100 transition-colors"
    >
      <div class="w-12 h-12 rounded-lg overflow-hidden bg-earth-200 flex-shrink-0">
        <img
          v-if="review.artwork.primaryImage"
          :src="review.artwork.primaryImage"
          :alt="review.artwork.title"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="min-w-0">
        <p class="font-medium text-bark-700 truncate">{{ review.artwork.title }}</p>
        <p class="text-xs text-bark-400">View Artwork</p>
      </div>
    </NuxtLink>

    <!-- Review Content -->
    <div class="mt-4">
      <h4 v-if="review.title" class="font-semibold text-bark-800 mb-2">{{ review.title }}</h4>
      <p v-if="review.content" class="text-bark-600 text-sm leading-relaxed">
        {{ contentPreview }}
      </p>
      <button
        v-if="hasMoreContent"
        class="text-primary-600 text-sm font-medium mt-1 hover:text-primary-700"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'Show less' : 'Read more' }}
      </button>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between mt-4 pt-4 border-t border-earth-100">
      <!-- Helpful -->
      <button
        class="inline-flex items-center gap-1.5 text-sm text-bark-500 hover:text-bark-700 transition-colors"
        @click="emit('helpful', review.id)"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>Helpful ({{ review.helpful }})</span>
      </button>

      <!-- Actions -->
      <div v-if="canEdit || canDelete" class="flex items-center gap-2">
        <button
          v-if="canEdit"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          @click="emit('edit', review)"
        >
          Edit
        </button>
        <button
          v-if="canDelete"
          class="text-sm text-kente-red hover:text-red-700 font-medium"
          @click="emit('delete', review.id)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
