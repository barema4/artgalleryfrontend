// Category Types

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  parent?: Category
  children?: Category[]
  artworkCount?: number
}

export interface CreateCategoryData {
  name: string
  slug?: string
  description?: string
  image?: string
  parentId?: string
  sortOrder?: number
}

export interface UpdateCategoryData {
  name?: string
  slug?: string
  description?: string
  image?: string
  parentId?: string | null
  sortOrder?: number
}

export interface CategoryListParams {
  page?: number
  limit?: number
  parentId?: string | null
  search?: string
}

export interface CategoryListResponse {
  data: Category[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryTreeResponse {
  data: Category[]
}

// Tag Types

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
  artworkCount?: number
}

export interface CreateTagData {
  name: string
  slug?: string
}

export interface UpdateTagData {
  name?: string
  slug?: string
}

export interface TagListParams {
  page?: number
  limit?: number
  search?: string
}

export interface TagListResponse {
  data: Tag[]
  total: number
  page: number
  limit: number
  totalPages: number
}
