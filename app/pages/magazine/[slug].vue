<script setup lang="ts">
import { useMagazineStore } from '~/stores/magazine'

const route = useRoute()
const magazineStore = useMagazineStore()

const slug = computed(() => route.params.slug as string)

const isLoading = ref(true)
const error = ref('')

async function fetchData() {
  isLoading.value = true
  error.value = ''

  const editionResult = await magazineStore.fetchEditionBySlug(slug.value)

  if (!editionResult.success) {
    error.value = editionResult.error || 'Failed to load magazine edition'
    isLoading.value = false
    return
  }

  if (magazineStore.currentEdition) {
    await magazineStore.fetchArticles({
      editionId: magazineStore.currentEdition.id,
      sortBy: 'newest',
    })
  }

  isLoading.value = false
}

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })
}

onMounted(() => {
  fetchData()
})

watch(slug, () => {
  fetchData()
})

onUnmounted(() => {
  magazineStore.clearCurrentEdition()
})

useHead(() => ({
  title: magazineStore.currentEdition?.title
    ? `${magazineStore.currentEdition.title} | AfriCraft Magazine`
    : 'Magazine | AfriCraft Gallery',
  meta: [
    {
      name: 'description',
      content: magazineStore.currentEdition?.description || 'Read our latest magazine edition',
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream">
    <div v-if="isLoading" class="py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="animate-pulse">
          <div class="h-8 bg-earth-200 rounded w-1/4 mb-4"></div>
          <div class="h-12 bg-earth-200 rounded w-3/4 mb-8"></div>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="aspect-[3/4] bg-earth-200 rounded-2xl"></div>
            <div class="space-y-4">
              <div class="h-4 bg-earth-200 rounded w-full"></div>
              <div class="h-4 bg-earth-200 rounded w-full"></div>
              <div class="h-4 bg-earth-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto py-16 px-4 text-center">
      <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Issue Not Found</h1>
      <p class="text-bark-500 mb-6">{{ error }}</p>
      <NuxtLink
        to="/magazine"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Magazine
      </NuxtLink>
    </div>

    <div v-else-if="magazineStore.currentEdition">
      <section class="relative bg-gradient-to-br from-bark-900 via-bark-800 to-earth-900 py-12 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4">
          <nav class="mb-8">
            <ol class="flex items-center gap-2 text-sm text-earth-300">
              <li>
                <NuxtLink to="/magazine" class="hover:text-white transition-colors">Magazine</NuxtLink>
              </li>
              <li>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li class="text-white">Issue #{{ magazineStore.currentEdition.issueNumber }}</li>
            </ol>
          </nav>

          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <img
                :src="magazineStore.currentEdition.coverImage"
                :alt="magazineStore.currentEdition.title"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="text-white">
              <span class="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-medium rounded-full mb-4">
                Issue #{{ magazineStore.currentEdition.issueNumber }}
              </span>
              <h1 class="text-4xl md:text-5xl font-display font-bold mb-6">
                {{ magazineStore.currentEdition.title }}
              </h1>
              <p v-if="magazineStore.currentEdition.description" class="text-xl text-earth-200 mb-8">
                {{ magazineStore.currentEdition.description }}
              </p>
              <div class="flex flex-wrap items-center gap-6 text-earth-300 mb-8">
                <span v-if="magazineStore.currentEdition.publishedAt" class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(magazineStore.currentEdition.publishedAt) }}
                </span>
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  {{ magazineStore.currentEdition.articleCount }} articles
                </span>
              </div>

              <div v-if="magazineStore.currentEdition.pdfUrl" class="flex gap-4">
                <a
                  :href="magazineStore.currentEdition.pdfUrl"
                  target="_blank"
                  class="inline-flex items-center gap-2 px-6 py-3 bg-white text-bark-800 font-semibold rounded-xl hover:bg-earth-100 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4">
          <h2 class="text-2xl font-display font-bold text-bark-800 mb-8">In This Issue</h2>

          <div v-if="magazineStore.articles.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <NuxtLink
              v-for="article in magazineStore.articles"
              :key="article.id"
              :to="`/magazine/articles/${article.slug}`"
              class="group bg-white rounded-2xl overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300"
            >
              <div class="aspect-[16/10] bg-earth-100 overflow-hidden">
                <img
                  v-if="article.coverImage"
                  :src="article.coverImage"
                  :alt="article.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-12 h-12 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>

              <div class="p-6">
                <div v-if="article.category" class="mb-2">
                  <span class="text-sm text-primary-600 font-medium">{{ article.category.name }}</span>
                </div>

                <h3 class="text-lg font-semibold text-bark-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {{ article.title }}
                </h3>

                <p v-if="article.excerpt" class="text-bark-500 text-sm mb-4 line-clamp-2">
                  {{ article.excerpt }}
                </p>

                <div class="flex items-center justify-between text-sm text-bark-400">
                  <span>{{ article.authorName }}</span>
                  <span v-if="article.readingTime" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ article.readingTime }} min
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-12 bg-white rounded-2xl">
            <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 class="text-xl font-semibold text-bark-800 mb-2">No articles yet</h3>
            <p class="text-bark-500">Articles for this issue are coming soon.</p>
          </div>

          <div class="mt-12">
            <NuxtLink
              to="/magazine"
              class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Issues
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
