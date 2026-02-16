<script setup lang="ts">
defineProps<{
  artwork: {
    id: string
    slug?: string
    title: string
    artist: string
    imageUrl: string
    category?: string
    year?: number
  }
  size?: 'small' | 'medium' | 'large'
  showInfo?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="`/artworks/${artwork.slug || artwork.id}`"
    class="group flex-shrink-0 snap-start"
    :class="{
      'w-48 sm:w-56': size === 'small',
      'w-64 sm:w-72': size === 'medium' || !size,
      'w-80 sm:w-96': size === 'large'
    }"
  >
    <div
      class="relative overflow-hidden rounded-xl bg-gray-100"
      :class="{
        'aspect-[3/4]': size === 'small' || size === 'large',
        'aspect-[4/5]': size === 'medium' || !size
      }"
    >
      <img
        :src="artwork.imageUrl"
        :alt="artwork.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <!-- Overlay on hover -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <!-- Info -->
    <div v-if="showInfo !== false" class="mt-3">
      <h3 class="font-medium text-gray-900 line-clamp-1 group-hover:underline">{{ artwork.title }}</h3>
      <p class="text-sm text-gray-600 mt-0.5">{{ artwork.artist }}</p>
      <p v-if="artwork.year" class="text-xs text-gray-400 mt-0.5">{{ artwork.year }}</p>
    </div>
  </NuxtLink>
</template>
