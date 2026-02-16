<script setup lang="ts">
import type { MediaFile } from '~/types/media'
import { useMediaService } from '~/services/media.service'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  folder?: string
  alt?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  accept?: string
  previewAspect?: 'video' | 'square' | 'portrait' | 'auto'
}>(), {
  modelValue: '',
  placeholder: 'https://...',
  accept: 'image/*',
  previewAspect: 'auto',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'upload-complete': [file: MediaFile]
  'upload-error': [error: string]
}>()

const mediaService = useMediaService()
const fileInput = ref<HTMLInputElement | null>(null)
const dropZone = ref<HTMLElement | null>(null)
const isUploading = ref(false)
const isDragging = ref(false)
const errorMessage = ref('')
const showUrlInput = ref(false)

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const aspectClass = computed(() => {
  switch (props.previewAspect) {
    case 'video': return 'aspect-video'
    case 'square': return 'aspect-square'
    case 'portrait': return 'aspect-[3/4]'
    default: return 'aspect-video'
  }
})

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`
  }
  if (!file.type.startsWith('image/')) {
    return 'Only image files are allowed'
  }
  return null
}

async function uploadFile(file: File) {
  const validationError = validateFile(file)
  if (validationError) {
    errorMessage.value = validationError
    emit('upload-error', validationError)
    return
  }

  isUploading.value = true
  errorMessage.value = ''

  try {
    const result = await mediaService.directUpload(file, props.folder, props.alt)
    emit('update:modelValue', result.url)
    emit('upload-complete', result)
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Upload failed'
    errorMessage.value = msg
    emit('upload-error', msg)
  } finally {
    isUploading.value = false
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadFile(file)
  }
  // Reset input so same file can be re-selected
  target.value = ''
}

function handleClick() {
  if (!props.disabled && !isUploading.value) {
    fileInput.value?.click()
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled && !isUploading.value) {
    isDragging.value = true
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  if (props.disabled || isUploading.value) return

  const file = e.dataTransfer?.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

function handleUrlInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  errorMessage.value = ''
}

function removeImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Has URL → image preview with hover overlay -->
    <div v-if="modelValue" class="relative group">
      <div
        class="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden"
        :class="aspectClass"
      >
        <img
          :src="modelValue"
          :alt="alt || label || 'Uploaded image'"
          class="w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </div>

      <!-- Uploading overlay -->
      <div
        v-if="isUploading"
        class="absolute inset-0 max-w-md bg-black/50 rounded-lg flex items-center justify-center"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      </div>

      <!-- Hover overlay with actions -->
      <div
        v-else-if="!disabled"
        class="absolute inset-0 max-w-md bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
      >
        <button
          type="button"
          class="px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          @click="handleClick"
        >
          Replace
        </button>
        <button
          type="button"
          class="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          @click="removeImage"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- No URL → drop zone -->
    <div
      v-else
      ref="dropZone"
      class="w-full max-w-md border-2 border-dashed rounded-lg transition-colors cursor-pointer"
      :class="[
        isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @click="handleClick"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="flex flex-col items-center justify-center py-8 px-4">
        <!-- Uploading spinner -->
        <div v-if="isUploading" class="flex flex-col items-center gap-2">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
          <p class="text-sm text-gray-600">Uploading...</p>
        </div>

        <!-- Upload icon and text -->
        <template v-else>
          <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm text-gray-600 text-center">
            <span class="font-medium text-gray-900">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB</p>
        </template>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      :disabled="disabled"
      @change="handleFileSelect"
    />

    <!-- Collapsible URL fallback -->
    <div class="mt-2 max-w-md">
      <button
        type="button"
        class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        @click="showUrlInput = !showUrlInput"
      >
        {{ showUrlInput ? 'Hide URL input' : 'Or paste image URL' }}
      </button>
      <input
        v-if="showUrlInput"
        :value="modelValue"
        type="url"
        class="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleUrlInput"
      />
    </div>

    <!-- Error message -->
    <p v-if="errorMessage" class="mt-1.5 text-sm text-red-600">{{ errorMessage }}</p>
  </div>
</template>
