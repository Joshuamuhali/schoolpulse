// ==========================================
// Schools API - Backend Only (NO SUPABASE)
// ==========================================
// Legacy API - replaced by tenants.api.ts for new multi-tenant system

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface School {
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

export interface SchoolMember {
  id: string;
  schoolId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface CreateSchoolData {
  name: string;
  subdomain: string;
  classStructure?: Record<string, any>;
}

// GET SCHOOL BY ID
export async function getSchool(schoolId: string): Promise<ApiResponse<School>> {
  return apiRequest<School>(`/schools/${schoolId}`);
}

// CREATE SCHOOL (LEGACY - use tenant onboarding instead)
export async function createSchool(
  schoolData: CreateSchoolData,
  userId: string
): Promise<ApiResponse<{ school: School; membership: SchoolMember }>> {
  return apiRequest<{ school: School; membership: SchoolMember }>('/schools', {
    method: 'POST',
    body: JSON.stringify({ ...schoolData, userId }),
  });
}

// GET USER'S SCHOOLS
export async function getUserSchools(userId: string): Promise<ApiResponse<School[]>> {
  return apiRequest<School[]>(`/users/${userId}/schools`);
}

// UPDATE SCHOOL
export async function updateSchool(schoolId: string, data: Partial<CreateSchoolData>): Promise<ApiResponse<School>> {
  return apiRequest<School>(`/schools/${schoolId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE SCHOOL
export async function deleteSchool(schoolId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/schools/${schoolId}`, {
    method: 'DELETE',
  });
}

// GET SCHOOL MEMBERS
export async function getSchoolMembers(schoolId: string): Promise<ApiResponse<SchoolMember[]>> {
  return apiRequest<SchoolMember[]>(`/schools/${schoolId}/members`);
}

// ADD SCHOOL MEMBER
export async function addSchoolMember(
  schoolId: string,
  userId: string,
  role: string
): Promise<ApiResponse<SchoolMember>> {
  return apiRequest<SchoolMember>(`/schools/${schoolId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role }),
  });
}

// REMOVE SCHOOL MEMBER
export async function removeSchoolMember(schoolId: string, memberId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/schools/${schoolId}/members/${memberId}`, {
    method: 'DELETE',
  });
}
