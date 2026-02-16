import type { Artist } from './artist'

export type ArtworkStatus = 'DRAFT' | 'AVAILABLE' | 'SOLD' | 'ON_EXHIBITION' | 'ARCHIVED'

export type ArtworkMedium =
  | 'OIL_PAINTING'
  | 'ACRYLIC'
  | 'WATERCOLOR'
  | 'DIGITAL'
  | 'PHOTOGRAPHY'
  | 'SCULPTURE'
  | 'MIXED_MEDIA'
  | 'PRINT'
  | 'DRAWING'
  | 'OTHER'

export interface ArtworkImage {
  id: string
  artworkId: string
  url: string
  thumbnailUrl?: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
  width?: number
  height?: number
  createdAt: string
}

export interface Artwork {
  id: string
  artistId: string
  categoryId?: string
  slug: string
  title: string
  description?: string
  story?: string
  medium: ArtworkMedium
  style?: string
  year?: number
  width?: number
  height?: number
  depth?: number
  weight?: number
  price?: number
  originalPrice?: number
  currency: string
  status: ArtworkStatus
  featured: boolean
  viewCount: number
  likeCount: number
  tags: string[]
  images: ArtworkImage[]
  artist?: Artist
  category?: {
    id: string
    name: string
    slug: string
  }
  createdAt: string
  updatedAt: string
}

export interface ArtworkStats {
  viewCount: number
  likeCount: number
  favoriteCount: number
  commentCount: number
  shareCount?: number
  inquiryCount?: number
}

export interface CreateArtworkData {
  slug: string
  title: string
  description?: string
  story?: string
  medium: ArtworkMedium
  style?: string
  year?: number
  width?: number
  height?: number
  depth?: number
  weight?: number
  price?: number
  originalPrice?: number
  currency?: string
  categoryId?: string
  tags?: string[]
  images?: CreateArtworkImageData[]
}

export interface UpdateArtworkData {
  title?: string
  description?: string
  story?: string
  medium?: ArtworkMedium
  style?: string
  year?: number
  width?: number
  height?: number
  depth?: number
  weight?: number
  price?: number
  originalPrice?: number
  currency?: string
  categoryId?: string
  status?: ArtworkStatus
  tags?: string[]
}

export interface CreateArtworkImageData {
  url: string
  thumbnailUrl?: string
  altText?: string
  isPrimary?: boolean
  sortOrder?: number
  width?: number
  height?: number
}

export interface ArtworkListParams {
  page?: number
  limit?: number
  artistId?: string
  categoryId?: string
  status?: ArtworkStatus
  medium?: ArtworkMedium
  featured?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'title'
  tags?: string[]
}

export interface ArtworkListResponse {
  data: Artwork[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const MEDIUM_LABELS: Record<ArtworkMedium, string> = {
  OIL_PAINTING: 'Oil Painting',
  ACRYLIC: 'Acrylic',
  WATERCOLOR: 'Watercolor',
  DIGITAL: 'Digital Art',
  PHOTOGRAPHY: 'Photography',
  SCULPTURE: 'Sculpture',
  MIXED_MEDIA: 'Mixed Media',
  PRINT: 'Print',
  DRAWING: 'Drawing',
  OTHER: 'Other',
}

export const STATUS_LABELS: Record<ArtworkStatus, string> = {
  DRAFT: 'Draft',
  AVAILABLE: 'Available',
  SOLD: 'Sold',
  ON_EXHIBITION: 'On Exhibition',
  ARCHIVED: 'Archived',
}