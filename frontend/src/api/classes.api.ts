// ==========================================
// Classes API - Backend Only (NO SUPABASE)
// ==========================================
// Pure backend API calls - REST endpoints

import { apiRequest, getCurrentTenantId } from './adapters/backend';
import type { ApiResponse } from './client';

export interface Class {
  id: string;
  tenantId: string;
  name: string;
  grade: string;
  stream?: string;
  capacity: number;
  currentStudents: number;
  classTeacherId?: string;
  subjects?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassData {
  name: string;
  grade: string;
  stream?: string;
  capacity?: number;
  classTeacherId?: string;
  subjects?: string[];
}

export interface UpdateClassData extends Partial<CreateClassData> {
  status?: string;
  classTeacherId?: string;
}

// GET ALL CLASSES
export async function getClasses(filters?: {
  grade?: string;
  status?: string;
  teacherId?: string;
}): Promise<ApiResponse<Class[]>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  const params = new URLSearchParams();
  if (filters?.grade) params.append('grade', filters.grade);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.teacherId) params.append('teacherId', filters.teacherId);

  return apiRequest<Class[]>(`/classes?${params.toString()}`);
}

// GET CLASS BY ID
export async function getClass(id: string): Promise<ApiResponse<Class>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Class>(`/classes/${id}`);
}

// CREATE CLASS
export async function createClass(data: CreateClassData): Promise<ApiResponse<Class>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Class>('/classes', {
    method: 'POST',
    body: JSON.stringify({ ...data, tenantId, capacity: data.capacity || 40 }),
  });
}

// UPDATE CLASS
export async function updateClass(id: string, data: UpdateClassData): Promise<ApiResponse<Class>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<Class>(`/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE CLASS
export async function deleteClass(id: string): Promise<ApiResponse<void>> {
  const tenantId = getCurrentTenantId();
  if (!tenantId) {
    return {
      success: false,
      data: null,
      error: 'No tenant context',
    };
  }

  return apiRequest<void>(`/classes/${id}`, {
    method: 'DELETE',
  });
}

// GET CLASS PUPILS
export async function getClassPupils(id: string): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/classes/${id}/pupils`);
}

// GET CLASS TEACHER
export async function getClassTeacher(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/classes/${id}/teacher`);
}

// GET CLASS SCHEDULE
export async function getClassSchedule(id: string): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/classes/${id}/schedule`);
}
