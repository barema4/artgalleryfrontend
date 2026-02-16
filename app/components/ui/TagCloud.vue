<script setup lang="ts">
import type { Tag } from '~/types/category'

const props = defineProps<{
  tags: Tag[]
  selectedSlug?: string | null
  loading?: boolean
  title?: string
}>()

const emit = defineEmits<{
  select: [tagSlug: string | null]
}>()

function selectTag(tagSlug: string | null) {
  emit('select', tagSlug)
}

function getTagSize(tag: Tag): string {
  const count = tag.artworkCount || 0
  if (count >= 50) return 'text-base font-semibold'
  if (count >= 20) return 'text-sm font-medium'
  return 'text-sm'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 bg-gradient-warm border-b border-earth-100 flex items-center justify-between">
      <h3 class="font-semibold text-bark-800">{{ title || 'Popular Tags' }}</h3>
      <button
        v-if="selectedSlug"
        class="text-xs text-primary-600 hover:text-primary-700 font-medium"
        @click="selectTag(null)"
      >
        Clear
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 flex flex-wrap gap-2">
      <div v-for="i in 8" :key="i" class="h-8 w-20 bg-earth-100 rounded-full animate-pulse" />
    </div>

    <!-- Tags -->
    <div v-else class="p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag.id"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200"
          :class="[
            getTagSize(tag),
            selectedSlug === tag.slug
              ? 'bg-primary-500 text-white shadow-warm'
              : 'bg-earth-100 text-bark-600 hover:bg-earth-200 hover:text-bark-800'
          ]"
          @click="selectTag(selectedSlug === tag.slug ? null : tag.slug)"
        >
          <span>#{{ tag.name }}</span>
          <span
            v-if="tag.artworkCount"
            class="text-xs px-1.5 py-0.5 rounded-full"
            :class="selectedSlug === tag.slug ? 'bg-white/20 text-white' : 'bg-earth-200 text-bark-500'"
          >
            {{ tag.artworkCount }}
          </span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && tags.length === 0" class="py-6 text-center">
        <svg class="w-10 h-10 mx-auto text-earth-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p class="text-sm text-bark-500">No tags available</p>
      </div>
    </div>
  </div>
</template>
