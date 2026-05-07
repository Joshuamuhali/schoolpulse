import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, type User } from '@/api'

export type { User }

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  getSession: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      // Initialize session on store creation
      initialize: async () => {
        await get().getSession()
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const result = await authApi.login(email, password)

          if (!result.success || !result.data) {
            set({ isLoading: false })
            return { success: false, error: result.error || 'Login failed' }
          }

          const { user, session } = result.data

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const result = await authApi.signUp(email, password)

          if (!result.success || !result.data) {
            set({ isLoading: false })
            return { success: false, error: result.error || 'Sign up failed' }
          }

          const { user, session } = result.data

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Sign up failed' 
          }
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      getSession: async () => {
        try {
          set({ isLoading: true })
          
          const result = await authApi.getSession()
          
          if (!result.success) {
            set({ isLoading: false })
            return
          }

          if (result.data) {
            const { user, session } = result.data

            set({
              user,
              session,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Get session error:', error)
          set({ isLoading: false })
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
