import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { checkUserSchoolMembership } from '@/lib/auth/auth-flow'

interface AuthRedirectHandlerProps {
  children: React.ReactNode
}

export function AuthRedirectHandler({ children }: AuthRedirectHandlerProps) {
  const navigate = useNavigate()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    // Phase 1: Only proceed if user is authenticated
    if (!isLoading && user) {
      // Check if user has school membership
      const checkMembership = async () => {
        const result = await checkUserSchoolMembership(user.id)
        
        if (result.success) {
          // Decision point from Phase 1 workflow
          if (result.data) {
            // Case A: User HAS school -> redirect to dashboard
            navigate('/dashboard')
          } else {
            // Case B: User has NO school -> redirect to onboarding
            navigate('/onboarding/create-school')
          }
        } else {
          // Error checking membership - could redirect to error page
          console.error('Error checking school membership:', result.error)
          navigate('/auth')
        }
      }

      checkMembership()
    }
  }, [user, isLoading, navigate])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, show children (login/signup forms)
  if (!user) {
    return <>{children}</>
  }

  // User is authenticated, membership check in progress
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your workspace...</p>
      </div>
    </div>
  )
}
