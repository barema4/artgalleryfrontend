<script setup lang="ts">
import { useMagazineStore } from '~/stores/magazine'

const route = useRoute()
const magazineStore = useMagazineStore()

const slug = computed(() => route.params.slug as string)

const isLoading = ref(true)
const error = ref('')

async function fetchArticle() {
  isLoading.value = true
  error.value = ''

  const result = await magazineStore.fetchArticleBySlug(slug.value)

  if (!result.success) {
    error.value = result.error || 'Failed to load article'
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

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(magazineStore.currentArticle?.title || '')
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
}

function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
  } catch (e) {
  }
}

onMounted(() => {
  fetchArticle()
})

watch(slug, () => {
  fetchArticle()
})

onUnmounted(() => {
  magazineStore.clearCurrentArticle()
})

useHead(() => ({
  title: magazineStore.currentArticle?.metaTitle || magazineStore.currentArticle?.title || 'Article',
  meta: [
    {
      name: 'description',
      content: magazineStore.currentArticle?.metaDescription || magazineStore.currentArticle?.excerpt || '',
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream">
    <div v-if="isLoading" class="max-w-4xl mx-auto py-16 px-4">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-earth-200 rounded w-3/4"></div>
        <div class="h-4 bg-earth-200 rounded w-1/2"></div>
        <div class="aspect-[16/9] bg-earth-200 rounded-2xl"></div>
        <div class="space-y-3">
          <div class="h-4 bg-earth-200 rounded w-full"></div>
          <div class="h-4 bg-earth-200 rounded w-full"></div>
          <div class="h-4 bg-earth-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto py-16 px-4 text-center">
      <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h1 class="text-2xl font-display font-bold text-bark-800 mb-2">Article Not Found</h1>
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

    <article v-else-if="magazineStore.currentArticle" class="pb-16">
      <div class="relative">
        <div v-if="magazineStore.currentArticle.coverImage" class="aspect-[21/9] max-h-[500px] overflow-hidden">
          <img
            :src="magazineStore.currentArticle.coverImage"
            :alt="magazineStore.currentArticle.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-bark-900/70 to-transparent"></div>
        </div>
        <div v-else class="h-48 bg-gradient-warm"></div>

        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="max-w-4xl mx-auto">
            <nav class="mb-4">
              <ol class="flex items-center gap-2 text-sm text-white/80">
                <li>
                  <NuxtLink to="/magazine" class="hover:text-white transition-colors">Magazine</NuxtLink>
                </li>
                <li>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li v-if="magazineStore.currentArticle.edition">
                  <NuxtLink :to="`/magazine/${magazineStore.currentArticle.edition.slug}`" class="hover:text-white transition-colors">
                    Issue #{{ magazineStore.currentArticle.edition.issueNumber }}
                  </NuxtLink>
                </li>
                <li v-if="magazineStore.currentArticle.edition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li class="text-white truncate max-w-xs">{{ magazineStore.currentArticle.title }}</li>
              </ol>
            </nav>

            <div v-if="magazineStore.currentArticle.category" class="mb-3">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                {{ magazineStore.currentArticle.category.name }}
              </span>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
              {{ magazineStore.currentArticle.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-white/90">
              <span class="font-medium">{{ magazineStore.currentArticle.authorName }}</span>
              <span class="w-1 h-1 bg-white/50 rounded-full"></span>
              <span>{{ formatDate(magazineStore.currentArticle.publishedAt || magazineStore.currentArticle.createdAt) }}</span>
              <span v-if="magazineStore.currentArticle.readingTime" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ magazineStore.currentArticle.readingTime }} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="flex gap-8">
          <aside class="hidden lg:block w-16 flex-shrink-0">
            <div class="sticky top-24 space-y-3">
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-earth-200 text-bark-600 hover:text-primary-600 hover:border-primary-300 transition-colors"
                title="Share on Twitter"
                @click="shareOnTwitter"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-earth-200 text-bark-600 hover:text-primary-600 hover:border-primary-300 transition-colors"
                title="Share on Facebook"
                @click="shareOnFacebook"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-earth-200 text-bark-600 hover:text-primary-600 hover:border-primary-300 transition-colors"
                title="Share on LinkedIn"
                @click="shareOnLinkedIn"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                class="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-earth-200 text-bark-600 hover:text-primary-600 hover:border-primary-300 transition-colors"
                title="Copy link"
                @click="copyLink"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </div>
          </aside>

          <div class="flex-1 min-w-0">
            <p v-if="magazineStore.currentArticle.excerpt" class="text-xl text-bark-600 leading-relaxed mb-8 font-medium">
              {{ magazineStore.currentArticle.excerpt }}
            </p>

            <div class="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-bark-800 prose-p:text-bark-600 prose-a:text-primary-600 prose-strong:text-bark-800" v-html="magazineStore.currentArticle.content"></div>

            <div v-if="magazineStore.currentArticle.tags?.length" class="mt-12 pt-8 border-t border-earth-200">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in magazineStore.currentArticle.tags"
                  :key="tag.id"
                  class="px-3 py-1 bg-earth-100 text-bark-600 text-sm rounded-full"
                >
                  #{{ tag.name }}
                </span>
              </div>
            </div>

            <div class="lg:hidden mt-8 pt-8 border-t border-earth-200">
              <p class="text-sm font-medium text-bark-600 mb-3">Share this article</p>
              <div class="flex gap-3">
                <button
                  class="flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-xl bg-white border border-earth-200 text-bark-600 hover:bg-earth-50 transition-colors"
                  @click="shareOnTwitter"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>
                <button
                  class="flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-xl bg-white border border-earth-200 text-bark-600 hover:bg-earth-50 transition-colors"
                  @click="shareOnFacebook"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
                <button
                  class="flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-xl bg-white border border-earth-200 text-bark-600 hover:bg-earth-50 transition-colors"
                  @click="copyLink"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <div class="mt-12 p-6 bg-white rounded-2xl border border-earth-100">
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                  <img
                    v-if="magazineStore.currentArticle.authorImage"
                    :src="magazineStore.currentArticle.authorImage"
                    :alt="magazineStore.currentArticle.authorName"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-2xl font-bold text-primary-600">
                    {{ magazineStore.currentArticle.authorName.charAt(0) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-bark-500 mb-1">Written by</p>
                  <h3 class="font-semibold text-bark-800 text-lg">{{ magazineStore.currentArticle.authorName }}</h3>
                  <p v-if="magazineStore.currentArticle.authorBio" class="text-bark-500 mt-2">
                    {{ magazineStore.currentArticle.authorBio }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-12 pt-12 border-t border-earth-200">
              <UiCommentSection
                target-type="article"
                :target-id="magazineStore.currentArticle.id"
              />
            </div>

            <div class="mt-8 flex flex-wrap gap-4">
              <NuxtLink
                v-if="magazineStore.currentArticle.edition"
                :to="`/magazine/${magazineStore.currentArticle.edition.slug}`"
                class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Issue #{{ magazineStore.currentArticle.edition.issueNumber }}
              </NuxtLink>
              <NuxtLink
                to="/magazine"
                class="inline-flex items-center gap-2 text-bark-600 hover:text-bark-800 font-medium transition-colors"
              >
                View All Issues
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.prose :deep(img) {
  @apply rounded-xl;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-primary-500 bg-primary-50 py-2 px-4 rounded-r-xl;
}

.prose :deep(code) {
  @apply bg-earth-100 px-1.5 py-0.5 rounded text-sm;
}

.prose :deep(pre) {
  @apply bg-bark-800 rounded-xl;
}
</style>
