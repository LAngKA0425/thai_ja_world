import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  nickname: string
  avatar?: string
  character?: string
  points: number
  gems: number
  emailVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, nickname: string, turnstileToken?: string) => Promise<{ requiresVerification?: boolean; email?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      initializeAuth: async () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          try {
            set({ isLoading: true })
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
            if (response.ok) {
              const data = await response.json()
              set({
                user: data.user,
                token,
                isAuthenticated: true,
              })
            } else if (response.status === 401 || response.status === 403) {
              localStorage.removeItem('auth_token')
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              })
            } else {
              // Server error (500 etc) - keep token, use persisted state
              const persisted = get()
              if (persisted.user && persisted.token) {
                set({ isAuthenticated: true })
              }
            }
          } catch (error) {
            console.error('Auth initialization failed:', error)
            // Network error - do NOT clear token, keep persisted auth state
            const persisted = get()
            if (persisted.user && persisted.token) {
              set({ isAuthenticated: true })
            }
          } finally {
            set({ isLoading: false })
          }
        } else {
          set({ isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            // 이메일 인증 미완료 시 특별 처리
            if (data.requiresVerification) {
              const error = new Error(data.message || '이메일 인증이 필요합니다')
              ;(error as any).requiresVerification = true
              ;(error as any).email = data.email
              throw error
            }
            throw new Error(data.message || 'Login failed')
          }

          localStorage.setItem('auth_token', data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Login error:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signup: async (email: string, password: string, nickname: string, turnstileToken?: string) => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, nickname, turnstileToken }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Signup failed')
          }

          // 이메일 인증이 필요한 경우 토큰/로그인 처리 안 함
          if (data.requiresVerification) {
            return { requiresVerification: true, email }
          }

          // 이메일 인증 없이 바로 로그인 (fallback)
          if (data.token) {
            localStorage.setItem('auth_token', data.token)
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
            })
          }

          return {}
        } catch (error) {
          console.error('Signup error:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateProfile: async (updates: Partial<User>) => {
        const state = get()
        if (!state.user || !state.token) {
          throw new Error('Not authenticated')
        }

        try {
          set({ isLoading: true })
          const response = await fetch(`/api/users/${state.user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`,
            },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Update failed')
          }

          const data = await response.json()
          set({
            user: data.user,
          })
        } catch (error) {
          console.error('Profile update error:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
