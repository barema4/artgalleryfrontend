import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  VerifyEmailData,
} from '~/types/auth'

export function useAuthService() {
  const api = useApi()

  return {
    login: (credentials: LoginCredentials) =>
      api.post<AuthResponse>('/auth/login', credentials),

    register: (data: RegisterData) =>
      api.post<AuthResponse>('/auth/register', data),

    logout: () =>
      api.post<void>('/auth/logout'),

    refreshToken: (refreshToken: string) =>
      api.post<AuthResponse>('/auth/refresh', { refreshToken }),

    forgotPassword: (data: ForgotPasswordData) =>
      api.post<{ message: string }>('/auth/forgot-password', data),

    resetPassword: (data: ResetPasswordData) =>
      api.post<{ message: string }>('/auth/reset-password', data),

    changePassword: (data: ChangePasswordData) =>
      api.post<{ message: string }>('/auth/change-password', data),

    verifyEmail: (data: VerifyEmailData) =>
      api.post<{ message: string }>('/auth/verify-email', data),

    resendVerificationEmail: () =>
      api.post<{ message: string }>('/auth/resend-verification'),
  }
}
