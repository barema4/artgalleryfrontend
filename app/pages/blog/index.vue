<script setup lang="ts">
import type { BlogPostListParams } from '~/types/blog'
import { useBlogStore } from '~/stores/blog'

const blogStore = useBlogStore()

const filters = reactive<BlogPostListParams>({
  page: 1,
  limit: 9,
  search: '',
  tag: undefined,
  sortBy: 'newest',
})

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title A-Z' },
]

async function fetchPosts() {
  await blogStore.fetchPosts(filters)
}

function handleSearch() {
  filters.page = 1
  fetchPosts()
}

function handleFilterChange() {
  filters.page = 1
  fetchPosts()
}

function handlePageChange(page: number) {
  filters.page = page
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleTagClick(tagSlug: string) {
  if (filters.tag === tagSlug) {
    filters.tag = undefined
  } else {
    filters.tag = tagSlug
  }
  filters.page = 1
  fetchPosts()
}

function clearFilters() {
  filters.search = ''
  filters.tag = undefined
  filters.sortBy = 'newest'
  filters.page = 1
  fetchPosts()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchPosts()
  blogStore.fetchPopularTags(10)
})
</script>

<template>
  <div class="min-h-screen bg-mudcloth-cream py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-display font-bold text-bark-800 mb-4">Blog</h1>
        <p class="text-lg text-bark-500 max-w-2xl mx-auto">
          Stories, insights, and inspiration from the world of African art
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar -->
        <aside class="lg:w-72 flex-shrink-0 space-y-6">
          <!-- Search -->
          <div class="bg-white rounded-2xl border border-earth-100 p-4">
            <h3 class="font-semibold text-bark-800 mb-3">Search</h3>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search articles..."
                class="w-full pl-10 pr-4 py-2.5 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                @keyup.enter="handleSearch"
              />
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Popular Tags -->
          <div class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
            <div class="px-4 py-3 bg-gradient-warm border-b border-earth-100">
              <h3 class="font-semibold text-bark-800">Popular Topics</h3>
            </div>
            <div class="p-4">
              <div v-if="blogStore.popularTags.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="tag in blogStore.popularTags"
                  :key="tag.slug"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  :class="filters.tag === tag.slug
                    ? 'bg-primary-500 text-white'
                    : 'bg-earth-100 text-bark-600 hover:bg-earth-200'"
                  @click="handleTagClick(tag.slug)"
                >
                  {{ tag.name }}
                  <span class="ml-1 text-xs opacity-75">({{ tag.count }})</span>
                </button>
              </div>
              <p v-else class="text-sm text-bark-500">No tags available</p>
            </div>
          </div>

          <!-- Sort -->
          <div class="bg-white rounded-2xl border border-earth-100 p-4">
            <h3 class="font-semibold text-bark-800 mb-3">Sort By</h3>
            <select
              v-model="filters.sortBy"
              class="w-full px-4 py-2.5 border border-earth-200 rounded-xl bg-white text-bark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              @change="handleFilterChange"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Clear Filters -->
          <button
            v-if="filters.search || filters.tag"
            class="w-full px-4 py-2.5 text-bark-600 hover:text-primary-600 font-medium transition-colors"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Active Filters -->
          <div v-if="filters.tag" class="mb-6 flex items-center gap-2">
            <span class="text-sm text-bark-500">Filtered by:</span>
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {{ blogStore.popularTags.find(t => t.slug === filters.tag)?.name || filters.tag }}
              <button class="hover:text-primary-900" @click="filters.tag && handleTagClick(filters.tag)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>

          <!-- Loading -->
          <div v-if="blogStore.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-earth-100 overflow-hidden">
              <div class="aspect-[16/10] bg-earth-100 animate-pulse" />
              <div class="p-5 space-y-3">
                <div class="h-4 bg-earth-100 rounded animate-pulse w-1/3" />
                <div class="h-6 bg-earth-100 rounded animate-pulse w-full" />
                <div class="h-4 bg-earth-100 rounded animate-pulse w-2/3" />
              </div>
            </div>
          </div>

          <!-- Error -->
          <UiAlert v-else-if="blogStore.error" type="error" class="mb-6" dismissible @dismiss="blogStore.clearError()">
            {{ blogStore.error }}
          </UiAlert>

          <!-- Posts Grid -->
          <div v-else-if="blogStore.posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <NuxtLink
              v-for="post in blogStore.posts"
              :key="post.id"
              :to="`/blog/${post.slug}`"
              class="group bg-white rounded-2xl border border-earth-100 overflow-hidden hover:shadow-warm-lg hover:border-earth-200 transition-all duration-300"
            >
              <!-- Cover Image -->
              <div class="aspect-[16/10] bg-earth-100 relative overflow-hidden">
                <img
                  v-if="post.coverImage"
                  :src="post.coverImage"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-12 h-12 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>

                <!-- Featured Badge -->
                <div v-if="post.featured" class="absolute top-3 left-3">
                  <span class="px-2 py-1 bg-kente-gold text-white text-xs font-medium rounded-full">
                    Featured
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-5">
                <!-- Meta -->
                <div class="flex items-center gap-3 text-sm text-bark-500 mb-3">
                  <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                  <span v-if="post.readingTime" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ post.readingTime }} min read
                  </span>
                </div>

                <!-- Title -->
                <h2 class="font-semibold text-lg text-bark-800 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                  {{ post.title }}
                </h2>

                <!-- Excerpt -->
                <p v-if="post.excerpt" class="text-bark-500 text-sm line-clamp-2 mb-4">
                  {{ post.excerpt }}
                </p>

                <!-- Tags -->
                <div v-if="post.tags?.length" class="flex flex-wrap gap-1 mb-4">
                  <span
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag.id"
                    class="text-xs text-bark-500 bg-earth-100 px-2 py-0.5 rounded-full"
                  >
                    #{{ tag.name }}
                  </span>
                </div>

                <!-- Author & Stats -->
                <div class="flex items-center justify-between pt-4 border-t border-earth-100">
                  <span class="text-sm text-bark-600">{{ post.authorName }}</span>
                  <div class="flex items-center gap-3 text-sm text-bark-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ post.viewCount }}
                    </span>
                    <span v-if="post.commentCount" class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {{ post.commentCount }}
                    </span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-white rounded-2xl border border-earth-100 py-16 text-center">
            <svg class="w-16 h-16 text-earth-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 class="text-lg font-medium text-bark-700">No articles found</h3>
            <p class="text-bark-500 mt-1">Try adjusting your search or filters</p>
          </div>

          <!-- Pagination -->
          <div v-if="blogStore.pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button
              class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="filters.page === 1"
              @click="handlePageChange((filters.page || 1) - 1)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="flex items-center gap-1">
              <button
                v-for="page in blogStore.pagination.totalPages"
                :key="page"
                class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
                :class="page === filters.page
                  ? 'bg-primary-500 text-white'
                  : 'text-bark-600 hover:bg-earth-100'"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="p-2 rounded-lg border border-earth-200 text-bark-500 hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="filters.page === blogStore.pagination.totalPages"
              @click="handlePageChange((filters.page || 1) + 1)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
