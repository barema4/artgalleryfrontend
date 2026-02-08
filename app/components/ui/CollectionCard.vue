<script setup lang="ts">
defineProps<{
  collection: {
    id: string
    title: string
    imageUrl: string
    itemCount?: number
    description?: string
  }
  size?: 'small' | 'medium' | 'large'
}>()
</script>

<template>
  <NuxtLink
    :to="`/collections/${collection.id}`"
    class="group flex-shrink-0 snap-start relative overflow-hidden rounded-2xl"
    :class="{
      'w-64 h-40 sm:w-72 sm:h-44': size === 'small',
      'w-80 h-48 sm:w-96 sm:h-56': size === 'medium' || !size,
      'w-96 h-56 sm:w-[28rem] sm:h-64': size === 'large'
    }"
  >
    <!-- Background Image -->
    <img
      :src="collection.imageUrl"
      :alt="collection.title"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    <!-- Content -->
    <div class="absolute inset-0 p-5 flex flex-col justify-end">
      <h3 class="text-white font-semibold text-lg sm:text-xl line-clamp-2">{{ collection.title }}</h3>
      <p v-if="collection.itemCount" class="text-white/70 text-sm mt-1">
        {{ collection.itemCount }} items
      </p>
    </div>
  </NuxtLink>
</template>
