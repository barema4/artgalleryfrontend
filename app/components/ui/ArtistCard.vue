<script setup lang="ts">
defineProps<{
  artist: {
    id: string
    name: string
    imageUrl: string
    artworksCount?: number
    bio?: string
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/artists/${artist.id}`"
    class="group flex-shrink-0 snap-start w-40 sm:w-48"
  >
    <div class="relative">
      <div class="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg group-hover:ring-gray-200 transition-all">
        <img
          :src="artist.imageUrl"
          :alt="artist.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </div>
    <div class="mt-4 text-center">
      <h3 class="font-medium text-gray-900 group-hover:underline">{{ artist.name }}</h3>
      <p v-if="artist.artworksCount" class="text-sm text-gray-500 mt-0.5">
        {{ artist.artworksCount }} artworks
      </p>
    </div>
  </NuxtLink>
</template>
