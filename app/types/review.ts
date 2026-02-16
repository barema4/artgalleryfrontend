export interface ReviewUser {
  id: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface ReviewArtwork {
  id: string
  slug: string
  title: string
  primaryImage?: string
}

export interface Review {
  id: string
  userId: string
  artworkId: string
  rating: number
  title?: string
  content?: string
  isVerifiedPurchase: boolean
  helpful: number
  createdAt: string
  updatedAt: string
  user?: ReviewUser
  artwork?: ReviewArtwork
}

export interface CreateReviewData {
  rating: number
  title?: string
  content?: string
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  content?: string
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface ReviewListParams {
  page?: number
  limit?: number
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
  minRating?: number
}

export interface ReviewListResponse {
  data: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
}
