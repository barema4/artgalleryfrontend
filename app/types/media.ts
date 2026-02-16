export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folder?: string
  alt?: string
  width?: number
  height?: number
  createdAt: string
}

export interface UploadFileData {
  folder?: string
  alt?: string
}

export interface MediaListParams {
  page?: number
  limit?: number
  folder?: string
  mimeType?: string
}

export interface MediaListResponse {
  data: MediaFile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DeleteMultipleResponse {
  deleted: number
}
