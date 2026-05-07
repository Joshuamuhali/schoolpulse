// ==========================================
// DEPRECATED - DO NOT USE
// ==========================================
// This file is deprecated. Use @/api instead.
// 
// Migration:
//   OLD: import { createSchoolWithOwner } from '@/lib/auth/auth-flow'
//   NEW: import { schoolsApi } from '@/api'
//
// These exports are for backwards compatibility only.
// ==========================================

import { 
  schoolsApi, 
  authApi,
  type School as NewSchool,
  type SchoolMember as NewSchoolMember,
  type CreateSchoolData as NewCreateSchoolData
} from '@/api'
import type { ApiResponse } from '@/api'

/** @deprecated Use School from @/api instead */
export interface School extends NewSchool {}

/** @deprecated Use SchoolMember from @/api instead */
export interface SchoolMember extends NewSchoolMember {}

/** @deprecated Use CreateSchoolData from @/api instead */
export interface CreateSchoolData extends NewCreateSchoolData {}

/** @deprecated Use authApi.checkSchoolMembership from @/api instead */
export async function checkUserSchoolMembership(userId: string): Promise<ApiResponse<NewSchoolMember | null>> {
  return authApi.checkSchoolMembership(userId)
}

/** @deprecated Use schoolsApi.createSchoolWithOwner from @/api instead */
export async function createSchoolWithOwner(
  schoolData: NewCreateSchoolData,
  userId: string
): Promise<ApiResponse<{ school: NewSchool; membership: NewSchoolMember }>> {
  return schoolsApi.createSchoolWithOwner(schoolData, userId)
}

/** @deprecated Use schoolsApi.getSchool from @/api instead */
export async function getSchool(schoolId: string): Promise<ApiResponse<NewSchool>> {
  return schoolsApi.getSchool(schoolId)
}

/** @deprecated Not implemented in new API */
export async function getUserProfile(userId: string): Promise<ApiResponse<any>> {
  return {
    success: false,
    data: null,
    error: 'getUserProfile is deprecated. Use authApi directly.'
  }
}
