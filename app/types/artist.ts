export interface Artist {
  id: string
  userId: string
  slug: string
  displayName: string
  bio?: string
  statement?: string
  profileImage?: string
  coverImage?: string
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
  location?: string
  verified: boolean
  featured: boolean
  viewCount: number
  followerCount: number
  artworkCount: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
}

export interface ArtistStats {
  viewCount: number
  likeCount: number
  followerCount: number
  artworkCount: number
  exhibitionCount: number
  totalSales?: number
  totalRevenue?: number
  averagePrice?: number
}

export interface CreateArtistData {
  slug: string
  displayName: string
  bio?: string
  statement?: string
  profileImage?: string
  coverImage?: string
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
}

export interface UpdateArtistData {
  displayName?: string
  bio?: string
  statement?: string
  profileImage?: string
  coverImage?: string
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
}

export interface ArtistListParams {
  page?: number
  limit?: number
  verified?: boolean
  featured?: boolean
  search?: string
  sortBy?: 'newest' | 'popular' | 'name'
}

export interface ArtistListResponse {
  data: Artist[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FollowArtistGuestData {
  email: string
}
