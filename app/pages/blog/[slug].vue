<script setup lang="ts">
import { useBlogStore } from '~/stores/blog'

const route = useRoute()
const blogStore = useBlogStore()

const slug = computed(() => route.params.slug as string)

const isLoading = ref(true)
const error = ref('')

async function fetchPost() {
  isLoading.value = true
  error.value = ''

  const result = await blogStore.fetchPostBySlug(slug.value)

  if (!result.success) {
    error.value = result.error || 'Failed to load article'
  }

  isLoading.value = false
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(blogStore.currentPost?.title || '')
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

const relatedPosts = ref<typeof blogStore.posts>([])
async function fetchRelatedPosts() {
  if (blogStore.currentPost?.tags?.length) {
    const result = await blogStore.fetchPosts({
      tag: blogStore.currentPost.tags[0].slug,
      limit: 3,
    })
    if (result.success) {
      relatedPosts.value = blogStore.posts.filter(p => p.slug !== slug.value).slice(0, 3)
    }
  }
}

onMounted(async () => {
  await fetchPost()
  await fetchRelatedPosts()
})

watch(slug, async () => {
  await fetchPost()
  await fetchRelatedPosts()
})

onUnmounted(() => {
  blogStore.clearCurrentPost()
})

useHead(() => ({
  title: blogStore.currentPost?.metaTitle || blogStore.currentPost?.title || 'Blog Post',
  meta: [
    {
      name: 'description',
      content: blogStore.currentPost?.metaDescription || blogStore.currentPost?.excerpt || '',
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream">
    <div v-if="isLoading" class="max-w-4xl mx-auto py-16 px-4">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-earth-200 rounded w-3/4" />
        <div class="h-4 bg-earth-200 rounded w-1/2" />
        <div class="aspect-[16/9] bg-earth-200 rounded-2xl" />
        <div class="space-y-3">
          <div class="h-4 bg-earth-200 rounded w-full" />
          <div class="h-4 bg-earth-200 rounded w-full" />
          <div class="h-4 bg-earth-200 rounded w-2/3" />
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
        to="/blog"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Blog
      </NuxtLink>
    </div>

    <article v-else-if="blogStore.currentPost" class="pb-16">
      <div class="relative">
        <div v-if="blogStore.currentPost.coverImage" class="aspect-[21/9] max-h-[500px] overflow-hidden">
          <img
            :src="blogStore.currentPost.coverImage"
            :alt="blogStore.currentPost.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-bark-900/60 to-transparent" />
        </div>
        <div v-else class="h-48 bg-gradient-warm" />

        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="max-w-4xl mx-auto">
            <div v-if="blogStore.currentPost.tags?.length" class="flex flex-wrap gap-2 mb-4">
              <NuxtLink
                v-for="tag in blogStore.currentPost.tags"
                :key="tag.id"
                :to="`/blog?tag=${tag.slug}`"
                class="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/30 transition-colors"
              >
                #{{ tag.name }}
              </NuxtLink>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
              {{ blogStore.currentPost.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-white/90">
              <span class="font-medium">{{ blogStore.currentPost.authorName }}</span>
              <span class="w-1 h-1 bg-white/50 rounded-full" />
              <span>{{ formatDate(blogStore.currentPost.publishedAt || blogStore.currentPost.createdAt) }}</span>
              <span v-if="blogStore.currentPost.readingTime" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ blogStore.currentPost.readingTime }} min read
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
            <p v-if="blogStore.currentPost.excerpt" class="text-xl text-bark-600 leading-relaxed mb-8 font-medium">
              {{ blogStore.currentPost.excerpt }}
            </p>

            <div class="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-bark-800 prose-p:text-bark-600 prose-a:text-primary-600 prose-strong:text-bark-800" v-html="blogStore.currentPost.content" />

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
                <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl font-bold text-primary-600">
                    {{ blogStore.currentPost.authorName.charAt(0) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-bark-500 mb-1">Written by</p>
                  <h3 class="font-semibold text-bark-800 text-lg">{{ blogStore.currentPost.authorName }}</h3>
                  <p class="text-bark-500 mt-2">
                    Sharing insights and stories from the world of African art.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <NuxtLink
                to="/blog"
                class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blog
              </NuxtLink>
            </div>

            <div class="mt-12 pt-12 border-t border-earth-200">
              <UiCommentSection
                target-type="blogPost"
                :target-id="blogStore.currentPost.id"
              />
            </div>
          </div>
        </div>
      </div>

      <section v-if="relatedPosts.length > 0" class="bg-white py-16 border-t border-earth-100">
        <div class="max-w-7xl mx-auto px-4">
          <h2 class="text-2xl font-display font-bold text-bark-800 mb-8">Related Articles</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink
              v-for="post in relatedPosts"
              :key="post.id"
              :to="`/blog/${post.slug}`"
              class="group bg-earth-50 rounded-2xl overflow-hidden hover:shadow-warm-lg transition-all duration-300"
            >
              <div class="aspect-[16/10] bg-earth-100 overflow-hidden">
                <img
                  v-if="post.coverImage"
                  :src="post.coverImage"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div class="p-5">
                <p class="text-sm text-bark-500 mb-2">
                  {{ formatDate(post.publishedAt || post.createdAt) }}
                </p>
                <h3 class="font-semibold text-bark-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {{ post.title }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
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
