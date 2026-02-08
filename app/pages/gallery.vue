<script setup lang="ts">
import { useArtworksStore } from '~/stores/artworks'

const artworksStore = useArtworksStore()
const { artworks, loading, error } = storeToRefs(artworksStore)

const selectedCategory = ref<string | null>(null)

const filteredArtworks = computed(() => {
  if (selectedCategory.value) {
    return artworksStore.byCategory(selectedCategory.value)
  }
  return artworks.value
})

const categories = computed(() => {
  const cats = new Set(artworks.value.map((a) => a.category))
  return Array.from(cats)
})

function clearFilter() {
  selectedCategory.value = null
}

await useAsyncData('artworks', () => artworksStore.fetchArtworks())
</script>

<template>
  <div class="py-8 lg:py-12">
    <!-- Header -->
    <header class="text-center mb-10 px-4">
      <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Art Gallery</h1>
      <p class="text-gray-600 text-lg">Discover unique artworks from talented artists</p>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      <p class="mt-4 text-gray-600">Loading artworks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <template v-else>
      <!-- Filters -->
      <nav v-if="categories.length > 0" class="flex flex-wrap gap-2 justify-center mb-10 px-4">
        <button
          class="px-5 py-2 text-sm font-medium rounded-full border transition-all duration-200"
          :class="!selectedCategory
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
          @click="clearFilter"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category"
          class="px-5 py-2 text-sm font-medium rounded-full border transition-all duration-200"
          :class="selectedCategory === category
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </nav>

      <!-- Empty State -->
      <div v-if="filteredArtworks.length === 0" class="text-center py-16">
        <p class="text-gray-600">No artworks available</p>
      </div>

      <!-- Artworks Grid -->
      <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <article
            v-for="artwork in filteredArtworks"
            :key="artwork.id"
            class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Image -->
            <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                :src="artwork.imageUrl"
                :alt="artwork.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span
                v-if="artwork.sold"
                class="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-md"
              >
                Sold
              </span>
            </div>

            <!-- Info -->
            <div class="p-5">
              <h2 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {{ artwork.title }}
              </h2>
              <p class="text-gray-600 text-sm mb-1">{{ artwork.artist }}</p>
              <p class="text-gray-400 text-sm mb-1">{{ artwork.year }}</p>
              <p class="text-gray-500 text-xs uppercase tracking-wide mb-3">
                {{ artwork.category }}
              </p>
              <p class="text-xl font-bold text-gray-900">
                ${{ artwork.price.toLocaleString() }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </template>
  </div>
</template>
