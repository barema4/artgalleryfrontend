// Blog Types

export type BlogPostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

export interface BlogTag {
  id: string
  name: string
  slug: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  authorName: string
  status: BlogPostStatus
  featured: boolean
  viewCount: number
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
  tags?: BlogTag[]
  commentCount: number
}

export interface CreateBlogPostData {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  authorName: string
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  status?: BlogPostStatus
  scheduledAt?: string
}

export interface UpdateBlogPostData {
  title?: string
  excerpt?: string
  content?: string
  coverImage?: string
  authorName?: string
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  status?: BlogPostStatus
  scheduledAt?: string
  featured?: boolean
}

export interface BlogPostListParams {
  page?: number
  limit?: number
  status?: BlogPostStatus
  featured?: boolean
  search?: string
  tag?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'title'
}

export interface BlogPostListResponse {
  data: BlogPost[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PopularTag {
  name: string
  slug: string
  count: number
}
