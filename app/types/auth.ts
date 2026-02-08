import type { User, UserProfile } from './user'

export type { User, UserProfile }

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface VerifyEmailData {
  token: string
}
