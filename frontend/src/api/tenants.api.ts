// ==========================================
// Tenants API - School Management
// ==========================================

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'PENDING' | 'TRIAL' | 'AWAITING_PAYMENT' | 'ACTIVE' | 'SUSPENDED';
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardTenantData {
  schoolName: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface OnboardResponse {
  tenant: {
    id: string;
    subdomain: string;
  };
  user: {
    id: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// ONBOARD TENANT - Create school + master account
export async function onboardTenant(data: OnboardTenantData): Promise<ApiResponse<OnboardResponse>> {
  return apiRequest<OnboardResponse>('/tenants/onboard', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// GET CURRENT TENANT
export async function getCurrentTenant(): Promise<ApiResponse<Tenant>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Tenant>(`/tenants/${tenantId}`);
}

// UPDATE TENANT BRANDING
export async function updateTenantBranding(tenantId: string, branding: {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}): Promise<ApiResponse<Tenant>> {
  return apiRequest<Tenant>(`/tenants/${tenantId}/branding`, {
    method: 'PATCH',
    body: JSON.stringify(branding),
  });
}

// UPDATE TENANT SETTINGS
export async function updateTenantSettings(tenantId: string, settings: Record<string, any>): Promise<ApiResponse<Tenant>> {
  return apiRequest<Tenant>(`/tenants/${tenantId}/settings`, {
    method: 'PATCH',
    body: JSON.stringify({ settings }),
  });
}

// RESOLVE TENANT BY SUBDOMAIN
export async function resolveTenant(subdomain: string): Promise<ApiResponse<Tenant>> {
  return apiRequest<Tenant>(`/tenants/resolve/${subdomain}`);
}
