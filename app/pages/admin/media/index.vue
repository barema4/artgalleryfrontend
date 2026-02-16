<script setup lang="ts">
import type { MediaFile, MediaListParams } from '~/types/media'
import { useMediaService } from '~/services/media.service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'],
})

const mediaService = useMediaService()

const files = ref<MediaFile[]>([])
const isLoading = ref(true)
const isUploading = ref(false)
const error = ref('')
const successMessage = ref('')

const pagination = reactive({
  page: 1,
  limit: 24,
  total: 0,
  totalPages: 0,
})

const filters = reactive<{ folder?: string; mimeType?: string }>({
  folder: undefined,
  mimeType: undefined,
})

const selectedFiles = ref<Set<string>>(new Set())
const selectAll = ref(false)

const viewMode = ref<'grid' | 'list'>('grid')

// Preview modal
const showPreview = ref(false)
const previewFile = ref<MediaFile | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const folderOptions = [
  { value: '', label: 'All folders' },
  { value: 'artworks', label: 'Artworks' },
  { value: 'artists', label: 'Artists' },
  { value: 'blog', label: 'Blog' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'products', label: 'Products' },
  { value: 'misc', label: 'Miscellaneous' },
]

const typeOptions = [
  { value: '', label: 'All types' },
  { value: 'image', label: 'Images' },
  { value: 'application/pdf', label: 'PDFs' },
  { value: 'video', label: 'Videos' },
]

async function fetchFiles() {
  isLoading.value = true
  error.value = ''

  try {
    const params: MediaListParams = {
      page: pagination.page,
      limit: pagination.limit,
    }
    if (filters.folder) params.folder = filters.folder
    if (filters.mimeType) params.mimeType = filters.mimeType

    const response = await mediaService.getMediaFiles(params)
    files.value = response.data
    pagination.total = response.total
    pagination.totalPages = response.totalPages
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to fetch media files'
  } finally {
    isLoading.value = false
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  await uploadFiles(Array.from(input.files))
  input.value = '' // Reset input
}

async function handleDrop(event: DragEvent) {
  dragOver.value = false
  const droppedFiles = event.dataTransfer?.files
  if (!droppedFiles?.length) return

  await uploadFiles(Array.from(droppedFiles))
}

async function uploadFiles(filesToUpload: File[]) {
  isUploading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (filesToUpload.length === 1) {
      await mediaService.uploadFile(filesToUpload[0], filters.folder || 'misc')
    } else {
      await mediaService.uploadMultiple(filesToUpload, filters.folder || 'misc')
    }
    successMessage.value = `Successfully uploaded ${filesToUpload.length} file(s)`
    await fetchFiles()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to upload files'
  } finally {
    isUploading.value = false
  }
}

function toggleSelect(fileId: string) {
  if (selectedFiles.value.has(fileId)) {
    selectedFiles.value.delete(fileId)
  } else {
    selectedFiles.value.add(fileId)
  }
  selectedFiles.value = new Set(selectedFiles.value) // Trigger reactivity
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedFiles.value = new Set()
  } else {
    selectedFiles.value = new Set(files.value.map(f => f.id))
  }
  selectAll.value = !selectAll.value
}

function openPreview(file: MediaFile) {
  previewFile.value = file
  showPreview.value = true
}

function closePreview() {
  showPreview.value = false
  previewFile.value = null
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    successMessage.value = 'URL copied to clipboard'
    setTimeout(() => successMessage.value = '', 3000)
  } catch {
    error.value = 'Failed to copy URL'
  }
}

async function deleteFile(file: MediaFile) {
  if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) return

  try {
    await mediaService.deleteMedia(file.id)
    successMessage.value = 'File deleted successfully'
    await fetchFiles()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete file'
  }
}

async function deleteSelected() {
  if (selectedFiles.value.size === 0) return
  if (!confirm(`Are you sure you want to delete ${selectedFiles.value.size} file(s)?`)) return

  try {
    await mediaService.deleteMultiple(Array.from(selectedFiles.value))
    successMessage.value = `${selectedFiles.value.size} file(s) deleted successfully`
    selectedFiles.value = new Set()
    selectAll.value = false
    await fetchFiles()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete files'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isImage(file: MediaFile): boolean {
  return file.mimeType.startsWith('image/')
}

function getFileIcon(file: MediaFile): string {
  if (file.mimeType.startsWith('image/')) return 'image'
  if (file.mimeType.startsWith('video/')) return 'video'
  if (file.mimeType === 'application/pdf') return 'pdf'
  return 'file'
}

watch([() => filters.folder, () => filters.mimeType], () => {
  pagination.page = 1
  fetchFiles()
})

onMounted(() => {
  fetchFiles()
})
</script>

<template>
  <div class="min-h-[80vh] py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Media Library</h1>
          <p class="text-gray-600 mt-1">Upload and manage your media files</p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="selectedFiles.size > 0"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            @click="deleteSelected"
          >
            Delete Selected ({{ selectedFiles.size }})
          </button>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            :disabled="isUploading"
            @click="triggerUpload"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {{ isUploading ? 'Uploading...' : 'Upload Files' }}
          </button>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        class="hidden"
        @change="handleFileSelect"
      />

      <UiAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>
      <UiAlert v-if="successMessage" type="success" class="mb-6" dismissible @dismiss="successMessage = ''">
        {{ successMessage }}
      </UiAlert>

      <div
        class="mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
        :class="dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'"
        @click="triggerUpload"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
        <p class="text-sm text-gray-400">Supports images, videos, and PDFs</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Folder</label>
              <select
                v-model="filters.folder"
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option v-for="option in folderOptions" :key="option.value" :value="option.value || undefined">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                v-model="filters.mimeType"
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option v-for="option in typeOptions" :key="option.value" :value="option.value || undefined">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="p-2 rounded-lg transition-colors"
              :class="viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'"
              @click="viewMode = 'grid'"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              class="p-2 rounded-lg transition-colors"
              :class="viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'"
              @click="viewMode = 'list'"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <div v-else-if="viewMode === 'grid' && files.length > 0">
        <div class="flex items-center gap-4 mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="selectAll" class="w-4 h-4" @change="toggleSelectAll" />
            <span class="text-sm text-gray-600">Select all</span>
          </label>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="file in files"
            :key="file.id"
            class="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            :class="{ 'ring-2 ring-primary-500': selectedFiles.has(file.id) }"
          >
            <div class="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                :checked="selectedFiles.has(file.id)"
                class="w-4 h-4 rounded"
                @click.stop
                @change="toggleSelect(file.id)"
              />
            </div>

            <div class="aspect-square bg-gray-100" @click="openPreview(file)">
              <img
                v-if="isImage(file)"
                :src="file.thumbnailUrl || file.url"
                :alt="file.alt || file.originalName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg v-if="getFileIcon(file) === 'pdf'" class="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                </svg>
                <svg v-else-if="getFileIcon(file) === 'video'" class="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <div class="p-2">
              <p class="text-sm font-medium text-gray-900 truncate" :title="file.originalName">
                {{ file.originalName }}
              </p>
              <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
            </div>

            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                title="Copy URL"
                @click.stop="copyUrl(file.url)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                class="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                title="Delete"
                @click.stop="deleteFile(file)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="viewMode === 'list' && files.length > 0" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="w-12 px-4 py-3">
                <input type="checkbox" :checked="selectAll" class="w-4 h-4" @change="toggleSelectAll" />
              </th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">File</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Folder</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedFiles.has(file.id)"
                  class="w-4 h-4"
                  @change="toggleSelect(file.id)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      v-if="isImage(file)"
                      :src="file.thumbnailUrl || file.url"
                      :alt="file.originalName"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 truncate max-w-xs">{{ file.originalName }}</p>
                    <p class="text-sm text-gray-500">{{ file.mimeType }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ file.folder || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatFileSize(file.size) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(file.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Preview"
                    @click="openPreview(file)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Copy URL"
                    @click="copyUrl(file.url)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                    title="Delete"
                    @click="deleteFile(file)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="files.length === 0" class="text-center py-12 bg-white border border-gray-200 rounded-xl">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No media files</h3>
        <p class="text-gray-500 mb-4">Upload your first file to get started.</p>
        <button
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          @click="triggerUpload"
        >
          Upload Files
        </button>
      </div>

      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-6">
        <p class="text-sm text-gray-500">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
          {{ pagination.total }} files
        </p>
        <div class="flex gap-2">
          <button
            class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
            :disabled="pagination.page === 1"
            @click="pagination.page--; fetchFiles()"
          >
            Previous
          </button>
          <button
            class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
            :disabled="pagination.page === pagination.totalPages"
            @click="pagination.page++; fetchFiles()"
          >
            Next
          </button>
        </div>
      </div>

      <div
        v-if="showPreview && previewFile"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        @click.self="closePreview"
      >
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900 truncate">{{ previewFile.originalName }}</h3>
            <button class="p-2 text-gray-500 hover:text-gray-700" @click="closePreview">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4">
            <div class="mb-4 flex justify-center bg-gray-100 rounded-lg overflow-hidden" style="max-height: 60vh;">
              <img
                v-if="isImage(previewFile)"
                :src="previewFile.url"
                :alt="previewFile.alt || previewFile.originalName"
                class="max-w-full max-h-full object-contain"
              />
              <video
                v-else-if="previewFile.mimeType.startsWith('video/')"
                :src="previewFile.url"
                controls
                class="max-w-full max-h-full"
              ></video>
              <div v-else class="py-12 text-center">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-gray-500">Preview not available for this file type</p>
                <a
                  :href="previewFile.url"
                  target="_blank"
                  class="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Open File
                </a>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Size</p>
                <p class="font-medium">{{ formatFileSize(previewFile.size) }}</p>
              </div>
              <div>
                <p class="text-gray-500">Type</p>
                <p class="font-medium">{{ previewFile.mimeType }}</p>
              </div>
              <div v-if="previewFile.width && previewFile.height">
                <p class="text-gray-500">Dimensions</p>
                <p class="font-medium">{{ previewFile.width }} x {{ previewFile.height }}</p>
              </div>
              <div>
                <p class="text-gray-500">Uploaded</p>
                <p class="font-medium">{{ formatDate(previewFile.createdAt) }}</p>
              </div>
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500 mb-1">URL</p>
              <div class="flex items-center gap-2">
                <input
                  :value="previewFile.url"
                  readonly
                  class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                />
                <button
                  class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  @click="copyUrl(previewFile.url)"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
