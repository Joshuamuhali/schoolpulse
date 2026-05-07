import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useSchoolStore } from '@/stores/schoolStore'
import { checkUserSchoolMembership, getSchool, getUserProfile } from '@/lib/auth/auth-flow'

interface TenantProviderProps {
  children: React.ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user } = useAuthStore()
  const { setSchool } = useSchoolStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    loadDashboardContext()
  }, [user, setSchool])

  // Phase 1: Dashboard context loading
  const loadDashboardContext = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Step 1: Get user (already have from auth store)
      console.log('Current user:', user)

      // Step 2: Get membership
      const membershipResult = await checkUserSchoolMembership(user.id)
      if (!membershipResult.success || !membershipResult.data) {
        setError('No school membership found')
        return
      }

      console.log('User membership:', membershipResult.data)

      // Step 3: Get school
      const schoolResult = await getSchool(membershipResult.data.school_id)
      if (!schoolResult.success || !schoolResult.data) {
        setError('Failed to load school')
        return
      }

      console.log('School loaded:', schoolResult.data)

      // Step 4: Set global state
      setSchool({
        id: schoolResult.data.id,
        name: schoolResult.data.name,
        subdomain: schoolResult.data.subdomain,
        state: schoolResult.data.state as any, // Type cast for Phase 1
        features: [], // Will be loaded later
        settings: {
          theme: {
            primary_color: '#3b82f6',
            secondary_color: '#64748b'
          },
          billing: {
            base_fee: 0,
            feature_costs: {},
            student_cost: 0
          }
        }, // Will be loaded later
      })

      // State stored globally: current_user, current_school, current_role
      console.log('Dashboard context loaded successfully')
    } catch (error) {
      console.error('Error loading dashboard context:', error)
      setError('Failed to load dashboard context')
    } finally {
      setIsLoading(false)
    }
  }

  const applyTheme = (theme: any) => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.style.setProperty('--primary', theme.primary_color)
    root.style.setProperty('--secondary', theme.secondary_color)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading school data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
