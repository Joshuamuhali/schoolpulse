// ==========================================
// Teachers API - Backend Only (NO SUPABASE)
// ==========================================
// Pure backend API calls - REST endpoints

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface Teacher {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  subjects?: string[];
  status: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  subjects?: string[];
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  status?: string;
}

// GET ALL TEACHERS
export async function getTeachers(filters?: {
  status?: string;
  subject?: string;
  search?: string;
}): Promise<ApiResponse<Teacher[]>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.search) params.append('search', filters.search);

  return apiRequest<Teacher[]>(`/teachers?${params.toString()}`);
}

// GET TEACHER BY ID
export async function getTeacher(id: string): Promise<ApiResponse<Teacher>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Teacher>(`/teachers/${id}`);
}

// CREATE TEACHER
export async function createTeacher(data: CreateTeacherData): Promise<ApiResponse<Teacher>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Teacher>('/teachers', {
    method: 'POST',
    body: JSON.stringify({ ...data, tenantId }),
  });
}

// UPDATE TEACHER
export async function updateTeacher(id: string, data: UpdateTeacherData): Promise<ApiResponse<Teacher>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Teacher>(`/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE TEACHER
export async function deleteTeacher(id: string): Promise<ApiResponse<void>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<void>(`/teachers/${id}`, {
    method: 'DELETE',
  });
}

// GET TEACHER CLASSES
export async function getTeacherClasses(id: string): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/teachers/${id}/classes`);
}

// GET TEACHER SCHEDULE
export async function getTeacherSchedule(id: string): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/teachers/${id}/schedule`);
}
