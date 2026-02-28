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

export interface UploadSignatureRequest {
  resourceType: 'image' | 'video' | 'raw'
  folder?: string
  alt?: string
}

export interface UploadSignatureResponse {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  publicId: string
  folder: string
  uploadUrl: string
  resourceType: 'image' | 'video' | 'raw'
}

export interface ConfirmDirectUploadData {
  publicId: string
  version: string
  signature: string
  secureUrl: string
  originalFilename: string
  format: string
  resourceType: 'image' | 'video' | 'raw'
  bytes: number
  width?: number
  height?: number
  folder?: string
  alt?: string
}
