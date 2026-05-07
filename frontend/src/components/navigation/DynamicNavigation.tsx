import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSchoolStore } from '@/stores/schoolStore'
import { useTenantContext } from '@/lib/tenant/resolver'
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  FileText, 
  DollarSign, 
  Settings,
  Home,
  BookOpen,
  CreditCard
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredFeature?: string
  requiredPermission?: string
  order: number
}

export function DynamicNavigation() {
  const location = useLocation()
  const { school } = useSchoolStore()
  const tenant = useTenantContext()

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard',
      icon: Home,
      order: 0,
    },
    {
      id: 'students',
      label: 'Students',
      href: '/dashboard/students',
      icon: Users,
      requiredFeature: 'students',
      requiredPermission: 'view_students',
      order: 1,
    },
    {
      id: 'teachers',
      label: 'Teachers',
      href: '/dashboard/teachers',
      icon: GraduationCap,
      requiredFeature: 'teachers',
      requiredPermission: 'view_teachers',
      order: 2,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      href: '/dashboard/attendance',
      icon: Calendar,
      requiredFeature: 'attendance',
      requiredPermission: 'view_attendance',
      order: 3,
    },
    {
      id: 'exams',
      label: 'Exams',
      href: '/dashboard/exams',
      icon: FileText,
      requiredFeature: 'exams',
      requiredPermission: 'view_exams',
      order: 4,
    },
    {
      id: 'finance',
      label: 'Finance',
      href: '/dashboard/finance',
      icon: DollarSign,
      requiredFeature: 'finance',
      requiredPermission: 'view_finance',
      order: 5,
    },
    {
      id: 'billing',
      label: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
      requiredFeature: 'billing',
      requiredPermission: 'manage_billing',
      order: 6,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      requiredPermission: 'manage_settings',
      order: 7,
    },
  ]

  const filteredItems = navigationItems
    .filter(item => {
      // Always show overview
      if (item.id === 'overview') return true
      
      // Check if feature is enabled
      if (item.requiredFeature && !school?.features.includes(item.requiredFeature)) {
        return false
      }
      
      // Check if user has permission
      if (item.requiredPermission && !tenant?.permissions.includes(item.requiredPermission)) {
        return false
      }
      
      return true
    })
    .sort((a, b) => a.order - b.order)

  return (
    <nav className="space-y-2">
      {filteredItems.map((item) => {
        const isActive = location.pathname === item.href
        const Icon = item.icon
        
        return (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

// Hook to get navigation items for other components
export function useNavigationItems() {
  const { school } = useSchoolStore()
  const tenant = useTenantContext()

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard',
      icon: Home,
      order: 0,
    },
    {
      id: 'students',
      label: 'Students',
      href: '/dashboard/students',
      icon: Users,
      requiredFeature: 'students',
      requiredPermission: 'view_students',
      order: 1,
    },
    {
      id: 'teachers',
      label: 'Teachers',
      href: '/dashboard/teachers',
      icon: GraduationCap,
      requiredFeature: 'teachers',
      requiredPermission: 'view_teachers',
      order: 2,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      href: '/dashboard/attendance',
      icon: Calendar,
      requiredFeature: 'attendance',
      requiredPermission: 'view_attendance',
      order: 3,
    },
    {
      id: 'exams',
      label: 'Exams',
      href: '/dashboard/exams',
      icon: FileText,
      requiredFeature: 'exams',
      requiredPermission: 'view_exams',
      order: 4,
    },
    {
      id: 'finance',
      label: 'Finance',
      href: '/dashboard/finance',
      icon: DollarSign,
      requiredFeature: 'finance',
      requiredPermission: 'view_finance',
      order: 5,
    },
    {
      id: 'billing',
      label: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
      requiredFeature: 'billing',
      requiredPermission: 'manage_billing',
      order: 6,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      requiredPermission: 'manage_settings',
      order: 7,
    },
  ]

  return navigationItems
    .filter(item => {
      if (item.id === 'overview') return true
      
      if (item.requiredFeature && !school?.features.includes(item.requiredFeature)) {
        return false
      }
      
      if (item.requiredPermission && !tenant?.permissions.includes(item.requiredPermission)) {
        return false
      }
      
      return true
    })
    .sort((a, b) => a.order - b.order)
}
