// ============================================
// Enums
// ============================================

export enum ExhibitionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum ExhibitionType {
  VIRTUAL_TOUR = 'VIRTUAL_TOUR',
  GALLERY = 'GALLERY',
  FEATURED = 'FEATURED',
  POPUP = 'POPUP',
}

// ============================================
// Base Exhibition Types
// ============================================

export interface Exhibition {
  id: string
  slug: string
  title: string
  description?: string
  shortDescription?: string
  coverImage?: string
  type: ExhibitionType
  status: ExhibitionStatus
  startDate?: string
  endDate?: string
  featured: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  artists?: ExhibitionArtist[]
  artworks?: ExhibitionArtwork[]
  virtualTour?: VirtualTour
  artworkCount: number
  artistCount: number
  commentCount: number
}

export interface ExhibitionArtist {
  id: string
  slug: string
  displayName: string
  profileImage?: string
  verified: boolean
  isCurator: boolean
}

export interface ExhibitionArtwork {
  id: string
  slug: string
  title: string
  primaryImage?: string
  sortOrder: number
  roomId?: string
  positionX?: number
  positionY?: number
  positionZ?: number
  artist?: {
    id: string
    displayName: string
    slug: string
  }
}

// ============================================
// Virtual Tour Types
// ============================================

export interface VirtualTour {
  id: string
  config?: Record<string, unknown>
  rooms: VirtualRoom[]
}

export interface VirtualRoom {
  id: string
  name: string
  panoramaUrl?: string
  floorPlanUrl?: string
  sortOrder: number
  config?: Record<string, unknown>
}

// ============================================
// Create/Update DTOs
// ============================================

export interface CreateExhibitionData {
  slug: string
  title: string
  description?: string
  shortDescription?: string
  coverImage?: string
  type?: ExhibitionType
  startDate?: string
  endDate?: string
  artworkIds?: string[]
  artistIds?: string[]
}

export interface UpdateExhibitionData {
  title?: string
  description?: string
  shortDescription?: string
  coverImage?: string
  type?: ExhibitionType
  status?: ExhibitionStatus
  startDate?: string
  endDate?: string
}

export interface UpdateExhibitionStatusData {
  status: ExhibitionStatus
}

// ============================================
// Artwork Management DTOs
// ============================================

export interface AddArtworkToExhibitionData {
  artworkId: string
  sortOrder?: number
  roomId?: string
  positionX?: number
  positionY?: number
  positionZ?: number
}

export interface UpdateArtworkPositionData {
  sortOrder?: number
  roomId?: string
  positionX?: number
  positionY?: number
  positionZ?: number
}

// ============================================
// Artist Management DTOs
// ============================================

export interface AddArtistToExhibitionData {
  artistId: string
  isCurator?: boolean
}

// ============================================
// Virtual Tour DTOs
// ============================================

export interface CreateVirtualTourData {
  config?: Record<string, unknown>
}

export interface CreateVirtualRoomData {
  name: string
  panoramaUrl?: string
  floorPlanUrl?: string
  sortOrder?: number
  config?: Record<string, unknown>
}

export interface UpdateVirtualRoomData {
  name?: string
  panoramaUrl?: string
  floorPlanUrl?: string
  sortOrder?: number
  config?: Record<string, unknown>
}

// ============================================
// Query/List Types
// ============================================

export interface ExhibitionListParams {
  page?: number
  limit?: number
  status?: ExhibitionStatus
  type?: ExhibitionType
  featured?: boolean
  search?: string
  artistId?: string
  sortBy?: 'newest' | 'oldest' | 'start_date' | 'end_date' | 'popular' | 'title'
  upcoming?: boolean
  live?: boolean
  past?: boolean
}

export interface ExhibitionListResponse {
  data: Exhibition[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// Stats Types
// ============================================

export interface ExhibitionStats {
  viewCount: number
  artworkCount: number
  artistCount: number
  commentCount: number
}
