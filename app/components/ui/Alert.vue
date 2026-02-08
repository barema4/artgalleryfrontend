<script setup lang="ts">
defineProps<{
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const visible = ref(true)

function dismiss() {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="visible"
      class="rounded-lg p-4"
      :class="{
        'bg-green-50 text-green-800': type === 'success',
        'bg-red-50 text-red-800': type === 'error',
        'bg-yellow-50 text-yellow-800': type === 'warning',
        'bg-blue-50 text-blue-800': type === 'info' || !type,
      }"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <!-- Success icon -->
          <svg v-if="type === 'success'" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <!-- Error icon -->
          <svg v-else-if="type === 'error'" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <!-- Warning icon -->
          <svg v-else-if="type === 'warning'" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <!-- Info icon -->
          <svg v-else class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 v-if="title" class="text-sm font-medium">{{ title }}</h3>
          <div class="text-sm" :class="{ 'mt-1': title }">
            <slot />
          </div>
        </div>
        <div v-if="dismissible" class="ml-auto pl-3">
          <button
            type="button"
            class="-mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="{
              'focus:ring-green-500': type === 'success',
              'focus:ring-red-500': type === 'error',
              'focus:ring-yellow-500': type === 'warning',
              'focus:ring-blue-500': type === 'info' || !type,
            }"
            @click="dismiss"
          >
            <span class="sr-only">Dismiss</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
