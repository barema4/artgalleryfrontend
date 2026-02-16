<script setup lang="ts">
import { useMagazineStore } from '~/stores/magazine'

const magazineStore = useMagazineStore()

const isLoading = ref(true)
const error = ref('')

async function fetchData() {
  isLoading.value = true
  error.value = ''

  const [editionsResult, featuredResult] = await Promise.all([
    magazineStore.fetchEditions({ sortBy: 'newest' }),
    magazineStore.fetchFeaturedEdition(),
  ])

  if (!editionsResult.success) {
    error.value = editionsResult.error || 'Failed to load magazine editions'
  }

  isLoading.value = false
}

async function loadMore() {
  if (magazineStore.pagination.page >= magazineStore.pagination.totalPages) return

  await magazineStore.fetchEditions({
    page: magazineStore.pagination.page + 1,
    sortBy: 'newest',
  })
}

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

onMounted(() => {
  fetchData()
})

useHead({
  title: 'Magazine | AfriCraft Gallery',
  meta: [
    { name: 'description', content: 'Explore our digital magazine featuring African art, artists, and culture.' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-bark-900 via-bark-800 to-earth-900 py-20 overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-pattern-african"></div>

      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-medium rounded-full mb-4">
            Digital Publication
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            AfriCraft Magazine
          </h1>
          <p class="text-xl text-earth-200 max-w-2xl mx-auto">
            Celebrating African artistry through in-depth features, artist profiles, and cultural exploration
          </p>
        </div>
      </div>
    </section>

    <!-- Featured Edition -->
    <section v-if="magazineStore.featuredEdition && !isLoading" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl font-display font-bold text-bark-800 mb-8">Latest Issue</h2>

        <NuxtLink
          :to="`/magazine/${magazineStore.featuredEdition.slug}`"
          class="group block bg-gradient-warm rounded-3xl overflow-hidden shadow-warm-lg hover:shadow-warm-xl transition-all duration-500"
        >
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Cover Image -->
            <div class="aspect-[3/4] md:aspect-auto overflow-hidden">
              <img
                :src="magazineStore.featuredEdition.coverImage"
                :alt="magazineStore.featuredEdition.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <!-- Info -->
            <div class="p-8 md:p-12 flex flex-col justify-center">
              <span class="inline-block px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full mb-4 w-fit">
                Issue #{{ magazineStore.featuredEdition.issueNumber }}
              </span>
              <h3 class="text-3xl md:text-4xl font-display font-bold text-bark-800 mb-4 group-hover:text-primary-600 transition-colors">
                {{ magazineStore.featuredEdition.title }}
              </h3>
              <p v-if="magazineStore.featuredEdition.description" class="text-lg text-bark-600 mb-6">
                {{ magazineStore.featuredEdition.description }}
              </p>
              <div class="flex items-center gap-4 text-bark-500">
                <span v-if="magazineStore.featuredEdition.publishedAt">
                  {{ formatDate(magazineStore.featuredEdition.publishedAt) }}
                </span>
                <span class="w-1 h-1 bg-bark-300 rounded-full"></span>
                <span>{{ magazineStore.featuredEdition.articleCount }} articles</span>
              </div>
              <div class="mt-8">
                <span class="inline-flex items-center gap-2 px-6 py-3 bg-bark-800 text-white font-semibold rounded-xl group-hover:bg-bark-900 transition-colors">
                  Read This Issue
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- All Editions -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl font-display font-bold text-bark-800 mb-8">All Issues</h2>

        <!-- Loading -->
        <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="animate-pulse">
            <div class="aspect-[3/4] bg-earth-200 rounded-2xl mb-4"></div>
            <div class="h-4 bg-earth-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-earth-200 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Error -->
        <UiAlert v-else-if="error" type="error" class="mb-6">
          {{ error }}
        </UiAlert>

        <!-- Editions Grid -->
        <div v-else-if="magazineStore.editions.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="edition in magazineStore.editions"
            :key="edition.id"
            :to="`/magazine/${edition.slug}`"
            class="group"
          >
            <div class="aspect-[3/4] bg-earth-100 rounded-2xl overflow-hidden mb-4 shadow-warm group-hover:shadow-warm-lg transition-all duration-300">
              <img
                :src="edition.coverImage"
                :alt="edition.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="space-y-1">
              <span class="text-sm text-primary-600 font-medium">Issue #{{ edition.issueNumber }}</span>
              <h3 class="font-semibold text-bark-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                {{ edition.title }}
              </h3>
              <p class="text-sm text-bark-500">
                {{ formatDate(edition.publishedAt) }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="text-xl font-semibold text-bark-800 mb-2">No issues yet</h3>
          <p class="text-bark-500">Check back soon for our upcoming magazine editions.</p>
        </div>

        <!-- Load More -->
        <div
          v-if="magazineStore.pagination.page < magazineStore.pagination.totalPages"
          class="text-center mt-12"
        >
          <button
            class="px-8 py-3 bg-white border-2 border-bark-800 text-bark-800 font-semibold rounded-xl hover:bg-bark-800 hover:text-white transition-colors"
            :disabled="magazineStore.loading"
            @click="loadMore"
          >
            <span v-if="magazineStore.loading">Loading...</span>
            <span v-else>Load More Issues</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Subscribe CTA -->
    <section class="py-16 bg-gradient-to-br from-primary-500 to-secondary-600">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-display font-bold text-white mb-4">Never Miss an Issue</h2>
        <p class="text-xl text-white/90 mb-8">
          Subscribe to our newsletter and be the first to know when new editions are published.
        </p>
        <NuxtLink
          to="/#newsletter"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-earth-50 transition-colors"
        >
          Subscribe Now
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
