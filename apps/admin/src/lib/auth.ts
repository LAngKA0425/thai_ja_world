import { adminApiClient } from './api-client'

export interface AdminUser {
  id: string
  email: string
  nickname: string
  isAdmin: boolean
}

export interface AuthResponse {
  user: AdminUser
  token: string
}

const ADMIN_TOKEN_KEY = 'admin_token'
const ADMIN_USER_KEY = 'admin_user'

export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await adminApiClient.post<AuthResponse>('/api/v1/admin/auth/login', {
      email,
      password,
    })

    if (response.user && response.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_TOKEN_KEY, response.token)
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.user))
      }
      return response
    }

    throw new Error('Invalid response from server')
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

export function getAdminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem(ADMIN_TOKEN_KEY) ?? undefined
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem(ADMIN_USER_KEY)
  return user ? JSON.parse(user) : null
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
  }
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken()
}

export async function verifyAdminAuth(): Promise<boolean> {
  try {
    const token = getAdminToken()
    if (!token) return false

    await adminApiClient.get('/api/v1/admin/auth/me', { token })
    return true
  } catch {
    logoutAdmin()
    return false
  }
}
