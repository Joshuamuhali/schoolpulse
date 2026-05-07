// ==========================================
// Pupils API - Backend Only (NO SUPABASE)
// ==========================================
// Pure backend API calls - REST endpoints

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface Pupil {
  id: string;
  tenantId: string;
  pupilNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  classId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: string;
  status: string;
  enrollmentDate: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePupilData {
  pupilNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  classId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: string;
}

export interface UpdatePupilData extends Partial<CreatePupilData> {
  status?: string;
  classId?: string;
}

// GET ALL PUPILS
export async function getPupils(filters?: {
  classId?: string;
  status?: string;
  search?: string;
}): Promise<ApiResponse<Pupil[]>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  const params = new URLSearchParams();
  if (filters?.classId) params.append('classId', filters.classId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  return apiRequest<Pupil[]>(`/pupils?${params.toString()}`);
}

// GET PUPIL BY ID
export async function getPupil(id: string): Promise<ApiResponse<Pupil>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Pupil>(`/pupils/${id}`);
}

// CREATE PUPIL
export async function createPupil(data: CreatePupilData): Promise<ApiResponse<Pupil>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Pupil>('/pupils', {
    method: 'POST',
    body: JSON.stringify({ ...data, tenantId }),
  });
}

// UPDATE PUPIL
export async function updatePupil(id: string, data: UpdatePupilData): Promise<ApiResponse<Pupil>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Pupil>(`/pupils/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE PUPIL
export async function deletePupil(id: string): Promise<ApiResponse<void>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<void>(`/pupils/${id}`, {
    method: 'DELETE',
  });
}

// GET PUPIL ATTENDANCE
export async function getPupilAttendance(id: string): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/pupils/${id}/attendance`);
}

// GET PUPIL FEES
export async function getPupilFees(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/pupils/${id}/fees`);
}
