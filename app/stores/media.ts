import { defineStore } from 'pinia'
import type {
  MediaFile,
  MediaListParams,
} from '~/types/media'
import { useMediaService } from '~/services/media.service'

interface MediaState {
  files: MediaFile[]
  currentFile: MediaFile | null
  folderFiles: MediaFile[]
  selectedFiles: string[]
  uploading: boolean
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useMediaStore = defineStore('media', {
  state: (): MediaState => ({
    files: [],
    currentFile: null,
    folderFiles: [],
    selectedFiles: [],
    uploading: false,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 24,
      totalPages: 0,
    },
  }),

  getters: {
    hasFiles: (state) => state.files.length > 0,
    hasMorePages: (state) => state.pagination.page < state.pagination.totalPages,
    hasSelection: (state) => state.selectedFiles.length > 0,
    selectionCount: (state) => state.selectedFiles.length,

    imageFiles: (state) => state.files.filter((f) => f.mimeType.startsWith('image/')),
    videoFiles: (state) => state.files.filter((f) => f.mimeType.startsWith('video/')),
    documentFiles: (state) =>
      state.files.filter(
        (f) => !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/')
      ),

    getFileById: (state) => (id: string) => state.files.find((f) => f.id === id),

    formatFileSize: () => (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
  },

  actions: {
    // Upload Actions
    async uploadFile(file: File, folder?: string, alt?: string) {
      this.uploading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        const mediaFile = await mediaService.directUpload(file, folder, alt)
        this.files.unshift(mediaFile)
        this.pagination.total += 1
        return { success: true, data: mediaFile }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to upload file'
        return { success: false, error: this.error }
      } finally {
        this.uploading = false
      }
    },

    async uploadMultiple(files: File[], folder?: string) {
      this.uploading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        const mediaFiles = await Promise.all(
          files.map((file) => mediaService.directUpload(file, folder)),
        )
        this.files.unshift(...mediaFiles)
        this.pagination.total += mediaFiles.length
        return { success: true, data: mediaFiles }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string }; message?: string }
        this.error = err?.data?.message || err?.message || 'Failed to upload files'
        return { success: false, error: this.error }
      } finally {
        this.uploading = false
      }
    },

    // Fetch Actions
    async fetchFiles(params?: MediaListParams) {
      this.loading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        const response = await mediaService.getMediaFiles({
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
          ...params,
        })

        this.files = response.data
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch files'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async loadMore(params?: MediaListParams) {
      if (!this.hasMorePages || this.loading) return { success: false }

      this.loading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        const response = await mediaService.getMediaFiles({
          page: this.pagination.page + 1,
          limit: this.pagination.limit,
          ...params,
        })

        this.files.push(...response.data)
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        }

        return { success: true, data: response }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to load more files'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchFileById(id: string) {
      this.loading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        this.currentFile = await mediaService.getMediaById(id)
        return { success: true, data: this.currentFile }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch file'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchFilesByFolder(folder: string) {
      this.loading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        this.folderFiles = await mediaService.getMediaByFolder(folder)
        return { success: true, data: this.folderFiles }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to fetch folder files'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Delete Actions
    async deleteFile(id: string) {
      this.loading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        await mediaService.deleteMedia(id)

        this.files = this.files.filter((f) => f.id !== id)
        this.folderFiles = this.folderFiles.filter((f) => f.id !== id)
        this.selectedFiles = this.selectedFiles.filter((fid) => fid !== id)
        this.pagination.total -= 1

        if (this.currentFile?.id === id) {
          this.currentFile = null
        }

        return { success: true }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete file'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteMultiple(ids: string[]) {
      this.loading = true
      this.error = null

      try {
        const mediaService = useMediaService()
        const result = await mediaService.deleteMultiple(ids)

        this.files = this.files.filter((f) => !ids.includes(f.id))
        this.folderFiles = this.folderFiles.filter((f) => !ids.includes(f.id))
        this.selectedFiles = this.selectedFiles.filter((fid) => !ids.includes(fid))
        this.pagination.total -= result.deleted

        if (this.currentFile && ids.includes(this.currentFile.id)) {
          this.currentFile = null
        }

        return { success: true, data: result }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        this.error = err?.data?.message || 'Failed to delete files'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteSelected() {
      if (this.selectedFiles.length === 0) {
        return { success: false, error: 'No files selected' }
      }
      return this.deleteMultiple(this.selectedFiles)
    },

    // Selection Actions
    selectFile(id: string) {
      if (!this.selectedFiles.includes(id)) {
        this.selectedFiles.push(id)
      }
    },

    deselectFile(id: string) {
      this.selectedFiles = this.selectedFiles.filter((fid) => fid !== id)
    },

    toggleFileSelection(id: string) {
      if (this.selectedFiles.includes(id)) {
        this.deselectFile(id)
      } else {
        this.selectFile(id)
      }
    },

    selectAll() {
      this.selectedFiles = this.files.map((f) => f.id)
    },

    clearSelection() {
      this.selectedFiles = []
    },

    // Utility Actions
    clearCurrentFile() {
      this.currentFile = null
    },

    clearFolderFiles() {
      this.folderFiles = []
    },

    clearError() {
      this.error = null
    },

    reset() {
      this.files = []
      this.currentFile = null
      this.folderFiles = []
      this.selectedFiles = []
      this.error = null
      this.pagination = {
        total: 0,
        page: 1,
        limit: 24,
        totalPages: 0,
      }
    },
  },
})
