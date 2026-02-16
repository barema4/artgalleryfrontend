export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

export interface MagazineEdition {
  id: string
  issueNumber: number
  title: string
  slug: string
  description?: string
  coverImage: string
  pdfUrl?: string
  publishedAt?: string
  featured: boolean
  createdAt: string
  updatedAt: string
  articleCount: number
}

export interface CreateMagazineEditionData {
  issueNumber: number
  title: string
  slug: string
  description?: string
  coverImage: string
  pdfUrl?: string
  featured?: boolean
}

export interface UpdateMagazineEditionData {
  title?: string
  description?: string
  coverImage?: string
  pdfUrl?: string
  featured?: boolean
}

export interface MagazineEditionListParams {
  page?: number
  limit?: number
  featured?: boolean
  published?: boolean
  sortBy?: 'newest' | 'oldest' | 'issue_asc' | 'issue_desc'
}

export interface MagazineEditionListResponse {
  data: MagazineEdition[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
  articleCount: number
}

export interface CreateArticleCategoryData {
  name: string
  slug: string
  description?: string
}

export interface UpdateArticleCategoryData {
  name?: string
  description?: string
}

export interface ArticleTag {
  id: string
  name: string
  slug: string
}

export interface Article {
  id: string
  editionId?: string
  categoryId?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  authorName: string
  authorBio?: string
  authorImage?: string
  status: ArticleStatus
  featured: boolean
  viewCount: number
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
  edition?: Partial<MagazineEdition>
  category?: Partial<ArticleCategory>
  tags?: ArticleTag[]
  commentCount: number
}

export interface CreateArticleData {
  editionId?: string
  categoryId?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  authorName: string
  authorBio?: string
  authorImage?: string
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  status?: ArticleStatus
  scheduledAt?: string
}

export interface UpdateArticleData {
  editionId?: string
  categoryId?: string
  title?: string
  excerpt?: string
  content?: string
  coverImage?: string
  authorName?: string
  authorBio?: string
  authorImage?: string
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  status?: ArticleStatus
  featured?: boolean
  scheduledAt?: string
}

export interface ArticleListParams {
  page?: number
  limit?: number
  editionId?: string
  categoryId?: string
  status?: ArticleStatus
  featured?: boolean
  search?: string
  tag?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'title'
}

export interface ArticleListResponse {
  data: Article[]
  total: number
  page: number
  limit: number
  totalPages: number
}
