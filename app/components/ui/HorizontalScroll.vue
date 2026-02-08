<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
  viewAllLink?: string
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function updateScrollButtons() {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

function scroll(direction: 'left' | 'right') {
  if (!scrollContainer.value) return
  const scrollAmount = scrollContainer.value.clientWidth * 0.8
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(() => {
  updateScrollButtons()
  scrollContainer.value?.addEventListener('scroll', updateScrollButtons)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', updateScrollButtons)
})
</script>

<template>
  <section class="py-8 lg:py-12">
    <!-- Header -->
    <div class="flex items-end justify-between mb-6 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
      <div>
        <h2 v-if="title" class="text-2xl lg:text-3xl font-bold text-gray-900">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600 mt-1">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Scroll Buttons -->
        <button
          v-show="canScrollLeft"
          class="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          @click="scroll('left')"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-show="canScrollRight"
          class="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          @click="scroll('right')"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <!-- View All Link -->
        <NuxtLink
          v-if="viewAllLink"
          :to="viewAllLink"
          class="ml-4 text-sm font-medium text-gray-900 hover:underline"
        >
          View all
        </NuxtLink>
      </div>
    </div>

    <!-- Scroll Container -->
    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
      style="scroll-padding-left: 1rem;"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
