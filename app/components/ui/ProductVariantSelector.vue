<script setup lang="ts">
import type { ProductVariant } from '~/types/product'

const props = defineProps<{
  variants: ProductVariant[]
  modelValue?: ProductVariant | null
  currency?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [variant: ProductVariant | null]
}>()

const selectedVariant = computed({
  get: () => props.modelValue ?? null,
  set: (val) => emit('update:modelValue', val),
})

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.currency || 'USD',
  }).format(price)
}

function isOutOfStock(variant: ProductVariant): boolean {
  return variant.stock <= 0
}

function selectVariant(variant: ProductVariant) {
  if (!isOutOfStock(variant)) {
    selectedVariant.value = variant
  }
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-bark-700 mb-3">
      Select Option
    </label>

    <div class="space-y-2">
      <button
        v-for="variant in variants"
        :key="variant.id"
        type="button"
        class="w-full flex items-center justify-between p-3 border rounded-xl transition-all"
        :class="[
          selectedVariant?.id === variant.id
            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
            : 'border-earth-200 hover:border-earth-300',
          isOutOfStock(variant)
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer',
        ]"
        :disabled="isOutOfStock(variant)"
        @click="selectVariant(variant)"
      >
        <div class="flex items-center gap-3">
          <!-- Radio indicator -->
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            :class="[
              selectedVariant?.id === variant.id
                ? 'border-primary-500 bg-primary-500'
                : 'border-earth-300',
            ]"
          >
            <svg
              v-if="selectedVariant?.id === variant.id"
              class="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Variant info -->
          <div class="text-left">
            <span class="font-medium text-bark-800">{{ variant.name }}</span>
            <span
              v-if="isOutOfStock(variant)"
              class="ml-2 text-xs text-kente-red"
            >
              Out of Stock
            </span>
            <span
              v-else-if="variant.stock <= 5"
              class="ml-2 text-xs text-kente-gold"
            >
              Only {{ variant.stock }} left
            </span>
          </div>
        </div>

        <!-- Price -->
        <span class="font-semibold text-bark-700">
          {{ formatPrice(variant.price) }}
        </span>
      </button>
    </div>

    <!-- Selected variant details -->
    <div
      v-if="selectedVariant && selectedVariant.attributes"
      class="mt-4 p-3 bg-earth-50 rounded-xl"
    >
      <h4 class="text-sm font-medium text-bark-600 mb-2">Specifications</h4>
      <dl class="grid grid-cols-2 gap-2 text-sm">
        <template v-for="(value, key) in selectedVariant.attributes" :key="key">
          <dt class="text-bark-500 capitalize">{{ String(key).replace(/_/g, ' ') }}:</dt>
          <dd class="text-bark-700">{{ value }}</dd>
        </template>
      </dl>
    </div>
  </div>
</template>
