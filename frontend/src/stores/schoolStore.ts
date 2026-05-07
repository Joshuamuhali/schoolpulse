import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SchoolState = 'DRAFT' | 'PENDING_SETUP' | 'CONFIGURING' | 'READY' | 'ACTIVE' | 'OVERDUE' | 'SUSPENDED' | 'ARCHIVED'

export interface School {
  id: string
  name: string
  subdomain: string
  state: SchoolState
  features: string[]
  settings: {
    theme: {
      primary_color: string
      secondary_color: string
      logo_url?: string
    }
    billing: {
      base_fee: number
      feature_costs: Record<string, number>
      student_cost: number
    }
  }
}

interface SchoolStateStore {
  school: School | null
  isLoading: boolean
  setSchool: (school: School | null) => void
  updateSchoolState: (state: SchoolState) => void
  updateFeatures: (features: string[]) => void
  updateTheme: (theme: Partial<School['settings']['theme']>) => void
}

export const useSchoolStore = create<SchoolStateStore>()(
  persist(
    (set, get) => ({
      school: null,
      isLoading: false,

      setSchool: (school: School | null) => {
        set({ school })
      },

      updateSchoolState: (state: SchoolState) => {
        const { school } = get()
        if (school) {
          set({
            school: {
              ...school,
              state,
            },
          })
        }
      },

      updateFeatures: (features: string[]) => {
        const { school } = get()
        if (school) {
          set({
            school: {
              ...school,
              features,
            },
          })
        }
      },

      updateTheme: (theme: Partial<School['settings']['theme']>) => {
        const { school } = get()
        if (school) {
          set({
            school: {
              ...school,
              settings: {
                ...school.settings,
                theme: {
                  ...school.settings.theme,
                  ...theme,
                },
              },
            },
          })
        }
      },
    }),
    {
      name: 'school-storage',
      partialize: (state) => ({
        school: state.school,
      }),
    }
  )
)
