<script setup lang="ts">
import type { Review, CreateReviewData, UpdateReviewData } from '~/types/review'

const props = defineProps<{
  artworkId?: string
  editReview?: Review | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateReviewData | UpdateReviewData]
  cancel: []
}>()

const rating = ref(props.editReview?.rating || 0)
const title = ref(props.editReview?.title || '')
const content = ref(props.editReview?.content || '')
const error = ref('')

const isEditing = computed(() => !!props.editReview)

const ratingLabels = [
  '',
  'Poor - Did not meet expectations',
  'Fair - Below average',
  'Good - Meets expectations',
  'Very Good - Above average',
  'Excellent - Exceeded expectations',
]

const ratingLabel = computed(() => {
  return ratingLabels[rating.value] || 'Select a rating'
})

const isValid = computed(() => {
  return rating.value >= 1 && rating.value <= 5
})

watch(() => props.editReview, (newVal) => {
  if (newVal) {
    rating.value = newVal.rating
    title.value = newVal.title || ''
    content.value = newVal.content || ''
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  rating.value = 0
  title.value = ''
  content.value = ''
  error.value = ''
}

function handleSubmit() {
  error.value = ''

  if (!isValid.value) {
    error.value = 'Please select a rating'
    return
  }

  const data: CreateReviewData | UpdateReviewData = {
    rating: rating.value,
    title: title.value.trim() || undefined,
    content: content.value.trim() || undefined,
  }

  emit('submit', data)
}

function handleCancel() {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-earth-100 p-6">
    <h3 class="text-lg font-semibold text-bark-800 mb-4">
      {{ isEditing ? 'Edit Your Review' : 'Write a Review' }}
    </h3>

    <form @submit.prevent="handleSubmit">
      <!-- Rating -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-bark-700 mb-2">
          Your Rating <span class="text-kente-red">*</span>
        </label>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <UiStarRating v-model="rating" size="lg" />
          <span class="text-sm text-bark-500">{{ ratingLabel }}</span>
        </div>
      </div>

      <!-- Title -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-bark-700 mb-2">
          Review Title
          <span class="text-bark-400 font-normal">(optional)</span>
        </label>
        <input
          v-model="title"
          type="text"
          placeholder="Summarize your experience"
          maxlength="100"
          class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
        <p class="mt-1 text-xs text-bark-400 text-right">{{ title.length }}/100</p>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-bark-700 mb-2">
          Your Review
          <span class="text-bark-400 font-normal">(optional)</span>
        </label>
        <textarea
          v-model="content"
          rows="4"
          placeholder="Share your thoughts about this artwork..."
          maxlength="2000"
          class="w-full px-4 py-3 border border-earth-200 rounded-xl bg-white text-bark-700 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
        ></textarea>
        <p class="mt-1 text-xs text-bark-400 text-right">{{ content.length }}/2000</p>
      </div>

      <!-- Error -->
      <UiAlert v-if="error" type="error" class="mb-4" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <button
          v-if="isEditing"
          type="button"
          class="px-6 py-2.5 text-bark-600 hover:text-bark-800 font-medium transition-colors"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :disabled="!isValid || loading"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ isEditing ? 'Updating...' : 'Submitting...' }}
          </span>
          <span v-else>{{ isEditing ? 'Update Review' : 'Submit Review' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
