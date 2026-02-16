<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
}>(), {
  modelValue: 0,
  readonly: false,
  size: 'md',
  showValue: false,
  count: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverRating = ref(0)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-4 h-4'
    case 'lg': return 'w-8 h-8'
    default: return 'w-6 h-6'
  }
})

const gapClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'gap-0.5'
    case 'lg': return 'gap-1.5'
    default: return 'gap-1'
  }
})

function getStarType(index: number): 'full' | 'half' | 'empty' {
  const rating = hoverRating.value || props.modelValue
  if (rating >= index) return 'full'
  if (rating >= index - 0.5) return 'half'
  return 'empty'
}

function handleClick(index: number) {
  if (props.readonly) return
  emit('update:modelValue', index)
}

function handleMouseEnter(index: number) {
  if (props.readonly) return
  hoverRating.value = index
}

function handleMouseLeave() {
  if (props.readonly) return
  hoverRating.value = 0
}
</script>

<template>
  <div class="inline-flex items-center" :class="gapClass">
    <button
      v-for="index in count"
      :key="index"
      type="button"
      class="focus:outline-none transition-transform"
      :class="[
        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
      ]"
      :disabled="readonly"
      @click="handleClick(index)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave"
    >
      <!-- Full Star -->
      <svg
        v-if="getStarType(index) === 'full'"
        :class="sizeClasses"
        class="text-kente-gold"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>

      <!-- Half Star -->
      <svg
        v-else-if="getStarType(index) === 'half'"
        :class="sizeClasses"
        class="text-kente-gold"
        viewBox="0 0 24 24"
      >
        <defs>
          <linearGradient :id="`half-star-${index}`">
            <stop offset="50%" stop-color="currentColor" />
            <stop offset="50%" stop-color="#E5E7EB" />
          </linearGradient>
        </defs>
        <path
          :fill="`url(#half-star-${index})`"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>

      <!-- Empty Star -->
      <svg
        v-else
        :class="sizeClasses"
        class="text-earth-200"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>

    <!-- Rating Value -->
    <span
      v-if="showValue"
      class="ml-2 font-medium"
      :class="{
        'text-sm text-bark-600': size === 'sm',
        'text-base text-bark-700': size === 'md',
        'text-lg text-bark-800': size === 'lg',
      }"
    >
      {{ modelValue.toFixed(1) }}
    </span>
  </div>
</template>
