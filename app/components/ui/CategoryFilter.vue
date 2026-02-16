<script setup lang="ts">
import type { Category } from '~/types/category'

const props = defineProps<{
  categories: Category[]
  selectedSlug?: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [categorySlug: string | null]
}>()

const expandedSlugs = ref<Set<string>>(new Set())

function toggleExpand(categorySlug: string) {
  if (expandedSlugs.value.has(categorySlug)) {
    expandedSlugs.value.delete(categorySlug)
  } else {
    expandedSlugs.value.add(categorySlug)
  }
}

function isExpanded(categorySlug: string): boolean {
  return expandedSlugs.value.has(categorySlug)
}

function selectCategory(categorySlug: string | null) {
  emit('select', categorySlug)
}

function hasChildren(category: Category): boolean {
  return !!category.children && category.children.length > 0
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 bg-gradient-warm border-b border-earth-100">
      <h3 class="font-semibold text-bark-800">Categories</h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-4 space-y-3">
      <div v-for="i in 5" :key="i" class="h-8 bg-earth-100 rounded-lg animate-pulse" />
    </div>

    <!-- Categories List -->
    <div v-else class="p-2">
      <!-- All Categories Option -->
      <button
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
        :class="!selectedSlug
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-bark-600 hover:bg-earth-50 hover:text-bark-800'"
        @click="selectCategory(null)"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span class="flex-1">All Categories</span>
      </button>

      <!-- Category Items -->
      <div v-for="category in categories" :key="category.slug" class="mt-1">
        <div class="flex items-center">
          <!-- Expand Button (if has children) -->
          <button
            v-if="hasChildren(category)"
            class="p-1.5 text-bark-400 hover:text-bark-600 transition-colors"
            @click="toggleExpand(category.slug)"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-90': isExpanded(category.slug) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div v-else class="w-7" />

          <!-- Category Button -->
          <button
            class="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
            :class="selectedSlug === category.slug
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-bark-600 hover:bg-earth-50 hover:text-bark-800'"
            @click="selectCategory(category.slug)"
          >
            <span class="flex-1 truncate">{{ category.name }}</span>
            <span
              v-if="category.artworkCount"
              class="text-xs px-2 py-0.5 rounded-full"
              :class="selectedSlug === category.slug ? 'bg-primary-100 text-primary-600' : 'bg-earth-100 text-bark-500'"
            >
              {{ category.artworkCount }}
            </span>
          </button>
        </div>

        <!-- Children (Subcategories) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="hasChildren(category) && isExpanded(category.slug)" class="ml-7 mt-1 space-y-1 overflow-hidden">
            <button
              v-for="child in category.children"
              :key="child.slug"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200"
              :class="selectedSlug === child.slug
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-bark-500 hover:bg-earth-50 hover:text-bark-700'"
              @click="selectCategory(child.slug)"
            >
              <span class="flex-1 truncate">{{ child.name }}</span>
              <span
                v-if="child.artworkCount"
                class="text-xs px-1.5 py-0.5 rounded-full"
                :class="selectedSlug === child.slug ? 'bg-primary-100 text-primary-600' : 'bg-earth-100 text-bark-400'"
              >
                {{ child.artworkCount }}
              </span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && categories.length === 0" class="py-8 text-center">
        <svg class="w-12 h-12 mx-auto text-earth-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-sm text-bark-500">No categories available</p>
      </div>
    </div>
  </div>
</template>
