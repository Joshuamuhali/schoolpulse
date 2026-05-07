// ==========================================
// Feature Flags - Control Feature Visibility
// ==========================================
// Use this to hide incomplete or placeholder features

type Feature = 
  | 'FINANCE'
  | 'BILLING'
  | 'PAYMENTS'
  | 'COMMUNICATIONS'
  | 'TIMETABLE'
  | 'REPORTS'
  | 'IMPORT_EXPORT'
  | 'BULK_OPERATIONS';

// Feature flag configuration
const FEATURE_CONFIG: Record<Feature, boolean> = {
  // Core features - ENABLED
  FINANCE: false,      // Placeholder only - not implemented
  BILLING: false,      // Placeholder only - not implemented
  PAYMENTS: false,     // Placeholder only - not implemented
  
  // Future features - DISABLED
  COMMUNICATIONS: false,
  TIMETABLE: false,
  REPORTS: false,
  IMPORT_EXPORT: false,
  BULK_OPERATIONS: false,
};

// Check if feature is enabled
export function isFeatureEnabled(feature: Feature): boolean {
  // Allow override via environment variable
  const envOverride = import.meta.env[`VITE_FEATURE_${feature}`];
  if (envOverride !== undefined) {
    return envOverride === 'true';
  }
  
  return FEATURE_CONFIG[feature];
}

// Hook for React components
export function useFeature(feature: Feature): boolean {
  return isFeatureEnabled(feature);
}

// Get all enabled features (for debugging)
export function getEnabledFeatures(): Feature[] {
  return (Object.keys(FEATURE_CONFIG) as Feature[]).filter(
    feature => isFeatureEnabled(feature)
  );
}

// Navigation item filter
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  feature?: Feature;
}

export function filterNavItems(items: NavItem[]): NavItem[] {
  return items.filter(item => {
    if (!item.feature) return true;
    return isFeatureEnabled(item.feature);
  });
}
