// Comment Types

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type CommentTargetType = 'artwork' | 'exhibition' | 'article' | 'blogPost'

export interface CommentUser {
  id: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface CommentReply {
  id: string
  userId: string
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
  user?: CommentUser
}

export interface Comment {
  id: string
  userId: string
  artworkId?: string
  exhibitionId?: string
  articleId?: string
  blogPostId?: string
  parentId?: string
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
  user?: CommentUser
  replies?: CommentReply[]
  replyCount: number
}

export interface CreateCommentData {
  content: string
  artworkId?: string
  exhibitionId?: string
  articleId?: string
  blogPostId?: string
  parentId?: string
}

export interface UpdateCommentData {
  content: string
}

export interface UpdateCommentStatusData {
  status: CommentStatus
}

export interface CommentListParams {
  page?: number
  limit?: number
  sortBy?: 'newest' | 'oldest'
  status?: CommentStatus
}

export interface CommentListResponse {
  data: Comment[]
  total: number
  page: number
  limit: number
  totalPages: number
}
