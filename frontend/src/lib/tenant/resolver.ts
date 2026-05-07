import { useAuthStore } from '@/stores/authStore'
import { useSchoolStore } from '@/stores/schoolStore'

export interface TenantContext {
  schoolId: string
  subdomain?: string
  role: string
  permissions: string[]
}

/**
 * Extract tenant information from current context
 * Priority: JWT claims > Subdomain > Local storage
 */
export function getTenantContext(): TenantContext | null {
  const { user } = useAuthStore.getState()
  const { school } = useSchoolStore.getState()

  if (!user?.school_id) {
    return null
  }

  // Extract from JWT user metadata (primary source)
  const schoolId = user.school_id
  const role = user.role

  // Get subdomain from URL if available
  const subdomain = getSubdomainFromWindow()

  // Get permissions based on role
  const permissions = getPermissionsForRole(role)

  return {
    schoolId,
    subdomain,
    role,
    permissions,
  }
}

/**
 * Extract subdomain from current window location
 * Example: 'school-name.schoolpulse.com' -> 'school-name'
 */
function getSubdomainFromWindow(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // Return subdomain if we have more than 2 parts (subdomain.domain.tld)
  if (parts.length > 2) {
    return parts[0]
  }
  
  return undefined
}

/**
 * Get permissions for a given role
 */
function getPermissionsForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    school_admin: [
      'manage_users',
      'manage_students',
      'manage_teachers',
      'manage_attendance',
      'manage_exams',
      'manage_finance',
      'manage_settings',
      'view_reports',
      'manage_billing',
    ],
    teacher: [
      'view_students',
      'manage_attendance',
      'manage_exams',
      'view_reports',
      'manage_grades',
    ],
    student: [
      'view_own_attendance',
      'view_own_grades',
      'view_own_schedule',
    ],
    bursar: [
      'manage_finance',
      'view_students',
      'manage_billing',
      'view_reports',
    ],
    parent: [
      'view_child_attendance',
      'view_child_grades',
      'view_child_schedule',
      'make_payments',
    ],
  }

  return rolePermissions[role] || []
}

/**
 * Check if current user has permission for a specific action
 */
export function hasPermission(permission: string): boolean {
  const tenant = getTenantContext()
  return tenant?.permissions.includes(permission) || false
}

/**
 * Check if current user can access a specific feature
 */
export function canAccessFeature(feature: string): boolean {
  const { school } = useSchoolStore.getState()
  return school?.features.includes(feature) || false
}

/**
 * Hook for React components to get tenant context
 */
export function useTenantContext(): TenantContext | null {
  const { user } = useAuthStore()
  const { school } = useSchoolStore()

  if (!user?.school_id) {
    return null
  }

  const schoolId = user.school_id
  const role = user.role
  const subdomain = getSubdomainFromWindow()
  const permissions = getPermissionsForRole(role)

  return {
    schoolId,
    subdomain,
    role,
    permissions,
  }
}
