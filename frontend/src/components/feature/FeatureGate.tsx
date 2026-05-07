import React from 'react'
import { useSchoolStore } from '@/stores/schoolStore'
import { useTenantContext } from '@/lib/tenant/resolver'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { school } = useSchoolStore()
  const tenant = useTenantContext()

  // Check if feature is enabled for the school
  const isFeatureEnabled = school?.features.includes(feature) || false

  // Check if user has permission to access this feature
  const hasPermission = tenant?.permissions.includes(`manage_${feature}`) || 
                       tenant?.permissions.includes(`view_${feature}`) || false

  if (!isFeatureEnabled || !hasPermission) {
    return fallback || null
  }

  return <>{children}</>
}

// Hook for feature gating
export function useFeatureGate(feature: string) {
  const { school } = useSchoolStore()
  const tenant = useTenantContext()

  const isFeatureEnabled = school?.features.includes(feature) || false
  const hasPermission = tenant?.permissions.includes(`manage_${feature}`) || 
                       tenant?.permissions.includes(`view_${feature}`) || false

  return {
    canAccess: isFeatureEnabled && hasPermission,
    isFeatureEnabled,
    hasPermission,
  }
}
