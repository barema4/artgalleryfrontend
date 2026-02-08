<script setup lang="ts">
defineProps<{
  story: {
    id: string
    title: string
    imageUrl: string
    category?: string
    readTime?: string
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/stories/${story.id}`"
    class="group flex-shrink-0 snap-start w-72 sm:w-80"
  >
    <div class="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100">
      <img
        :src="story.imageUrl"
        :alt="story.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-if="story.category" class="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
        {{ story.category }}
      </div>
    </div>
    <div class="mt-3">
      <h3 class="font-medium text-gray-900 line-clamp-2 group-hover:underline leading-snug">{{ story.title }}</h3>
      <p v-if="story.readTime" class="text-sm text-gray-500 mt-1">{{ story.readTime }}</p>
    </div>
  </NuxtLink>
</template>
