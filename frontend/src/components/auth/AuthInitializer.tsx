import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthInitializerProps {
  children: React.ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    // Initialize auth session when app starts
    initialize()
  }, [initialize])

  return <>{children}</>
}
