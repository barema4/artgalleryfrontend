export type UserRole = 'ADMIN' | 'ARTIST' | 'SUBSCRIBER' | 'GUEST'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
export type NewsletterFrequency = 'daily' | 'weekly' | 'monthly' | 'never'

export interface UserProfile {
  id?: string
  userId?: string
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string
  bio?: string
  phone?: string
  country?: string
  city?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserPreferences {
  id: string
  userId: string
  newsletterFrequency: NewsletterFrequency
  artInterests: string[]
  emailNotifications: boolean
  pushNotifications: boolean
  createdAt: string
  updatedAt: string
}

export interface UserArtistProfile {
  id: string
  slug: string
  displayName: string
  verified: boolean
  featured: boolean
  artworkCount: number
  followerCount: number
}

export interface User {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  profile?: UserProfile
  preferences?: UserPreferences
  artistProfile?: UserArtistProfile
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string
  bio?: string
  phone?: string
  country?: string
  city?: string
}

export interface UpdatePreferencesData {
  newsletterFrequency?: NewsletterFrequency
  artInterests?: string[]
  emailNotifications?: boolean
  pushNotifications?: boolean
}

export interface UpdateUserStatusData {
  status: UserStatus
}

export interface UserListParams {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
}

export interface UserListResponse {
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}
